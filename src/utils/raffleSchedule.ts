import type { AvailableProduct, RaffleSchedule } from '../types/product'

// Las fechas y horas de las rifas son de México. México (centro) está en
// UTC-6 todo el año desde 2022, sin horario de verano. Debe coincidir con
// 'America/Mexico_City' en la base de datos.
const MEXICO_OFFSET = '-06:00'

// Hoy en México como 'YYYY-MM-DD'.
export function todayInMexico(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
  }).format(now)
}

// Fecha 'YYYY-MM-DD' + hora 'HH:MM[:SS]' de México -> instante exacto.
export function mexicoDateTime(date: string, time: string): Date {
  const hhmmss = time.length === 5 ? `${time}:00` : time
  return new Date(`${date}T${hhmmss}${MEXICO_OFFSET}`)
}

// Momento en que cierra la venta: el día de fin a su hora, o al terminar el día.
export function salesEndsAt(schedule: RaffleSchedule): Date | null {
  if (!schedule.endsOn) return null
  return mexicoDateTime(schedule.endsOn, schedule.endTime ?? '23:59:59')
}

export type ScheduleStatus =
  | 'no-dates' // sin fechas: el usuario no ve el producto
  | 'scheduled' // aún no llega el día de inicio
  | 'missing-start-time' // en fechas, pero el admin no ha dado hora de inicio
  | 'waiting-start-time' // en fechas, esperando la hora de inicio
  | 'on-sale' // venta abierta
  | 'finished' // ya pasó el fin

// Misma regla que raffle_is_visible() y raffle_sales_open() en la base de datos.
export function getScheduleStatus(
  schedule: RaffleSchedule,
  now = new Date(),
): ScheduleStatus {
  const { startsOn, endsOn, startTime } = schedule
  if (!startsOn && !endsOn) return 'no-dates'

  const end = salesEndsAt(schedule)
  if (end && now > end) return 'finished'
  if (startsOn && todayInMexico(now) < startsOn) return 'scheduled'
  if (!startTime) return 'missing-start-time'
  if (startsOn && now < mexicoDateTime(startsOn, startTime)) {
    return 'waiting-start-time'
  }
  return 'on-sale'
}

// 'HH:MM:SS' -> 'HH:MM'
export function formatTime(time: string): string {
  return time.slice(0, 5)
}

const saleStartFormatter = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Mexico_City',
})

// Estado de la venta para el usuario, recalculado con la hora actual para que
// el botón se habilite solo al llegar la hora de inicio, sin recargar.
// La base de datos vuelve a validarlo al apartar (reserve_tickets).
export function getSalesState(
  product: AvailableProduct,
  now = new Date(),
): { open: boolean; message: string | null } {
  const { sales_starts_at, sales_ends_at } = product
  if (sales_ends_at && now > new Date(sales_ends_at)) {
    return { open: false, message: 'La venta ya terminó.' }
  }
  if (sales_starts_at) {
    const start = new Date(sales_starts_at)
    if (now < start) {
      return {
        open: false,
        message: `La venta inicia el ${saleStartFormatter.format(start)}.`,
      }
    }
    return { open: true, message: null }
  }
  // Sin hora de inicio: el admin aún no abre la venta.
  return { open: false, message: 'La venta aún no inicia.' }
}
