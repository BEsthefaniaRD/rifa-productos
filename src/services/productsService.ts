import { supabase } from '../lib/supabaseClient'
import type { Product, ProductInput } from '../types/product'
import { uploadProductImage } from './productStorage'

export async function listProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('No se pudieron cargar los productos.')
  }

  return data as Product[]
}

export async function createProduct(
  input: ProductInput,
  imageFile: File,
): Promise<Product> {
  const imageUrl = await uploadProductImage(imageFile)

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: input.name,
      description: input.description,
      price: input.price,
      image_url: imageUrl,
      active: true,
    })
    .select()
    .single()

  if (error) {
    throw new Error('No se pudo crear el producto.')
  }

  return data as Product
}

export async function updateProduct(
  id: string,
  input: ProductInput,
  imageFile: File | null,
): Promise<Product> {
  const imageUrl = imageFile ? await uploadProductImage(imageFile) : undefined

  const { data, error } = await supabase
    .from('products')
    .update({
      name: input.name,
      description: input.description,
      price: input.price,
      ...(imageUrl ? { image_url: imageUrl } : {}),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error('No se pudo actualizar el producto.')
  }

  return data as Product
}

export async function setProductActive(
  id: string,
  active: boolean,
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({ active })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error('No se pudo actualizar el estado del producto.')
  }

  return data as Product
}
