import { createHmac, timingSafeEqual } from 'node:crypto'
import { MENU_ITEMS, MILKS, SIZES, isDrinkItem } from '../src/models/menu.js'

async function readBody(req, limit) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) throw new Error('Request is too large.')
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

function signedEvent(body, header, secret) {
  const parts = typeof header === 'string' ? header.split(',') : []
  const timestamp = parts.find((part) => part.startsWith('t='))?.slice(2)
  if (!timestamp || !/^\d+$/.test(timestamp) || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) throw new Error()
  const expected = createHmac('sha256', secret).update(timestamp + '.').update(body).digest()
  if (!parts.some((part) => /^v1=[a-f\d]{64}$/i.test(part) && timingSafeEqual(expected, Buffer.from(part.slice(3), 'hex')))) throw new Error()
  return JSON.parse(body.toString('utf8'))
}

function checkoutLines(lines, form) {
  if (!Array.isArray(lines) || !lines.length || lines.length > 30) throw Error()
  lines.forEach(({ key, quantity }, index) => {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw Error()
    const [id, options, ...extra] = key.split('|')
    const item = MENU_ITEMS.find((entry) => entry.id === id)
    if (!item || extra.length) throw Error()
    const choices = options ? options.split(' · ') : []
    const size = isDrinkItem(item) ? SIZES.find((option) => option.label === choices[0]) : null
    if (isDrinkItem(item)) choices.shift()
    const milk = item.milk ? MILKS.find((option) => option.label === choices[0]) : null
    if (item.milk) choices.shift()
    if (choices.length || (isDrinkItem(item) && !size) || (item.milk && !milk)) throw Error()
    const prefix = 'line_items[' + index + ']'
    form.set(prefix + '[quantity]', quantity)
    form.set(prefix + '[price_data][currency]', 'usd')
    form.set(prefix + '[price_data][unit_amount]', item.price + (size?.price ?? 0) + (milk?.price ?? 0))
    form.set(prefix + '[price_data][product_data][name]', item.name + (options ? ' · ' + options : ''))
  })
}

export function stripeCheckoutPlugin(env) {
  const secret = env.STRIPE_SECRET_KEY || ''
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET || ''
  const databaseKey = env.SUPABASE_SERVICE_ROLE_KEY || ''
  const databaseUrl = env.VITE_SUPABASE_URL
  const origin = new URL(env.STRIPE_RETURN_ORIGIN || 'http://localhost:5174').origin

  async function stripe(path, form, orderId) {
    const headers = { Authorization: 'Bearer ' + secret }
    if (orderId) headers['Idempotency-Key'] = orderId
    const result = await fetch('https://api.stripe.com/v1/checkout/sessions' + path, {
      method: form ? 'POST' : 'GET', headers, body: form, signal: AbortSignal.timeout(12000),
    })
    if (!result.ok) throw Error()
    return result.json()
  }

  async function ordersDatabase(query, options = {}) {
    if (!databaseUrl || !databaseKey) throw new Error('Order storage is not configured.')
    const headers = { apikey: databaseKey, ...options.headers }
    if (databaseKey.startsWith('eyJ')) headers.Authorization = 'Bearer ' + databaseKey
    const result = await fetch(new URL('/rest/v1/kiosk_paid_orders' + query, databaseUrl), {
      ...options, headers, signal: AbortSignal.timeout(8000),
    })
    if (!result.ok) throw new Error('Order storage is unavailable.')
  }

  async function recordPaidOrder(session) {
    if (session.livemode !== false || session.status !== 'complete' || session.payment_status !== 'paid' || session.metadata?.source !== 'tallios_kiosk') return false
    const { data, has_more } = await stripe('/' + session.id + '/line_items?limit=100')
    if (has_more || !data?.length || data.reduce((total, line) => total + line.amount_total, 0) !== session.amount_total) throw new Error('Invalid Stripe order total.')
    await ordersDatabase('?on_conflict=stripe_session_id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({
        stripe_session_id: session.id,
        order_number: session.client_reference_id,
        order_mode: session.metadata.order_mode,
        total_cents: session.amount_total,
        currency: session.currency,
        items: data.map((line) => ({ name: line.description, quantity: line.quantity, total_cents: line.amount_total })),
      }),
    })
    return true
  }

  function register(server) {
    server.middlewares.use('/api/stripe-webhook', async (req, res) => {
      if (req.method !== 'POST') return res.writeHead(405).end()
      if (!secret.startsWith('sk_test_') || !webhookSecret) return res.writeHead(503).end()
      let event
      try {
        event = signedEvent(await readBody(req, 256000), req.headers['stripe-signature'], webhookSecret)
      } catch {
        return res.writeHead(400).end()
      }
      try {
        if (event.livemode === false && event.type === 'checkout.session.completed') {
          const id = event.data?.object?.id
          if (typeof id !== 'string' || !/^cs_test_[a-z0-9]+$/i.test(id)) return res.writeHead(400).end()
          await recordPaidOrder(await stripe('/' + id))
        }
        return res.writeHead(200).end()
      } catch {
        return res.writeHead(502).end()
      }
    })
    server.middlewares.use('/api/stripe-checkout', async (req, res) => {
      function send(status, data) {
        res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
        res.end(JSON.stringify(data))
      }

      if (!secret.startsWith('sk_test_')) return send(503, { error: 'Configure a server-side Stripe test key.' })
      if (req.method === 'POST') {
        if (req.headers.origin !== origin || !req.headers['content-type']?.startsWith('application/json')) {
          return send(403, { error: 'Use the kiosk URL configured in STRIPE_RETURN_ORIGIN.' })
        }
        let form, orderId
        try {
          const cart = JSON.parse((await readBody(req, 16000)).toString())
          orderId = cart.orderId
          if (!/^TEST-[a-f0-9]{8}$/i.test(orderId)) throw Error()
          if (!['Dine in', 'Take away'].includes(cart.mode)) throw Error()
          form = new URLSearchParams({
            mode: 'payment',
            'payment_method_types[0]': 'card',
            client_reference_id: orderId,
            'metadata[source]': 'tallios_kiosk',
            'metadata[order_mode]': cart.mode,
            success_url: origin + '/?stripe_session={CHECKOUT_SESSION_ID}',
            cancel_url: origin + '/?stripe_cancel=1',
          })
          checkoutLines(cart.lines, form)
        } catch {
          return send(400, { error: 'Review your cart and try again.' })
        }
        try {
          await ordersDatabase('?select=stripe_session_id&limit=0', { method: 'HEAD' })
        } catch {
          return send(503, { error: 'Stripe checkout is unavailable until order storage is configured.' })
        }
        try {
          const session = await stripe('', form, orderId)
          return send(200, { id: session.id, url: session.url })
        } catch {
          return send(502, { error: 'Could not open Stripe Checkout. Try again.' })
        }
      }
      if (req.method === 'GET' || req.method === 'DELETE') {
        if (req.method === 'DELETE' && req.headers.origin !== origin) return send(403, { error: 'Invalid checkout origin.' })
        const id = new URL(req.url, origin).searchParams.get('session')
        if (!/^cs_test_[a-z0-9]+$/i.test(id || '')) return send(400, { error: 'Invalid session.' })
        try {
          let session = await stripe('/' + id)
          if (req.method === 'DELETE' && session.status === 'open') {
            try {
              session = await stripe('/' + id + '/expire', new URLSearchParams())
            } catch {
              session = await stripe('/' + id)
            }
          }
          return send(200, {
            paid: await recordPaidOrder(session),
            amount: session.amount_total,
            expired: session.status === 'expired',
            orderId: session.client_reference_id,
          })
        } catch {
          return send(502, { error: 'Could not verify the Stripe test payment.' })
        }
      }
      return send(405, { error: 'Unsupported method.' })
    })
  }

  return { name: 'stripe-test-checkout', configureServer: register, configurePreviewServer: register }
}
