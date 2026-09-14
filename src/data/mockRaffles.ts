import type { Raffle } from '../types/raffle'

export const mockRaffles: Raffle[] = [
  {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro 256GB',
    description: 'El último iPhone con cámara profesional y chip A18 Pro.',
    image:
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop',
    productPrice: 1200,
    totalTickets: 500,
    soldTickets: 342,
  },
  {
    id: 'macbook-air-m3',
    name: 'MacBook Air M3',
    description: 'Potencia y portabilidad para trabajar desde donde quieras.',
    image:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop',
    productPrice: 1400,
    totalTickets: 500,
    soldTickets: 210,
  },
  {
    id: 'ps5-slim',
    name: 'PlayStation 5 Slim',
    description: 'La consola de última generación con un mando extra.',
    image:
      'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600&h=600&fit=crop',
    productPrice: 550,
    totalTickets: 400,
    soldTickets: 388,
  },
  {
    id: 'moto-suzuki',
    name: 'Moto Suzuki Gixxer 150',
    description: 'Una moto ágil, moderna y lista para la ciudad.',
    image:
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=600&fit=crop',
    productPrice: 3200,
    totalTickets: 800,
    soldTickets: 150,
  },
  {
    id: 'smart-tv-oled',
    name: 'Smart TV OLED 65"',
    description: 'Colores impresionantes y sonido envolvente para tu sala.',
    image:
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=600&fit=crop',
    productPrice: 900,
    totalTickets: 450,
    soldTickets: 95,
  },
  {
    id: 'viaje-cancun',
    name: 'Viaje todo incluido a Cancún',
    description: '5 días y 4 noches para dos personas en resort 5 estrellas.',
    image:
      'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=600&h=600&fit=crop',
    productPrice: 2500,
    totalTickets: 600,
    soldTickets: 480,
  },
]

export const TICKET_PRICE_RATE = 0.07

export function getTicketPrice(productPrice: number): number {
  return Math.round(productPrice * TICKET_PRICE_RATE * 100) / 100
}
