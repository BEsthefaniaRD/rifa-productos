import { Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Admin from './pages/Admin'
import AdminProducts from './pages/admin/AdminProducts'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
