import { useEffect, useState } from 'react'
import UserLayout from '../components/user/UserLayout'
import AvailableProductsTable from '../components/user/AvailableProductsTable'
import {
  listAvailableProducts,
  reserveTickets,
} from '../services/productsService'
import type { AvailableProduct } from '../types/product'
import { useProductsChanges } from '../hooks/useProductsChanges'

export default function Products() {
  const [products, setProducts] = useState<AvailableProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reserveError, setReserveError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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

  // Si el admin cambia algo o alguien aparta boletos, se recarga la lista sin
  // mostrar "Cargando" ni perder lo que el usuario tiene en pantalla.
  useProductsChanges(() => {
    listAvailableProducts()
      .then(setProducts)
      .catch((err) => console.warn('No se pudo actualizar la lista:', err))
  })

  async function handleReserve(product: AvailableProduct, quantity: number) {
    setReserveError(null)
    setSuccess(null)
    try {
      const remaining = await reserveTickets(product.id, quantity)
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, available_tickets: remaining } : p,
        ),
      )
      setSuccess(
        `Apartaste ${quantity} ${quantity === 1 ? 'boleto' : 'boletos'} de ${product.name}.`,
      )
    } catch (err) {
      setReserveError(
        err instanceof Error ? err.message : 'Ocurrió un error inesperado.',
      )
    }
  }

  return (
    <UserLayout title="Productos disponibles">
      <p className="text-slate-600">
        Elige el producto que te interese, selecciona cuántos boletos quieres y
        apártalos.
      </p>

      {success && (
        <div
          role="status"
          className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      {reserveError && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {reserveError}
        </div>
      )}

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
          !error && (
            <AvailableProductsTable
              products={products}
              onReserve={handleReserve}
            />
          )
        )}
      </div>
    </UserLayout>
  )
}
