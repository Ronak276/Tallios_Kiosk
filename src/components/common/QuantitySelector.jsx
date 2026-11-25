import { FiMinus, FiPlus } from 'react-icons/fi'
import { Button } from '../ui/button'

/**
 * Accessible stepper control for item quantities.
 */
export function QuantitySelector({ value, min = 1, onChange, label }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-line bg-white">
      <Button
        variant="ghost"
        className="size-11 p-0"
        aria-label={'Decrease ' + label}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <FiMinus />
      </Button>
      <span className="min-w-5 text-center font-bold tabular-nums" aria-live="polite">
        {value}
      </span>
      <Button
        variant="ghost"
        className="size-11 p-0"
        aria-label={'Increase ' + label}
        onClick={() => onChange(value + 1)}
      >
        <FiPlus />
      </Button>
    </div>
  )
}
