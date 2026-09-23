import { useEffect, useState } from 'react'
import UserLayout from '../components/user/UserLayout'
import AvailableProductsTable from '../components/user/AvailableProductsTable'
import { listAvailableProducts } from '../services/productsService'
import type { AvailableProduct } from '../types/product'

export default function Products() {
  const [products, setProducts] = useState<AvailableProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    listAvailableProducts()
      .then((data) => {
        if (active) setProducts(data)
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'Ocurrió un error inesperado.',
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <UserLayout title="Productos disponibles">
      <p className="text-slate-600">
        Elige el producto que te interese y revisa el precio del boleto.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando productos...</p>
        ) : (
          !error && <AvailableProductsTable products={products} />
        )}
      </div>
    </UserLayout>
  )
}
