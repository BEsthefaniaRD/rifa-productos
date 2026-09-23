import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

interface Profile {
  id: string
  role: string
}

interface AuthContextValue {
  session: Session | null
  profile: Profile | null
  isAdmin: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data as Profile
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadSession(newSession: Session | null) {
      // Se obtiene el perfil antes de publicar la sesión, para que sesión y rol
      // cambien juntos y las redirecciones por rol nunca vean un rol a medias.
      const userProfile = newSession?.user
        ? await fetchProfile(newSession.user.id)
        : null

      if (!active) return

      setSession(newSession)
      setProfile(userProfile)
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => loadSession(data.session))

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        loadSession(newSession)
      },
    )

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider value={{ session, profile, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
