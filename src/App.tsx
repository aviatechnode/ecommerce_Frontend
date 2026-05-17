import "./index.css";
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import AuthPage from "./components/Auth";
import GoogleCallback from "./pages/GoogleCallback";
import VerifyEmail from "./pages/VerifyEmail";

import RoleProtectedRoute from "./components/RoleProtectedRoute";

import AdminLayout from "./admin/layouts/AdminLayout";
import AdminDashboard from "./admin/components/AdminDashboard";
import AdminCategories from "./admin/components/AdminCategories";
import AdminBrands from "./admin/components/AdminBrands";
import AdminOrders from "./admin/components/AdminOrders";
import AdminUsers from "./admin/components/AdminUsers";
import AdminRoles from "./admin/components/AdminRoles";
import AdminWarehouses from "./admin/components/AdminWarehouses";
import AdminCoupons from "./admin/components/AdminCoupons";
import AdminAuditLogs from "./admin/components/AdminAuditLogs";

import Home from "./components/Home";
import ClientLayout from "./client/layouts/ClientLayout";

import { useAuthStore } from "./store/AuthStore";
import ProductBuilder from "./admin/components/ProductBuilder";
import AdminFitmentsWrapper from "./admin/payloads/AdminFitmentsWrapper";
import Cart from "./client/pages/Cart";
import ProductDetails from "./client/pages/ProductDetails";
import WishlistPage from "./client/pages/WishlistPage";
import CheckoutPage from "./client/pages/Checkout";
import Feedback from "./client/components/Feedback";

function App() {
  const initAuth = useAuthStore((s) => s.initAuth);
  const hydrated = useAuthStore((s) => s.hydrated);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    initAuth(); // ONLY ONCE
  }, [initAuth]);

  if (!hydrated || loading) return null;

  return (
    <Routes>
      <Route element={<ClientLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/feedback" element={<Feedback />} />
      </Route>

      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      <Route
        path="/admin"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <AdminLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<ProductBuilder />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="brands" element={<AdminBrands />} />
        <Route path="/admin/fitments" element={<AdminFitmentsWrapper />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="roles" element={<AdminRoles />} />
        <Route path="warehouses" element={<AdminWarehouses />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
      </Route>
    </Routes>
  );
}

export default App;