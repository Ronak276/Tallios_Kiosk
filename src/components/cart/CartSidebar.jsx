import { FiShoppingBag } from 'react-icons/fi'
import { calculateItemCount, calculateSubtotal, formatMoney } from '../../models'
import { CartCheckout } from './CartCheckout'
import { CartItem } from './CartItem'

/**
 * Sticky order summary sidebar with line items, subtotal, and checkout CTA.
 */
export function CartSidebar({ lines, onQuantityChange, onCheckout, customizer, paymentStatus, paymentBusy }) {
  const subtotal = calculateSubtotal(lines)
  const itemCount = calculateItemCount(lines)
  const hasItems = lines.length > 0

  return (
    <aside
      id="cart"
      className="flex scroll-mt-5 flex-col self-start rounded-2xl border border-line bg-white p-4 xl:p-5 shadow-[0_8px_30px_#143f6909] md:sticky md:top-6 md:max-h-[calc(100dvh-3rem)] md:overflow-y-auto"
    >
      <h2 className="flex shrink-0 items-center gap-2 text-xl font-bold">
        <FiShoppingBag className="text-primary" /> Your order
        {hasItems && <span className="ml-auto rounded-full bg-tint px-2.5 py-1 text-xs text-primary">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>}
      </h2>
      <div className="shrink-0" inert={paymentBusy}>
        {customizer || (hasItems ? (
          <ul className="mt-2 divide-y divide-line">
            {lines.map((line) => (
              <CartItem key={line.key} line={line} onQuantityChange={onQuantityChange} />
            ))}
          </ul>
        ) : (
          <p className="mt-4 border-t border-line pt-5 text-sm text-muted">
            Add an item from the menu to start your order.
          </p>
        ))}
      </div>
      {!customizer && (
        <>
          <div className="mt-4 flex shrink-0 justify-between rounded-xl bg-wash px-3 py-3 font-bold">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <CartCheckout key={hasItems ? "active" : "empty"} subtotal={subtotal} onCheckout={onCheckout} busy={paymentBusy} />
        </>
      )}
      {paymentStatus && <p role="status" className="mt-2 text-sm text-muted">{paymentStatus}</p>}
    </aside>
  )
}

