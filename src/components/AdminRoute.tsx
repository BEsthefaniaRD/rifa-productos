import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-slate-500">Cargando...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}
