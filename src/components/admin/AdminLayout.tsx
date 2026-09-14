import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'

interface AdminLayoutProps {
  title: string
  children: ReactNode
}

export default function AdminLayout({ title, children }: AdminLayoutProps) {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/admin" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-bold text-white">
                R
              </span>
              <span className="text-xl font-bold text-slate-900">RifaYa</span>
            </Link>

            <nav className="hidden items-center gap-6 sm:flex">
              <Link
                to="/admin"
                className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
              >
                Panel
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/products"
                  className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
                >
                  Productos
                </Link>
              )}
            </nav>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  )
}
