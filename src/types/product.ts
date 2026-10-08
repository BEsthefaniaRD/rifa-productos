export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  active: boolean
  created_at: string
  // Fechas de la rifa ('YYYY-MM-DD') y horario de venta ('HH:MM:SS'), hora de
  // México. Las horas las da el admin; sin hora de inicio no se puede comprar.
  raffle_starts_on: string | null
  raffle_ends_on: string | null
  raffle_start_time: string | null
  raffle_end_time: string | null
  // Boletos ya apartados por los usuarios (suma de `tickets.quantity`)
  sold_tickets: number
}

export interface ProductInput {
  name: string
  description: string
  price: number
}

// Lo único que ve un usuario normal: sin precio real, fechas ni estado.
export interface AvailableProduct {
  id: string
  name: string
  description: string
  image_url: string | null
  ticket_price: number
  available_tickets: number
  // ¿Se pueden comprar boletos ahora? y cuándo abre / cierra la venta (ISO)
  sales_open: boolean
  sales_starts_at: string | null
  sales_ends_at: string | null
}

// Fechas y horario de venta que elige el admin (null = sin definir)
export interface RaffleSchedule {
  startsOn: string | null
  endsOn: string | null
  startTime: string | null
  endTime: string | null
}
