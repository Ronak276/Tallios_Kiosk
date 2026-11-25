import { useEffect, useRef, useState } from 'react'
import { FiX } from 'react-icons/fi'
import { MILKS, SIZES, formatMoney, isDrinkItem } from '../../models'
import { OptionGroup } from '../common/OptionGroup'
import { QuantitySelector } from '../common/QuantitySelector'
import { Button } from '../ui/button'


/**
 * Inline controls for customizing an item before adding it to the cart.
 */
export function ItemCustomizer({ item, onClose, onAdd }) {
  const isDrink = isDrinkItem(item)
  const [size, setSize] = useState(isDrink ? SIZES[0] : null)
  const [milk, setMilk] = useState(item.milk ? MILKS[0] : null)
  const [quantity, setQuantity] = useState(1)

  const price = item.price + (size?.price ?? 0) + (milk?.price ?? 0)
  const options = [size?.label, milk?.label].filter(Boolean).join(' · ')

  const headingRef = useRef(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  function addToOrder() {
    onAdd({ key: [item.id, options].join('|'), name: item.name, options, quantity, price })
  }

  return (
    <section aria-labelledby="customizer-title" className="mt-4 border-t border-line pt-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <div className="min-w-0 pt-1">
          <h3 id="customizer-title" ref={headingRef} tabIndex={-1} className="leading-snug font-bold focus-visible:outline-none">{item.name}</h3>
          <p className="mt-1 text-sm leading-snug text-muted">{item.description}</p>
        </div>
        <Button variant="ghost" className="size-11 bg-wash p-0" aria-label="Close item customization" onClick={onClose}>
          <FiX size={18} />
        </Button>
      </div>
      <div className="mt-3 flex flex-col items-center gap-2">
        <p className="text-2xl font-bold tabular-nums" aria-live="polite">{formatMoney(price * quantity)}</p>
        <QuantitySelector value={quantity} onChange={setQuantity} label="item quantity" />
      </div>
      {isDrink && <OptionGroup name="Cup size" options={SIZES} value={size} onChange={setSize} />}
      {item.milk && <OptionGroup name="Milk" options={MILKS} value={milk} onChange={setMilk} />}
      <Button className="mt-4 w-full" onClick={addToOrder}>Add to order</Button>
    </section>
  )
}

