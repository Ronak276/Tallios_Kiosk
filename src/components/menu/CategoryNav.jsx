import { CATEGORIES } from '../../models'
import { Button } from '../ui/button'

/**
 * Category filter navigation bar.
 */
export function CategoryNav({ activeCategory, onSelect }) {
  return (
    <nav aria-label="Menu categories" className="flex flex-wrap gap-1.5 border-b border-line bg-wash p-2 lg:sticky lg:top-6 lg:flex-col lg:rounded-l-2xl lg:border-r lg:border-b-0">
      {CATEGORIES.map((label) => (
        <Button
          key={label}
          variant={activeCategory === label ? 'default' : 'ghost'}
          className="px-2 text-sm lg:min-h-13 lg:w-full"
          aria-pressed={activeCategory === label}
          onClick={() => onSelect(label)}
        >
          {label}
        </Button>
      ))}
    </nav>
  )
}


