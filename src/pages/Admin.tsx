import AdminLayout from '../components/admin/AdminLayout'
import { useAuth } from '../context/AuthContext'

export default function Admin() {
  const { session } = useAuth()

  return (
    <AdminLayout title="Panel de administración">
      <p className="text-slate-600">
        Sesión iniciada como <span className="font-medium">{session?.user.email}</span>.
      </p>
    </AdminLayout>
  )
}
