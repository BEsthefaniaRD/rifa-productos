import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Product, ProductInput } from '../../types/product'
import { validateImageFile } from '../../services/productStorage'

interface ProductFormModalProps {
  product: Product | null
  onClose: () => void
  onSubmit: (input: ProductInput, imageFile: File | null) => Promise<void>
}

interface FormErrors {
  name?: string
  price?: string
  image?: string
}

export default function ProductFormModal({
  product,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const isEditing = Boolean(product)

  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product ? String(product.price) : '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.image_url ?? null,
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleImageChange(file: File | null) {
    setImageFile(file)
    if (file) {
      setImagePreview(URL.createObjectURL(file))
    }
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {}

    if (!name.trim()) {
      nextErrors.name = 'El nombre es obligatorio.'
    }

    const priceValue = Number(price)
    if (!price.trim()) {
      nextErrors.price = 'El precio es obligatorio.'
    } else if (Number.isNaN(priceValue) || priceValue <= 0) {
      nextErrors.price = 'El precio debe ser un número mayor a 0.'
    }

    if (!isEditing && !imageFile) {
      nextErrors.image = 'La imagen es obligatoria.'
    } else if (imageFile) {
      const imageError = validateImageFile(imageFile)
      if (imageError) nextErrors.image = imageError
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)

    if (!validate()) return

    setSubmitting(true)
    try {
      await onSubmit(
        { name: name.trim(), description: description.trim(), price: Number(price) },
        imageFile,
      )
      onClose()
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Ocurrió un error inesperado.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900">
          {isEditing ? 'Editar producto' : 'Nuevo producto'}
        </h2>

        <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          {submitError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {submitError}
            </div>
          )}

          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${
                errors.name ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Ej: iPhone 16 Pro 256GB"
            />
            {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="Descripción breve del producto"
            />
          </div>

          <div>
            <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-slate-700">
              Precio (MXN)
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${
                errors.price ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="0.00"
            />
            {errors.price && <p className="mt-1.5 text-sm text-red-600">{errors.price}</p>}
          </div>

          <div>
            <label htmlFor="image" className="mb-1.5 block text-sm font-medium text-slate-700">
              Imagen
            </label>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Vista previa"
                className="mb-3 h-32 w-32 rounded-lg object-cover"
              />
            )}
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {isEditing && (
              <p className="mt-1.5 text-xs text-slate-500">
                Dejá este campo vacío para conservar la imagen actual.
              </p>
            )}
            {errors.image && <p className="mt-1.5 text-sm text-red-600">{errors.image}</p>}
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
