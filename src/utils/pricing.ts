export const TICKET_PRICE_RATE = 0.07

export function getTicketPrice(price: number): number {
  return Math.round(price * TICKET_PRICE_RATE * 100) / 100
}

// Boletos que hay que vender para cubrir el 100% del precio del producto
export function getBreakEvenTickets(price: number): number {
  const ticketPrice = getTicketPrice(price)
  if (ticketPrice <= 0) return 0
  return Math.ceil(price / ticketPrice)
}

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}
