import { useState } from 'react'
import { formatCurrency } from '../../utils/pricing'

interface TicketSelectorProps {
  available: number
  ticketPrice: number
  onReserve: (quantity: number) => Promise<void>
}

export default function TicketSelector({
  available,
  ticketPrice,
  onReserve,
}: TicketSelectorProps) {
  const [quantity, setQuantity] = useState(1)
  const [saving, setSaving] = useState(false)

  if (available <= 0) {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
        Agotado
      </span>
    )
  }

  // Si bajaron los disponibles, la cantidad elegida no puede quedar por encima.
  const current = Math.min(quantity, available)

  function changeQuantity(value: number) {
    if (Number.isNaN(value)) return
    setQuantity(Math.min(Math.max(value, 1), available))
  }

  async function handleReserve() {
    setSaving(true)
    try {
      await onReserve(current)
      setQuantity(1)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center rounded-full border border-slate-300">
        <button
          type="button"
          onClick={() => changeQuantity(current - 1)}
          disabled={saving || current <= 1}
          aria-label="Quitar un boleto"
          className="px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40"
        >
          −
        </button>
        <input
          type="number"
          min={1}
          max={available}
          value={current}
          onChange={(e) => changeQuantity(e.target.valueAsNumber)}
          disabled={saving}
          aria-label="Cantidad de boletos"
          className="w-14 border-x border-slate-300 py-1.5 text-center text-sm [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => changeQuantity(current + 1)}
          disabled={saving || current >= available}
          aria-label="Agregar un boleto"
          className="px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={handleReserve}
        disabled={saving}
        className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {saving
          ? 'Apartando...'
          : `Apartar · ${formatCurrency(current * ticketPrice)}`}
      </button>
    </div>
  )
}
