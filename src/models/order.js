import { FiCoffee, FiShoppingBag } from 'react-icons/fi'
import { MILKS, SIZES, isDrinkItem } from './menu'

export const ORDER_TYPES = [
  { label: 'Dine in', detail: 'Enjoy your order here', Icon: FiCoffee },
  { label: 'Take away', detail: 'We’ll pack it to go', Icon: FiShoppingBag },
]

export function createCartLine(item, {
  size = isDrinkItem(item) ? SIZES[0] : null,
  milk = item.milk ? MILKS[0] : null,
  quantity = 1,
} = {}) {
  const options = [size?.label, milk?.label].filter(Boolean).join(' · ')
  return {
    key: [item.id, options].join('|'),
    name: item.name,
    options,
    quantity,
    price: item.price + (size?.price ?? 0) + (milk?.price ?? 0),
  }
}

/**
 * Generate a demo order identifier.
 * @returns {string}
 */
export function createOrderId() {
  return (
    'DEMO-' +
    crypto.getRandomValues(new Uint32Array(1))[0].toString(16).padStart(8, '0').toUpperCase()
  )
}

/**
 * Create a new demo order object.
 * @param {string} mode
 * @param {Array} lines
 */
export function createOrder(mode, lines) {
  return {
    id: createOrderId(),
    createdAt: new Date(),
    mode,
    lines,
  }
}

/**
 * Add or merge a line item into the cart.
 * @param {Array} lines
 * @param {object} newLine
 */
export function addCartLine(lines, newLine) {
  const exists = lines.some((entry) => entry.key === newLine.key)
  if (exists) {
    return lines.map((entry) =>
      entry.key === newLine.key
        ? { ...entry, quantity: entry.quantity + newLine.quantity }
        : entry,
    )
  }
  return [...lines, newLine]
}

/**
 * Update quantity for a cart line, removing it when quantity reaches 0.
 * @param {Array} lines
 * @param {string} key
 * @param {number} quantity
 */
export function updateCartLineQuantity(lines, key, quantity) {
  if (quantity === 0) {
    return lines.filter((line) => line.key !== key)
  }
  return lines.map((line) => (line.key === key ? { ...line, quantity } : line))
}

/**
 * Calculate total price in cents for cart/order lines.
 * @param {Array} lines
 * @returns {number}
 */
export function calculateSubtotal(lines) {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
}

/**
 * Calculate total item count across all cart lines.
 * @param {Array} lines
 * @returns {number}
 */
export function calculateItemCount(lines) {
  return lines.reduce((sum, line) => sum + line.quantity, 0)
}
