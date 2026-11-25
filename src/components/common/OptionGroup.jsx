import { formatMoney } from '../../models'

/**
 * Radio option group for item customization (size, milk, etc.).
 */
export function OptionGroup({ name, options, value, onChange }) {
  return (
    <fieldset className="mt-3 min-w-0">
      <legend className="mb-1.5 text-sm font-bold">{name}</legend>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <label key={option.label} className="min-w-0 cursor-pointer">
            <input
              type="radio"
              name={name}
              className="peer sr-only"
              checked={value === option}
              onChange={() => onChange(option)}
            />
            <span className="flex h-full min-h-11 flex-col items-center justify-center rounded-xl border border-line px-1.5 py-1.5 text-center text-[0.8125rem] leading-tight font-semibold peer-checked:border-primary peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-primary">
              <span>{option.label}</span>
              {option.price > 0 && <span className="text-xs tabular-nums">+{formatMoney(option.price)}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}



