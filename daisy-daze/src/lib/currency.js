// Shared INR formatting and free-delivery threshold for every storefront view.
export const FREE_DELIVERY_MINIMUM = 1499

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function formatINR(amount) {
  return inrFormatter.format(amount)
}