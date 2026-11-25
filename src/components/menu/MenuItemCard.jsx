import { FiPlus } from 'react-icons/fi'
import { formatMoney } from '../../models'

export function MenuItemCard({ item, onSelect }) {
  return (
    <button
      type="button"
      aria-label={'Customize ' + item.name + ', ' + formatMoney(item.price)}
      className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-line bg-wash text-left transition-colors hover:border-primary"
      onClick={(event) => onSelect(item, event.currentTarget)}
    >
      <h3 className="flex grow items-center px-3 py-3 text-base leading-snug font-semibold">{item.name}</h3>
      <div className="relative min-h-36 w-full bg-tint">
        <img
          className="ms-auto h-36 w-[77%] rounded-tl-[3rem] object-cover"
          src={import.meta.env.BASE_URL + 'images/' + item.image}
          loading="lazy"
          alt=""
        />
        <span className="absolute bottom-2 left-2 rounded-lg bg-white px-2 py-1 text-sm font-bold">{formatMoney(item.price)}</span>
        <span className="absolute right-2 bottom-2 grid size-8 place-items-center rounded-lg bg-white text-primary group-hover:bg-primary group-hover:text-white" aria-hidden="true"><FiPlus size={18} /></span>
      </div>
    </button>
  )
}


