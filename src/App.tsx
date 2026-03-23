import "./index.css"
import { Routes, Route } from 'react-router-dom'
import AuthPage from './components/Auth'
import GoogleCallback from "./pages/GoogleCallback"
import VerifyEmail from "./pages/VerifyEmail"
import RoleProtectedRoute from "./components/RoleProtectedRoute"
import AdminLayout from "./admin/layouts/AdminLayout"
import AdminDashboard from "./admin/components/AdminDashboard"
import Home from "./components/Home"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route
  path="/admin"
  element={
    <RoleProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    </RoleProtectedRoute>
  }
/>
      {/* <Route path="/checkout" element={<CheckoutPage />} /> */}

      {/* <Route
        path="/admin"
        element={
          <RoleProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <AdminPage />
          </RoleProtectedRoute>
        }
      /> */}

      {/* <Route
        path="/categories"
        element={
          <RoleProtectedRoute
            requiredPermissions={["category:create"]}
          >
            <CategoriesPage />
          </RoleProtectedRoute>
        }
      /> */}
    </Routes>
  )
}

export default App