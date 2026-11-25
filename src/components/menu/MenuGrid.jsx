import { MenuItemCard } from './MenuItemCard'

/**
 * Grid displaying filtered menu items with category heading and count.
 */
export function MenuGrid({ category, items, onSelectItem }) {
  return (
    <div className="min-w-0 p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">{category === 'All' ? 'Café Menu' : category}</h2>
        <span className="text-sm text-muted">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 min-[450px]:grid-cols-2 xl:grid-cols-3">
        {items.map((entry) => (
          <MenuItemCard key={entry.id} item={entry} onSelect={onSelectItem} />
        ))}
      </div>
    </div>
  )
}

