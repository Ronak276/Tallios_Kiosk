import { FiTrash2 } from 'react-icons/fi'
import { formatMoney } from '../../models'
import { QuantitySelector } from '../common/QuantitySelector'
import { Button } from '../ui/button'

/**
 * Single line item inside the order cart.
 */
export function CartItem({ line, onQuantityChange }) {
  return (
    <li className="py-4">
      <div className="flex justify-between gap-2 text-sm font-bold">
        <span>{line.name}</span>
        <span className="shrink-0">{formatMoney(line.price * line.quantity)}</span>
      </div>
      {line.options && <p className="mt-1 text-sm text-muted">{line.options}</p>}
      <div className="mt-2 flex items-center justify-between">
        <QuantitySelector
          value={line.quantity}
          onChange={(value) => onQuantityChange(line.key, value)}
          label={line.name}
        />
        <Button
          variant="ghost"
          className="size-11 p-0"
          aria-label={'Remove ' + line.name}
          onClick={() => onQuantityChange(line.key, 0)}
        >
          <FiTrash2 />
        </Button>
      </div>
    </li>
  )
}
