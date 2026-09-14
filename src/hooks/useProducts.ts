import { useCallback, useEffect, useState } from 'react'
import type { Product, ProductInput } from '../types/product'
import {
  createProduct,
  listProducts,
  setProductActive,
  updateProduct,
} from '../services/productsService'

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

  return {
    products,
    loading,
    error,
    refresh,
    addProduct,
    editProduct,
    toggleActive,
  }
}
