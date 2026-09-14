import { mockRaffles } from '../data/mockRaffles'
import RaffleCard from './RaffleCard'

export default function RafflesSection() {
  return (
    <section id="rifas" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Rifas disponibles
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Elegí tu producto favorito y asegurá tu boleto antes de que se
          agoten.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {mockRaffles.map((raffle) => (
          <RaffleCard key={raffle.id} raffle={raffle} />
        ))}
      </div>
    </section>
  )
}
