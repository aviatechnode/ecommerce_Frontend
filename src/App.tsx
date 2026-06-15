import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import AuthPage from "./components/Auth";
import GoogleCallback from "./pages/GoogleCallback";
import VerifyEmail from "./components/Auth/VerifyEmail";
import ForgotPasswordPage from "./components/Auth/ForgotPassword";
import ResetPasswordPage from "./components/Auth/ResetPassword";

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
import AminProductFitmentManager from "./admin/components/AdminFitment"
import AdminCouriers from "./admin/components/AdminCouriers";
import AdminPickupStations from "./admin/components/AdminPickupStations";
import AdminShipments from "./admin/components/AdminShipments";
import AdminProducts from "./admin/components/AdminProducts";

import Home from "./client/pages/Home";
import ClientLayout from "./client/layouts/ClientLayout";

import Cart from "./client/pages/Cart";
import ProductDetails from "./client/pages/ProductDetails";
import WishlistPage from "./client/pages/WishlistPage";
import CheckoutPage from "./client/pages/Checkout";
import Feedback from "./client/components/Feedback";
import AboutPage from "./client/pages/About-us";
import CustomerProfilePage from "./client/pages/Profile";
import { GlobalChatButton } from "./client/pages/GlobalChatButton";

import { bootstrapAuth } from "./api/session";
import { useAppDispatch } from "./admin/store/store";
import { useMeQuery } from "./services/authApi";
import ShippingRatesManager from "./admin/components/AdminShippingRates";
import ShippingZonesManager from "./admin/components/AdminShippingZones";
import AdminVehicles from "./admin/components/AdminVehicles";
import FitmentSearchPage from "./client/pages/FitmentSearchPage";

function App() {
  const dispatch = useAppDispatch();
  const [bootstrapped, setBootstrapped] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const { data: meData } = useMeQuery(undefined, {
    skip: !authReady,
  });

  useEffect(() => {
    const run = async () => {
      try {
        await bootstrapAuth(dispatch);
      } catch (e) {
        // ignore refresh failure silently
      } finally {
        setBootstrapped(true);
        setAuthReady(true);
      }
    };

    run();
  }, [dispatch]);

  if (!bootstrapped) return null;

  return (
    <>
      <Routes>
        {/* CLIENT */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="cart" element={<Cart />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="profile" element={<CustomerProfilePage />} />
          <Route path="fitment-search" element={<FitmentSearchPage />} />

        </Route>

        {/* AUTH */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route
  path="/oauth-success"
  element={<GoogleCallback />}
/>
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
              <AdminLayout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="fitments" element={<AminProductFitmentManager />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="roles" element={<AdminRoles />} />
          <Route path="warehouses" element={<AdminWarehouses />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="logistics/shipments" element={<AdminShipments />} />
          <Route path="logistics/couriers" element={<AdminCouriers />} />
          <Route path="logistics/zones" element={<ShippingZonesManager />} />
          <Route path="logistics/rates" element={<ShippingRatesManager />} />
          <Route path="logistics/stations" element={<AdminPickupStations />} />
          <Route path="vehicles" element={<AdminVehicles />} />

        </Route>
      </Routes>

      <AuthGate user={meData?.user} />
    </>
  );
}

function AuthGate({ user }: { user?: any }) {
  return user ? <GlobalChatButton /> : null;
}

export default App;