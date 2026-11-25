const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

/**
 * Format an amount in cents as a USD currency string.
 * @param {number} cents
 * @returns {string}
 */
export function formatMoney(cents) {
  return currencyFormatter.format(cents / 100)
}
