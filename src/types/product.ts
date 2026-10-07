export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  active: boolean
  created_at: string
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
}
