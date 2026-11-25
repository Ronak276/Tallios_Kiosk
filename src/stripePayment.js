const pendingKey = 'tallios-stripe-order'

export const stripeEnabled = import.meta.env.VITE_PAYMENT_MODE === 'stripe'

async function checkoutRequest(path, options) {
  const response = await fetch('/api/stripe-checkout' + path, options)
  const data = await response.json()
  if (!response.ok) throw new Error(data.error)
  return data
}

export async function openStripeCheckout(order, qr = false) {
  const { id, url } = await checkoutRequest('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: order.id, mode: order.mode, lines: order.lines.map(({ key, quantity }) => ({ key, quantity })) }),
  })
  if (new URL(url).origin !== 'https://checkout.stripe.com') throw new Error('Invalid Stripe Checkout URL.')
  const pending = { id, order, url, qr }
  sessionStorage.setItem(pendingKey, JSON.stringify(pending))
  if (qr) return pending
  window.location.assign(url)
}

export function getStripeReturn() {
  const params = new URLSearchParams(window.location.search)
  const session = params.get('stripe_session')
  const canceled = params.has('stripe_cancel')
  try {
    const pending = JSON.parse(sessionStorage.getItem(pendingKey))
    if (!pending) return null
    if (!session && !canceled && pending.qr) return pending
    if (canceled || session === pending.id) return { ...pending, qr: false, canceled }
  } catch {
    // An unreadable browser session cannot be associated with an order.
  }
  return null
}

export async function verifyStripeReturn({ id }) {
  return checkoutRequest('?session=' + encodeURIComponent(id))
}

export function cancelStripeCheckout({ id }) {
  return checkoutRequest('?session=' + encodeURIComponent(id), { method: 'DELETE' })
}

export function clearStripeReturn() {
  sessionStorage.removeItem(pendingKey)
  const url = new URL(window.location.href)
  url.searchParams.delete('stripe_session')
  url.searchParams.delete('stripe_cancel')
  window.history.replaceState(null, '', url)
}
