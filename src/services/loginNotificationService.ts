import { supabase } from '../lib/supabaseClient'

// Avisa a la Edge Function `send-login-telegram` que hubo un login exitoso.
// Nunca lanza errores: si la notificación falla, el login sigue normalmente.
export async function notifySuccessfulLogin(): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('send-login-telegram', {
      method: 'POST',
    })

    if (error) {
      console.warn('No se pudo enviar la notificación de login:', error)
    }
  } catch (error) {
    console.warn('No se pudo enviar la notificación de login:', error)
  }
}
