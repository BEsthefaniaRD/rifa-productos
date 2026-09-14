export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  active: boolean
  created_at: string
}

export interface ProductInput {
  name: string
  description: string
  price: number
}
