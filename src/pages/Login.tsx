import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

interface FormErrors {
  email?: string
  password?: string
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function Login() {
  const navigate = useNavigate()
  const { session, loading: sessionLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [authError, setAuthError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!sessionLoading && session) {
    return <Navigate to="/admin" replace />
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {}

    if (!email.trim()) {
      nextErrors.email = 'El email es obligatorio.'
    } else if (!validateEmail(email)) {
      nextErrors.email = 'Ingresá un email válido.'
    }

    if (!password) {
      nextErrors.password = 'La contraseña es obligatoria.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthError(null)

    if (!validate()) {
      return
    }

    setSubmitting(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setSubmitting(false)

    if (error) {
      setAuthError('Email o contraseña incorrectos. Intentá nuevamente.')
      return
    }

    navigate('/admin', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-white px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-bold text-white">
              R
            </span>
            <span className="text-xl font-bold text-slate-900">RifaYa</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Ingresá tus credenciales para acceder a tu cuenta.
          </p>

          <form
            className="mt-6 flex flex-col gap-5"
            onSubmit={handleSubmit}
            noValidate
          >
            {!isSupabaseConfigured && (
              <div
                role="alert"
                className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
              >
                Supabase no está configurado. Revisá las variables de entorno
                del proyecto.
              </div>
            )}

            {authError && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {authError}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${
                  errors.email ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-sm text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${
                  errors.password ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p id="password-error" className="mt-1.5 text-sm text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
