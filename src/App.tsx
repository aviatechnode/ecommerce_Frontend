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
import AdminFitments from "./admin/components/AdminFitment";

import AdminShippingRates from "./admin/components/AdminShippingRates";
import AdminCouriers from "./admin/components/AdminCouriers";

/* ================= LOGISTICS ================= */
// import AdminShipments from "./admin/components/AdminShipments";
// import AdminShipmentTracking from "./admin/components/AdminShipmentTracking";
// import AdminShipmentEvents from "./admin/components/AdminShipmentEvents";
// import AdminShippingZones from "./admin/components/AdminShippingZones";
// import AdminPickupStations from "./admin/components/AdminPickupStations";

import Home from "./components/Home";
import ClientLayout from "./client/layouts/ClientLayout";

import { useAuthStore } from "./store/AuthStore";

import ProductBuilder from "./admin/components/ProductBuilder";

import Cart from "./client/pages/Cart";
import ProductDetails from "./client/pages/ProductDetails";
import WishlistPage from "./client/pages/WishlistPage";
import CheckoutPage from "./client/pages/Checkout";

import Feedback from "./client/components/Feedback";
import AdminShippingZones from "./admin/components/AdminShippingZones";
import AdminPickupStations from "./admin/components/AdminPickupStations";

function App() {
  const initAuth = useAuthStore((s) => s.initAuth);
  const hydrated = useAuthStore((s) => s.hydrated);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (!hydrated || loading) return null;

  return (
    <Routes>
      {/* ================= CLIENT ================= */}
      <Route element={<ClientLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="cart" element={<Cart />} />
        <Route path="product/:id" element={<ProductDetails />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="feedback" element={<Feedback />} />
      </Route>

      {/* ================= AUTH ================= */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      {/* ================= ADMIN ================= */}
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <AdminLayout />
          </RoleProtectedRoute>
        }
      >
        {/* ================= DASHBOARD ================= */}
        <Route index element={<AdminDashboard />} />

        {/* ================= CATALOG ================= */}
        <Route path="products" element={<ProductBuilder />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="brands" element={<AdminBrands />} />
        <Route path="fitments" element={<AdminFitments />} />

        {/* ================= ORDERS ================= */}
        <Route path="orders" element={<AdminOrders />} />

        {/* ================= USERS & ROLES ================= */}
        <Route path="users" element={<AdminUsers />} />
        <Route path="roles" element={<AdminRoles />} />

        {/* ================= INVENTORY ================= */}
        <Route path="warehouses" element={<AdminWarehouses />} />

        {/* ================= MARKETING ================= */}
        <Route path="coupons" element={<AdminCoupons />} />

        {/* ================= SYSTEM ================= */}
        <Route path="audit-logs" element={<AdminAuditLogs />} />

        {/* ================= LOGISTICS ================= */}

        {/* Shipments */}
        {/* <Route
          path="logistics/shipments"
          element={<AdminShipments />}
        /> */}

        {/* Tracking */}
        {/* <Route
          path="logistics/shipments/tracking"
          element={<AdminShipmentTracking />}
        /> */}

        {/* Shipment Events */}
        {/* <Route
          path="logistics/shipments/events"
          element={<AdminShipmentEvents />}
        /> */}

        {/* Couriers */}
        <Route
          path="logistics/couriers"
          element={<AdminCouriers />}
        />

        {/* Shipping Zones */}
        <Route
          path="logistics/zones"
          element={<AdminShippingZones />}
        />

        {/* Shipping Rates */}
        <Route
          path="logistics/rates"
          element={<AdminShippingRates />}
        />

        {/* Pickup Stations */}
        <Route
          path="logistics/stations"
          element={<AdminPickupStations />}
        />
      </Route>
    </Routes>
  );
}

export default App;