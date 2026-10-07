import type { Product } from '../../types/product'
import {
  formatCurrency,
  getBreakEvenTickets,
  getMaxProfit,
  getMaxTickets,
  getProfit,
  getTargetRevenue,
  getTicketPrice,
} from '../../utils/pricing'

interface ProductsTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onToggleActive: (product: Product) => void
}

const dateFormatter = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' })

export default function ProductsTable({
  products,
  onEdit,
  onToggleActive,
}: ProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
        Todavía no hay productos cargados.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase leading-tight tracking-wide text-slate-500">
          <tr>
            <th className="px-2 py-2.5 font-semibold">Producto</th>
            <th className="px-2 py-2.5 font-semibold">Precio</th>
            <th className="px-2 py-2.5 font-semibold">Ganancia 100%</th>
            <th className="px-2 py-2.5 font-semibold">Total a recaudar</th>
            <th className="px-2 py-2.5 font-semibold">Boleto 7%</th>
            <th className="px-2 py-2.5 font-semibold">Mín. boletos</th>
            <th className="px-2 py-2.5 font-semibold">Máx. boletos</th>
            <th className="px-2 py-2.5 font-semibold">Ganancia máxima</th>
            <th className="px-2 py-2.5 font-semibold">Vendidos</th>
            <th className="px-2 py-2.5 font-semibold">Por vender</th>
            <th className="px-2 py-2.5 font-semibold">Estado</th>
            <th className="px-2 py-2.5 font-semibold">Creado</th>
            <th className="px-2 py-2.5 font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 whitespace-nowrap">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-2 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-slate-100">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="w-32 whitespace-normal">
                    <p className="font-medium leading-tight text-slate-900">
                      {product.name}
                    </p>
                    <p
                      className="truncate text-[11px] text-slate-500"
                      title={product.description}
                    >
                      {product.description}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-2 py-2 text-slate-700">
                {formatCurrency(product.price)}
              </td>
              <td className="px-2 py-2 font-medium text-green-700">
                {formatCurrency(getProfit(product.price))}
              </td>
              <td className="px-2 py-2 font-medium text-slate-900">
                {formatCurrency(getTargetRevenue(product.price))}
              </td>
              <td className="px-2 py-2 font-medium text-indigo-600">
                {formatCurrency(getTicketPrice(product.price))}
              </td>
              <td className="px-2 py-2 text-center font-medium text-slate-700">
                {getBreakEvenTickets(product.price)}
              </td>
              <td className="px-2 py-2 text-center font-medium text-slate-700">
                {getMaxTickets(product.price)}
              </td>
              <td className="px-2 py-2 font-semibold text-green-700">
                {formatCurrency(getMaxProfit(product.price))}
              </td>
              <td className="px-2 py-2 text-center text-slate-700">
                {product.sold_tickets}
              </td>
              <td className="px-2 py-2 text-center font-medium text-indigo-600">
                {Math.max(
                  getMaxTickets(product.price) - product.sold_tickets,
                  0,
                )}
              </td>
              <td className="px-2 py-2">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    product.active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {product.active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-2 py-2 text-slate-500">
                {dateFormatter.format(new Date(product.created_at))}
              </td>
              <td className="px-2 py-2">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => onEdit(product)}
                    className="rounded-full border border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onToggleActive(product)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                      product.active
                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                        : 'border-green-200 text-green-700 hover:bg-green-50'
                    }`}
                  >
                    {product.active ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
