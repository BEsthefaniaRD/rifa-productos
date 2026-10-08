import { useCallback, useEffect, useState } from 'react'
import type {
  Product,
  ProductInput,
  RaffleSchedule,
} from '../types/product'
import {
  createProduct,
  listProducts,
  setProductActive,
  setRaffleSchedule,
  updateProduct,
} from '../services/productsService'
import { useProductsChanges } from './useProductsChanges'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listProducts()
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Cambios hechos en otra pestaña o boletos apartados por usuarios: se
  // recarga en silencio, sin mostrar "Cargando".
  useProductsChanges(() => {
    listProducts()
      .then(setProducts)
      .catch((err) => console.warn('No se pudo actualizar la lista:', err))
  })

  async function addProduct(input: ProductInput, imageFile: File) {
    const created = await createProduct(input, imageFile)
    setProducts((prev) => [created, ...prev])
  }

  async function editProduct(
    id: string,
    input: ProductInput,
    imageFile: File | null,
  ) {
    const updated = await updateProduct(id, input, imageFile)
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
  }

  async function toggleActive(id: string, active: boolean) {
    const updated = await setProductActive(id, active)
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
  }

  async function changeRaffleSchedule(id: string, schedule: RaffleSchedule) {
    const updated = await setRaffleSchedule(id, schedule)
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
  }

  return {
    products,
    loading,
    error,
    refresh,
    addProduct,
    editProduct,
    toggleActive,
    changeRaffleSchedule,
  }
}
