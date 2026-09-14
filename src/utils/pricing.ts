export const TICKET_PRICE_RATE = 0.07

export function getTicketPrice(price: number): number {
  return Math.round(price * TICKET_PRICE_RATE * 100) / 100
}

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}
