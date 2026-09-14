import { supabase } from '../lib/supabaseClient'

const PRODUCTS_BUCKET = 'products'
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'La imagen debe ser JPG, PNG, WEBP o GIF.'
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'La imagen no puede superar los 5MB.'
  }
  return null
}

export async function uploadProductImage(file: File): Promise<string> {
  const extension = file.name.split('.').pop() ?? 'jpg'
  const path = `${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage
    .from(PRODUCTS_BUCKET)
    .upload(path, file, { upsert: false })

  if (error) {
    throw new Error('No se pudo subir la imagen. Intentá nuevamente.')
  }

  const { data } = supabase.storage.from(PRODUCTS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
