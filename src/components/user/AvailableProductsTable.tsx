import { useEffect, useState } from 'react'
import type { AvailableProduct } from '../../types/product'
import { formatCurrency } from '../../utils/pricing'
import { getSalesState } from '../../utils/raffleSchedule'
import TicketSelector from './TicketSelector'

// Cada cuánto se revisa si ya llegó la hora de inicio de la venta.
const SALES_CHECK_INTERVAL_MS = 15_000

interface AvailableProductsTableProps {
  products: AvailableProduct[]
  onReserve: (product: AvailableProduct, quantity: number) => Promise<void>
}

export default function AvailableProductsTable({
  products,
  onReserve,
}: AvailableProductsTableProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), SALES_CHECK_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
        Por ahora no hay productos disponibles.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Producto</th>
            <th className="px-4 py-3 font-semibold">Precio del boleto</th>
            <th className="px-4 py-3 font-semibold">Boletos disponibles</th>
            <th className="px-4 py-3 font-semibold">Seleccionar boletos</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="max-w-xs">
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {product.description}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 font-medium text-indigo-600">
                {formatCurrency(product.ticket_price)}
              </td>
              <td className="px-4 py-3 font-medium text-slate-700">
                {product.available_tickets}
              </td>
              <td className="px-4 py-3">
                <TicketSelector
                  salesState={getSalesState(product, now)}
                  available={product.available_tickets}
                  ticketPrice={product.ticket_price}
                  onReserve={(quantity) => onReserve(product, quantity)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
