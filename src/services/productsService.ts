import { supabase } from '../lib/supabaseClient'
import type {
  AvailableProduct,
  Product,
  ProductInput,
} from '../types/product'
import { uploadProductImage } from './productStorage'

// Trae cada producto con sus boletos apartados (solo el admin puede leerlos todos).
const PRODUCT_SELECT = '*, tickets(quantity)'

type ProductRow = Omit<Product, 'sold_tickets'> & {
  tickets: { quantity: number }[] | null
}

function toProduct({ tickets, ...product }: ProductRow): Product {
  return {
    ...product,
    sold_tickets: (tickets ?? []).reduce((sum, t) => sum + t.quantity, 0),
  }
}

export async function listProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('No se pudieron cargar los productos.')
  }

  return (data as ProductRow[]).map(toProduct)
}

// Para usuarios normales: solo productos activos, sin el precio real.
export async function listAvailableProducts(): Promise<AvailableProduct[]> {
  const { data, error } = await supabase.rpc('get_available_products')

  if (error) {
    throw new Error('No se pudieron cargar los productos.')
  }

  return (data as AvailableProduct[]).map((product) => ({
    ...product,
    ticket_price: Number(product.ticket_price),
    available_tickets: Number(product.available_tickets),
  }))
}

// Aparta boletos de un producto. Devuelve cuántos quedan disponibles.
export async function reserveTickets(
  productId: string,
  quantity: number,
): Promise<number> {
  const { data, error } = await supabase.rpc('reserve_tickets', {
    p_product_id: productId,
    p_quantity: quantity,
  })

  if (error) {
    // Los mensajes de reserve_tickets() ya vienen en español para el usuario.
    throw new Error(error.message || 'No se pudieron apartar los boletos.')
  }

  return Number(data)
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
    .select(PRODUCT_SELECT)
    .single()

  if (error) {
    throw new Error('No se pudo crear el producto.')
  }

  return toProduct(data as ProductRow)
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
    .select(PRODUCT_SELECT)
    .single()

  if (error) {
    throw new Error('No se pudo actualizar el producto.')
  }

  return toProduct(data as ProductRow)
}

export async function setProductActive(
  id: string,
  active: boolean,
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({ active })
    .eq('id', id)
    .select(PRODUCT_SELECT)
    .single()

  if (error) {
    throw new Error('No se pudo actualizar el estado del producto.')
  }

  return toProduct(data as ProductRow)
}
