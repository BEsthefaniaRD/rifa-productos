import type { Product } from '../../types/product'
import { formatCurrency, getTicketPrice } from '../../utils/pricing'

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
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Producto</th>
            <th className="px-4 py-3 font-semibold">Precio</th>
            <th className="px-4 py-3 font-semibold">Boleto (7%)</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Creado</th>
            <th className="px-4 py-3 font-semibold">Acciones</th>
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
              <td className="px-4 py-3 text-slate-700">
                {formatCurrency(product.price)}
              </td>
              <td className="px-4 py-3 font-medium text-indigo-600">
                {formatCurrency(getTicketPrice(product.price))}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    product.active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {product.active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500">
                {dateFormatter.format(new Date(product.created_at))}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onToggleActive(product)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
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
