import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

// Canal donde la base de datos avisa que cambiaron productos o boletos
// (ver la migración 20261008050000_products_realtime.sql).
const CHANNEL = 'products-changes'

// Espera breve para juntar varios avisos seguidos en una sola recarga.
const DEBOUNCE_MS = 300

// Llama a `onChange` cada vez que un producto o boleto cambia en la base de
// datos, para volver a cargar la lista sin refrescar la página.
export function useProductsChanges(onChange: () => void) {
  // Se guarda la última versión del callback para no resuscribirse en cada render.
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  })

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined

    const channel = supabase
      .channel(CHANNEL)
      .on('broadcast', { event: 'changed' }, () => {
        clearTimeout(timer)
        timer = setTimeout(() => onChangeRef.current(), DEBOUNCE_MS)
      })
      .subscribe()

    return () => {
      clearTimeout(timer)
      supabase.removeChannel(channel)
    }
  }, [])
}
