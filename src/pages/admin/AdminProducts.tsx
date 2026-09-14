import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import ProductsTable from '../../components/admin/ProductsTable'
import ProductFormModal from '../../components/admin/ProductFormModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { useProducts } from '../../hooks/useProducts'
import type { Product, ProductInput } from '../../types/product'

export default function AdminProducts() {
  const { products, loading, error, addProduct, editProduct, toggleActive } =
    useProducts()

  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<Product | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  function openCreateForm() {
    setEditingProduct(null)
    setFormOpen(true)
  }

  function openEditForm(product: Product) {
    setEditingProduct(product)
    setFormOpen(true)
  }

  async function handleFormSubmit(input: ProductInput, imageFile: File | null) {
    if (editingProduct) {
      await editProduct(editingProduct.id, input, imageFile)
      setSuccessMessage('Producto actualizado correctamente.')
    } else {
      await addProduct(input, imageFile as File)
      setSuccessMessage('Producto creado correctamente.')
    }
  }

  async function handleConfirmToggle() {
    if (!confirmTarget) return
    setConfirmLoading(true)
    setConfirmError(null)
    try {
      await toggleActive(confirmTarget.id, !confirmTarget.active)
      setSuccessMessage(
        confirmTarget.active
          ? 'Producto desactivado correctamente.'
          : 'Producto activado correctamente.',
      )
      setConfirmTarget(null)
    } catch (err) {
      setConfirmError(
        err instanceof Error ? err.message : 'Ocurrió un error inesperado.',
      )
    } finally {
      setConfirmLoading(false)
    }
  }

  return (
    <AdminLayout title="Productos">
      <div className="flex items-center justify-between gap-4">
        <p className="text-slate-600">
          Administrá los productos disponibles para las rifas.
        </p>
        <button
          onClick={openCreateForm}
          className="shrink-0 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          Nuevo producto
        </button>
      </div>

      {successMessage && (
        <div
          role="status"
          className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {successMessage}
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
          <ProductsTable
            products={products}
            onEdit={openEditForm}
            onToggleActive={(product) => {
              setConfirmError(null)
              setConfirmTarget(product)
            }}
          />
        )}
      </div>

      {formOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setFormOpen(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        title={confirmTarget?.active ? 'Desactivar producto' : 'Activar producto'}
        message={
          confirmTarget?.active
            ? `¿Seguro que querés desactivar "${confirmTarget?.name}"? Dejará de mostrarse en la plataforma.`
            : `¿Seguro que querés activar "${confirmTarget?.name}"? Volverá a mostrarse en la plataforma.`
        }
        confirmLabel={confirmTarget?.active ? 'Desactivar' : 'Activar'}
        loading={confirmLoading}
        error={confirmError}
        onConfirm={handleConfirmToggle}
        onCancel={() => {
          setConfirmTarget(null)
          setConfirmError(null)
        }}
      />
    </AdminLayout>
  )
}
