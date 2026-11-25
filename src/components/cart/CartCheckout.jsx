import { useState } from 'react'
import QRCode from 'qrcode'
import { formatMoney } from '../../models'
import { stripeEnabled } from '../../stripePayment'
import { Button } from '../ui/button'

export function PaymentCode({ message, label, caption }) {
  const { modules } = QRCode.create(message, { errorCorrectionLevel: 'M' })
  const path = Array.from(modules.data, (filled, index) => {
    const x = index % modules.size
    const y = Math.floor(index / modules.size)
    return filled ? 'M' + x + ' ' + y + 'h1v1h-1z' : ''
  }).join('')

  return (
    <figure className="mt-3 rounded-xl border border-line p-3 text-center">
      <svg role="img" aria-label={label} className="mx-auto w-full max-w-64 bg-white" viewBox={[-4, -4, modules.size + 8, modules.size + 8].join(' ')} shapeRendering="crispEdges">
        <path d={path} fill="#102745" />
      </svg>
      <figcaption className="text-xs text-muted">{caption}</figcaption>
    </figure>
  )
}

export function CartCheckout({ subtotal, onCheckout }) {
  const [expanded, setExpanded] = useState(false)
  const [name, setName] = useState('')
  const [showQr, setShowQr] = useState(false)

  return (
    <>
      <Button
        className="mt-3 min-h-13 w-full shrink-0"
        disabled={!subtotal}
        aria-expanded={expanded}
        aria-controls={expanded ? 'cart-checkout' : undefined}
        onClick={() => setExpanded((open) => !open)}
      >
        Checkout
      </Button>
      {expanded && (
        <form id="cart-checkout" className="mt-3 border-t border-line pt-3" onSubmit={(event) => {
          event.preventDefault()
          onCheckout(event.nativeEvent.submitter, name.trim())
        }}>
          <label htmlFor="order-name" className="block text-sm font-semibold">
            Name for the order <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="order-name"
            autoComplete="off"
            maxLength={60}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-line bg-white px-3 text-base"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button type="submit">Pay</Button>
            <Button variant="outline" className="bg-wash px-2 text-sm leading-tight" aria-expanded={stripeEnabled ? undefined : showQr} onClick={(event) => {
              if (stripeEnabled) onCheckout(event.currentTarget, name.trim(), true)
              else setShowQr((visible) => !visible)
            }}>
              {showQr ? 'Hide QR' : 'Get payment QR'}
            </Button>
          </div>
          {showQr && <PaymentCode message={'Tallio’s demo checkout | Total: ' + formatMoney(subtotal) + ' | No payment due'} label="Demo order total QR code" caption="Scan to view the demo total." />}
          <p className="mt-2 text-center text-xs font-semibold text-muted">{stripeEnabled ? 'Stripe test mode. No real charge is made.' : 'Demo checkout. No charge is made.'}</p>
        </form>
      )}
    </>
  )
}

