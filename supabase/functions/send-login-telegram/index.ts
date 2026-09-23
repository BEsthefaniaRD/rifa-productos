// Supabase Edge Function: notifica por Telegram cada inicio de sesión exitoso
// y lo registra en la tabla `login_logs`.
//
// Secrets requeridos (supabase secrets set ...):
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
// Inyectados automáticamente por Supabase:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'npm:@supabase/supabase-js@2'

const TIME_ZONE = 'America/Mexico_City'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: TIME_ZONE,
  }).format(date)
}

async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID')

  if (!token || !chatId) {
    console.error('Faltan los secrets TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID.')
    return false
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Sin parse_mode: texto plano, así el email no necesita escaparse.
        body: JSON.stringify({ chat_id: chatId, text }),
      },
    )

    if (!response.ok) {
      console.error('Telegram respondió con error:', response.status, await response.text())
      return false
    }

    return true
  } catch (error) {
    console.error('No se pudo contactar a Telegram:', error)
    return false
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método no permitido' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.')
    return jsonResponse({ error: 'Configuración incompleta' }, 500)
  }

  // El usuario se obtiene del JWT de la sesión, nunca del body,
  // para que nadie pueda registrar logins a nombre de otro.
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return jsonResponse({ error: 'No autorizado' }, 401)
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: userData, error: userError } = await admin.auth.getUser(token)
  if (userError || !userData.user) {
    return jsonResponse({ error: 'No autorizado' }, 401)
  }

  const user = userData.user
  const email = user.email ?? 'desconocido'
  const now = new Date()

  const message = [
    '🔐 Nuevo inicio de sesión',
    `Usuario: ${email}`,
    `Fecha: ${formatDate(now)}`,
    'Resultado: Exitoso',
  ].join('\n')

  const telegramSent = await sendTelegramMessage(message)

  const { error: insertError } = await admin.from('login_logs').insert({
    user_id: user.id,
    email,
    status: 'success',
    telegram_sent: telegramSent,
    created_at: now.toISOString(),
  })

  if (insertError) {
    console.error('No se pudo registrar el login en login_logs:', insertError)
  }

  return jsonResponse({ telegramSent, logged: !insertError })
})
