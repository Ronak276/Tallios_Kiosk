import { MENU_ITEMS, MILKS, SIZES, isDrinkItem } from '../src/models/menu.js'

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

  function register(server) {
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
          const chunks = []
          let bytes = 0
          for await (const chunk of req) {
            bytes += chunk.length
            if (bytes > 16000) return send(413, { error: 'Cart is too large.' })
            chunks.push(chunk)
          }
          const cart = JSON.parse(Buffer.concat(chunks).toString())
          orderId = cart.orderId
          if (!/^TEST-[a-f0-9]{8}$/i.test(orderId)) throw Error()
          form = new URLSearchParams({
            mode: 'payment',
            'payment_method_types[0]': 'card',
            client_reference_id: orderId,
            success_url: origin + '/?stripe_session={CHECKOUT_SESSION_ID}',
            cancel_url: origin + '/?stripe_cancel=1',
          })
          checkoutLines(cart.lines, form)
        } catch {
          return send(400, { error: 'Review your cart and try again.' })
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
            paid: !session.livemode && session.status === 'complete' && session.payment_status === 'paid',
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
