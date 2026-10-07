export const TICKET_PRICE_RATE = 0.07

export function getTicketPrice(price: number): number {
  return Math.round(price * TICKET_PRICE_RATE * 100) / 100
}

export const PROFIT_MARGIN = 1

// Ganancia: el 100% del precio del producto (ej. $8,000 -> $8,000)
export function getProfit(price: number): number {
  return Math.round(price * PROFIT_MARGIN * 100) / 100
}

// Total a recaudar: recuperar el precio + la ganancia (ej. $8,000 -> $16,000)
export function getTargetRevenue(price: number): number {
  return Math.round(price * (1 + PROFIT_MARGIN) * 100) / 100
}

// Mínimo de boletos: los necesarios para recaudar el precio + la ganancia
export function getBreakEvenTickets(price: number): number {
  const ticketPrice = getTicketPrice(price)
  if (ticketPrice <= 0) return 0
  return Math.ceil(getTargetRevenue(price) / ticketPrice)
}

// Máximo de boletos a la venta según el precio del producto. Entre más caro el
// boleto, menos boletos extra (arriba del mínimo) para no cobrar de más.
// Deben coincidir con product_total_tickets() en la base de datos.
export const MAX_TICKETS_BY_PRICE = [
  { upTo: 10000, maxTickets: 36 },
  { upTo: 25000, maxTickets: 33 },
  { upTo: Infinity, maxTickets: 31 },
]

export function getMaxTickets(price: number): number {
  const tier = MAX_TICKETS_BY_PRICE.find(({ upTo }) => price <= upTo)
  // Nunca menos que el mínimo para cubrir la ganancia.
  return Math.max(tier?.maxTickets ?? 0, getBreakEvenTickets(price))
}

// Ganancia si se venden todos los boletos: lo recaudado menos el precio
// del producto (ej. $8,000 -> 36 x $560 - $8,000 = $12,160)
export function getMaxProfit(price: number): number {
  const revenue = getMaxTickets(price) * getTicketPrice(price)
  return Math.round((revenue - price) * 100) / 100
}

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
  // Sin ".00" en montos enteros ($8,000), con centavos cuando los hay ($12,999.90).
  trailingZeroDisplay: 'stripIfInteger',
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}
