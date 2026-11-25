import { FiCreditCard } from 'react-icons/fi'
import { calculateSubtotal, formatMoney } from '../../models'
import { Brand } from '../common/Brand'
import { Button } from '../ui/button'
import { Modal } from '../ui/dialog'

const receiptDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' })

/**
 * Modal displaying either the demo receipt or the pickup confirmation.
 */
export function CheckoutModal({ order, processing, showPickup, onPickup, onReset, onClose }) {
  if (processing) {
    return (
      <Modal
        title="Processing demo payment"
        description={formatMoney(calculateSubtotal(order.lines)) + ' · No charge is made'}
        onClose={onClose}
        className="text-center [&>h2]:pr-0 [&>h2]:text-xl [&>p]:text-sm"
        icon={
          <div className="relative mx-auto mb-4 grid size-16 place-items-center text-primary" aria-hidden="true">
            <span className="absolute inset-0 rounded-full border-[3px] border-line border-t-primary motion-safe:animate-spin" />
            <FiCreditCard size={23} />
          </div>
        }
      />
    )
  }

  if (showPickup) {
    return (
      <Modal
        title="Order confirmed"
        description={'Order ' + order.id.replace(/^(DEMO|TEST)-/, '')}
        onClose={onClose}
        className="max-w-[30rem] border border-line text-center [&>h2]:pr-0 [&>h2]:text-xl [&>p]:mt-2 [&>p]:text-2xl [&>p]:font-bold [&>p]:text-ink"
        icon={<div className="mb-2 text-xs font-bold tracking-widest text-primary">{order.stripePaid ? 'Stripe test order' : 'Demo order'}</div>}
      >
        <div className="mt-1 text-sm text-muted">{order.id} · {order.mode}</div>
        <div className="my-4 rounded-xl bg-tint px-4 py-4">
          <p className="text-sm font-medium text-muted">Estimated ready in</p>
          <p className="mt-1 text-2xl font-bold text-primary">8–12 min</p>
          <p className="mt-1 text-xs text-muted">Demo estimate</p>
        </div>
        <Button className="w-full" onClick={onReset}>
          Start a new order
        </Button>
      </Modal>
    )
  }

  return (
    <Modal
      title={order.stripePaid ? "Stripe test receipt" : "Demo receipt"}
      description={order.stripePaid ? "Stripe confirmed the test payment. No real charge was made." : "No payment was collected."}
      onClose={onClose}
      className="max-w-[30rem] border border-line [&>h2]:pr-0 [&>h2]:text-center [&>p]:text-center [&>p]:text-sm"
      icon={
        <div className="mb-2 text-center">
          <Brand className="mx-auto w-12" decorative />
          <p className="mt-2 text-xs font-bold tracking-widest text-primary">TALLIO’S COFFEE & TEA CO.</p>
        </div>
      }
    >
      <div className="mt-2 break-words text-center text-sm text-muted">
        <p>Order {order.id} · {order.mode}</p>
        {order.createdAt && (
          <time className="text-xs" dateTime={order.createdAt.toISOString()}>{receiptDate.format(order.createdAt)}</time>
        )}
        {order.customerName && <p className="mt-1">Name for the order: {order.customerName}</p>}
      </div>
      <div className="mt-5 rounded-xl border border-line bg-wash px-4">
        <ul className="divide-y divide-dashed divide-line">
          {order.lines.map((line) => (
            <li key={line.key} className="flex justify-between gap-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="font-semibold">{line.quantity} × {line.name}</p>
                {line.options && <p className="text-xs text-muted">{line.options}</p>}
              </div>
              <span className="shrink-0 font-bold tabular-nums">{formatMoney(line.price * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between gap-4 border-t border-dashed border-line py-3 text-sm font-bold">
          <span>Order total</span>
          <span className="tabular-nums">{formatMoney(calculateSubtotal(order.lines))}</span>
        </div>
      </div>
      <Button className="mt-4 w-full" onClick={onPickup}>See pickup details</Button>
    </Modal>
  )
}


