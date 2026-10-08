// Supabase Edge Function: anuncia por Telegram los productos cuya venta de
// boletos se acaba de abrir (estado "En venta"). La llama cada minuto la
// tarea programada `notify-sales-open` (pg_cron), ver la migración
// 20261008040000_sales_open_telegram.sql.
//
// Se despliega sin verificación de JWT (la llama pg_cron, sin sesión):
//   supabase functions deploy notify-sales-open --no-verify-jwt
// Es segura de llamar por cualquiera: solo anuncia productos cuya venta ya
// está abierta, y cada uno una sola vez.
//
// Secrets requeridos: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
// Opcional: TELEGRAM_SALES_CHAT_ID para mandar estos avisos a otro chat
// (por ejemplo, un canal para los usuarios). Si no existe, usa TELEGRAM_CHAT_ID.
// Inyectados automáticamente por Supabase: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'npm:@supabase/supabase-js@2'

const TIME_ZONE = 'America/Mexico_City'

interface ProductToNotify {
  id: string
  name: string
  description: string | null
  image_url: string | null
  ticket_price: number
  available_tickets: number
  sales_ends_at: string | null
}

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
  trailingZeroDisplay: 'stripIfInteger',
})

const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: TIME_ZONE,
})

function buildMessage(product: ProductToNotify): string {
  const lines = [
    `🎟️ ¡${product.name} ya está a la venta!`,
    '',
  ]
  if (product.description) lines.push(product.description, '')
  lines.push(
    `💵 Precio del boleto: ${currencyFormatter.format(Number(product.ticket_price))}`,
    `🎫 Boletos disponibles: ${product.available_tickets}`,
  )
  if (product.sales_ends_at) {
    lines.push(`⏰ La venta cierra el ${dateFormatter.format(new Date(product.sales_ends_at))}`)
  }
  return lines.join('\n')
}

// Telegram limita el texto de una foto (caption) a 1024 caracteres.
const MAX_CAPTION_LENGTH = 1024

async function callTelegram(method: string, body: Record<string, unknown>): Promise<boolean> {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    console.error(`Telegram ${method} respondió con error:`, response.status, await response.text())
  }
  return response.ok
}

async function announce(product: ProductToNotify, chatId: string): Promise<boolean> {
  const text = buildMessage(product)
  try {
    // Sin parse_mode: texto plano, así el nombre y la descripción no necesitan escaparse.
    if (product.image_url && text.length <= MAX_CAPTION_LENGTH) {
      const sent = await callTelegram('sendPhoto', {
        chat_id: chatId,
        photo: product.image_url,
        caption: text,
      })
      if (sent) return true
      // Si Telegram no pudo usar la imagen, al menos se manda el texto.
    }
    return await callTelegram('sendMessage', { chat_id: chatId, text })
  } catch (error) {
    console.error('No se pudo contactar a Telegram:', error)
    return false
  }
}

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const chatId = Deno.env.get('TELEGRAM_SALES_CHAT_ID') ?? Deno.env.get('TELEGRAM_CHAT_ID')

  if (!supabaseUrl || !serviceRoleKey || !chatId || !Deno.env.get('TELEGRAM_BOT_TOKEN')) {
    console.error('Faltan secrets: SUPABASE_*, TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID.')
    return Response.json({ error: 'Configuración incompleta' }, { status: 500 })
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await admin.rpc('claim_products_to_notify')
  if (error) {
    console.error('No se pudieron obtener los productos por anunciar:', error)
    return Response.json({ error: 'No se pudieron obtener los productos' }, { status: 500 })
  }

  const products = (data ?? []) as ProductToNotify[]
  const results = []

  for (const product of products) {
    const sent = await announce(product, chatId)
    if (!sent) {
      // Se libera para que el siguiente minuto lo vuelva a intentar.
      const { error: releaseError } = await admin.rpc('release_product_notification', {
        p_product_id: product.id,
      })
      if (releaseError) console.error('No se pudo liberar el producto:', releaseError)
    }
    results.push({ id: product.id, name: product.name, sent })
  }

  return Response.json({ announced: results })
})
