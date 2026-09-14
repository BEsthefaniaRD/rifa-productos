import type { Raffle } from '../types/raffle'
import { getTicketPrice } from '../data/mockRaffles'

interface RaffleCardProps {
  raffle: Raffle
}

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

export default function RaffleCard({ raffle }: RaffleCardProps) {
  const ticketPrice = getTicketPrice(raffle.productPrice)
  const progress = Math.min(
    100,
    Math.round((raffle.soldTickets / raffle.totalTickets) * 100),
  )

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={raffle.image}
          alt={raffle.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
          {progress}% vendido
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-slate-900">
          {raffle.name}
        </h3>
        <p className="mt-1.5 flex-1 text-sm text-slate-600">
          {raffle.description}
        </p>

        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs text-slate-500">Precio del producto</p>
            <p className="text-sm font-semibold text-slate-700">
              {currencyFormatter.format(raffle.productPrice)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Precio del boleto</p>
            <p className="text-lg font-bold text-indigo-600">
              {currencyFormatter.format(ticketPrice)}
            </p>
          </div>
        </div>

        <button className="mt-5 w-full rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition group-hover:bg-indigo-600">
          Ver rifa
        </button>
      </div>
    </article>
  )
}
