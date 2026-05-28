import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  AlertCircle,
  ArrowRight,
  CreditCard,
  ChevronLeft,
  MapPin,
  Loader2,
  CheckCircle2,
  X,
  Shield,
  Clock,
  Percent,
  LogIn,
} from "lucide-react";

import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useCalculateCartShippingMutation,
  useUpdateCartDeliveryMutation,
} from "../../services/cartApi";

import { useMeQuery } from "../../services/authApi";

import {
  useGetStatesQuery,
  useGetLgasByStateQuery,
} from "../../services/locationApi";

/* =========================================================
   TYPES & INTERFACES
========================================================= */

interface CartItem {
  id: string;
  quantity: number;
  unitPrice: number;

  variant: {
    id: string;

    product: {
      id: string;
      name: string;
      medias?: { url: string }[];
    };
  };
}

interface CartTotals {
  subtotal: number;
  tax?: number;
  discount?: number;
}

interface DeliveryInfo {
  deliveryStateId?: string;
  deliveryLgaId?: string;
  shippingZoneId?: string;
  deliveryFee?: number;
}

interface ShippingResponse {
  deliveryFee: number;
  shippingZoneId?: string;

  zone?: {
    id: string;
    name?: string;
  };

  estimatedDays?: number;
}

/* =========================================================
   TOAST NOTIFICATION SYSTEM
========================================================= */

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Math.random().toString(36).substring(2, 9);

      setToasts((prev) => [...prev, { id, type, message }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
};

const ToastContainer = ({
  toasts,
  removeToast,
}: {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg animate-in slide-in-from-right-5 fade-in duration-300
            ${
              toast.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : ""
            }
            ${
              toast.type === "error"
                ? "bg-red-50 text-red-800 border border-red-200"
                : ""
            }
            ${
              toast.type === "info"
                ? "bg-blue-50 text-blue-800 border border-blue-200"
                : ""
            }
          `}
        >
          {toast.type === "success" && (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          )}

          {toast.type === "error" && (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}

          {toast.type === "info" && (
            <Shield className="h-5 w-5 text-blue-500" />
          )}

          <span className="text-sm font-medium">{toast.message}</span>

          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 rounded p-0.5 hover:bg-gray-200/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

/* =========================================================
   LOADING SKELETON
========================================================= */

const Shimmer = () => (
  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/20 to-transparent" />
);

const CartSkeleton = () => (
  <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50 py-8">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="relative h-9 w-48 overflow-hidden rounded-lg bg-gray-200">
            <Shimmer />
          </div>

          <div className="relative h-4 w-64 overflow-hidden rounded-lg bg-gray-200">
            <Shimmer />
          </div>
        </div>

        <div className="relative h-10 w-36 overflow-hidden rounded-lg bg-gray-200">
          <Shimmer />
        </div>
      </div>
    </div>
  </div>
);

/* =========================================================
   SIGN IN REQUIRED
========================================================= */

const SignInRequired = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-amber-200 opacity-75" />

        <div className="relative rounded-full bg-linear-to-br from-amber-100 to-amber-200 p-6 shadow-inner">
          <LogIn className="h-14 w-14 text-amber-600" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold bg-linear-to-r from-amber-700 to-amber-600 bg-clip-text text-transparent">
          Sign in to view your cart
        </h2>

        <p className="text-gray-500 max-w-md">
          Please sign in to access your shopping cart and proceed with your
          order.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => navigate("/signin")}
          className="group inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-amber-600 to-orange-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
        >
          <LogIn
            size={18}
            className="transition-transform group-hover:translate-x-0.5"
          />

          Sign In
        </button>

        <button
          onClick={() => navigate("/")}
          className="group inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-3 font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md active:scale-95"
        >
          Continue Shopping

          <ArrowRight
            size={18}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   EMPTY CART
========================================================= */

const EmptyCart = () => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
    <div className="relative">
      <div className="absolute inset-0 animate-ping rounded-full bg-gray-200 opacity-75" />

      <div className="relative rounded-full bg-linear-to-br from-gray-100 to-gray-200 p-6 shadow-inner">
        <ShoppingBag className="h-14 w-14 text-gray-400" />
      </div>
    </div>

    <div className="space-y-2">
      <h2 className="text-3xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
        Your cart is empty
      </h2>

      <p className="text-gray-500 max-w-sm">
        Looks like you haven't added any items yet.
      </p>
    </div>

    <Link
      to="/"
      className="group inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-emerald-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
    >
      Continue Shopping

      <ArrowRight
        size={18}
        className="transition-transform group-hover:translate-x-1"
      />
    </Link>
  </div>
);

/* =========================================================
   CART ITEM ROW
========================================================= */

interface CartItemRowProps {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  isUpdating?: boolean;
}

const CartItemRow = ({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  isUpdating,
}: CartItemRowProps) => {
  const imgUrl = item.variant.product.medias?.[0]?.url;

  const itemTotal = item.quantity * item.unitPrice;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-200">
      {isUpdating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-linear-to-br from-gray-100 to-gray-200">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={item.variant.product.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <ShoppingBag size={24} />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <h3 className="font-semibold text-gray-800 line-clamp-1">
              {item.variant.product.name}
            </h3>

            <p className="text-sm text-gray-500">
              ₦{item.unitPrice.toLocaleString()} each
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:gap-6">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              onClick={onDecrease}
              disabled={item.quantity <= 1 || isUpdating}
              className="rounded-md p-1.5 text-gray-600 transition-all hover:bg-white hover:text-green-600 disabled:opacity-40"
            >
              <Minus size={16} />
            </button>

            <span className="w-8 text-center font-semibold text-gray-800">
              {item.quantity}
            </span>

            <button
              onClick={onIncrease}
              disabled={isUpdating}
              className="rounded-md p-1.5 text-gray-600 transition-all hover:bg-white hover:text-green-600 disabled:opacity-40"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden font-bold text-gray-900 sm:inline">
              ₦{itemTotal.toLocaleString()}
            </span>

            <button
              onClick={onRemove}
              disabled={isUpdating}
              className="rounded-lg p-2 text-red-400 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   SHIPPING CALCULATOR
========================================================= */

interface ShippingCalculatorProps {
  currentDelivery?: DeliveryInfo;
  onShippingUpdate: (fee: number) => void;
  showToast: (message: string, type: ToastType) => void;
}

const ShippingCalculator = ({
  currentDelivery,
  onShippingUpdate,
  showToast,
}: ShippingCalculatorProps) => {
  const [calculateShipping, { isLoading: isCalculating }] =
    useCalculateCartShippingMutation();

  const [updateDelivery] = useUpdateCartDeliveryMutation();

  const { data: states = [], isLoading: statesLoading } =
    useGetStatesQuery();

  const [selectedStateId, setSelectedStateId] = useState(
    currentDelivery?.deliveryStateId || ""
  );

  const [selectedLgaId, setSelectedLgaId] = useState(
    currentDelivery?.deliveryLgaId || ""
  );

  const {
    data: lgas = [],
    isLoading: lgasLoading,
    isFetching: lgasFetching,
  } = useGetLgasByStateQuery(selectedStateId, {
    skip: !selectedStateId,
  });

  useEffect(() => {
    setSelectedLgaId("");
  }, [selectedStateId]);

  const handleCalculateShipping = async () => {
    if (!selectedStateId || !selectedLgaId) {
      showToast(
        "Please select both state and local government area",
        "error"
      );

      return;
    }

    try {
      const result = (await calculateShipping({
        deliveryStateId: selectedStateId,
        deliveryLgaId: selectedLgaId,
      }).unwrap()) as ShippingResponse;

      const shippingZoneId =
        result.shippingZoneId || result.zone?.id;

      await updateDelivery({
        deliveryStateId: selectedStateId,
        deliveryLgaId: selectedLgaId,
        shippingZoneId,
      }).unwrap();

      onShippingUpdate(result.deliveryFee || 0);

      showToast(
        `Shipping updated: ₦${(
          result.deliveryFee || 0
        ).toLocaleString()}`,
        "success"
      );
    } catch (error: any) {
      console.error("Shipping calculation error:", error);

      const errorMessage =
        error?.data?.message ||
        "Failed to calculate shipping. Please try again.";

      showToast(errorMessage, "error");
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-linear-to-br from-gray-50 to-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="h-4 w-4 text-green-600" />

        <h4 className="font-semibold text-gray-800">
          Estimate Shipping
        </h4>
      </div>

      <div className="space-y-3">
        <select
          value={selectedStateId}
          onChange={(e) => setSelectedStateId(e.target.value)}
          disabled={statesLoading}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select State</option>

          {states.map((state: any) => (
            <option key={state.id} value={state.id}>
              {state.name}
            </option>
          ))}
        </select>

        <select
          value={selectedLgaId}
          onChange={(e) => setSelectedLgaId(e.target.value)}
          disabled={
            !selectedStateId || lgasLoading || lgasFetching
          }
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select LGA</option>

          {lgas.map((lga: any) => (
            <option key={lga.id} value={lga.id}>
              {lga.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleCalculateShipping}
          disabled={
            isCalculating ||
            !selectedStateId ||
            !selectedLgaId ||
            statesLoading ||
            lgasLoading
          }
          className="w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-all hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {isCalculating ? (
            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
          ) : (
            "Update Shipping"
          )}
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   CART SUMMARY
========================================================= */

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  grandTotal: number;
  itemCount: number;
  onClearCart: () => void;
  onCheckout: () => void;
  isClearing?: boolean;
  deliveryInfo?: DeliveryInfo;
  onShippingUpdate: (fee: number) => void;
  showToast: (message: string, type: ToastType) => void;
}

const CartSummary = ({
  subtotal,
  shipping,
  grandTotal,
  itemCount,
  onClearCart,
  onCheckout,
  isClearing,
  deliveryInfo,
  onShippingUpdate,
  showToast,
}: CartSummaryProps) => {
  const savings = 0;

  return (
    <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Order Summary
        </h3>

        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="space-y-3 border-b border-gray-100 pb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>

          <span className="font-medium text-gray-900">
            ₦{subtotal.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="flex items-center gap-1 text-gray-600">
            <Truck size={14} />
            Shipping
          </span>

          {/* Always show the numeric fee – never "Free" */}
          <span className="font-medium text-gray-900">
            ₦{shipping.toLocaleString()}
          </span>
        </div>

        {savings > 0 && (
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <Percent size={14} />
              Savings
            </span>

            <span className="font-medium text-green-600">
              -₦{savings.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between text-lg font-bold text-gray-900">
        <span>Total</span>

        <span className="text-2xl text-green-600">
          ₦{grandTotal.toLocaleString()}
        </span>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={onCheckout}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-emerald-600 py-3.5 font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95"
        >
          <CreditCard
            size={18}
            className="transition-transform group-hover:-translate-y-0.5"
          />

          Proceed to Checkout

          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>

        <button
          onClick={onClearCart}
          disabled={isClearing}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-2.5 font-medium text-red-600 transition-all hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
        >
          {isClearing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}

          Clear Cart
        </button>
      </div>

      <ShippingCalculator
        currentDelivery={deliveryInfo}
        onShippingUpdate={onShippingUpdate}
        showToast={showToast}
      />

      <div className="mt-4 rounded-lg bg-green-50 p-3">
        <div className="flex items-start gap-2 text-xs text-green-800">
          <Shield size={14} className="shrink-0 mt-0.5" />

          <span>
            Secure checkout powered by industry-standard encryption
          </span>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   CART ACTIONS
========================================================= */

const useCartActions = (
  showToast: (message: string, type: ToastType) => void
) => {
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(
    null
  );

  const [updateItem] = useUpdateCartItemMutation();

  const [removeItem] = useRemoveCartItemMutation();

  const [clearCart, { isLoading: isClearing }] =
    useClearCartMutation();

  const handleIncrease = async (item: CartItem) => {
    try {
      setUpdatingItemId(item.id);

      await updateItem({
        id: item.id,
        quantity: item.quantity + 1,
      }).unwrap();

      showToast("Quantity increased", "success");
    } catch (err) {
      console.error(err);

      showToast("Failed to update quantity", "error");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleDecrease = async (item: CartItem) => {
    if (item.quantity <= 1) return;

    try {
      setUpdatingItemId(item.id);

      await updateItem({
        id: item.id,
        quantity: item.quantity - 1,
      }).unwrap();

      showToast("Quantity decreased", "success");
    } catch (err) {
      console.error(err);

      showToast("Failed to update quantity", "error");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // FIXED: backend expects variantId
  const handleRemove = async (item: CartItem) => {
    try {
      setUpdatingItemId(item.id);

      await removeItem({
        variantId: item.variant.id,
      }).unwrap();

      showToast("Item removed from cart", "success");
    } catch (err) {
      console.error(err);

      showToast("Failed to remove item", "error");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart(undefined).unwrap();

      showToast("Cart cleared successfully", "success");
    } catch (err) {
      console.error(err);

      showToast("Failed to clear cart", "error");
    }
  };

  return {
    updatingItemId,
    isClearing,
    handleIncrease,
    handleDecrease,
    handleRemove,
    handleClearCart,
  };
};

/* =========================================================
   MAIN CART COMPONENT (FIXED - HOOKS BEFORE RETURNS)
========================================================= */

const Cart = () => {
  const navigate = useNavigate();

  // 1. All hooks first (no conditional returns before them)
  const {
    data: user,
    isLoading: isAuthLoading,
    isError: isAuthError,
  } = useMeQuery();

  const {
    data,
    isLoading: isCartLoading,
    isError: isCartError,
    error: cartError,
  } = useGetCartQuery(undefined, {
    skip: !user,
  });

  const { toasts, showToast, removeToast } = useToast();

  const {
    updatingItemId,
    isClearing,
    handleIncrease,
    handleDecrease,
    handleRemove,
    handleClearCart,
  } = useCartActions(showToast);

  // Additional hooks (useState, useEffect) must also be before any return
  const [shippingFee, setShippingFee] = useState<number>(0);

  useEffect(() => {
    setShippingFee(data?.shipping?.deliveryFee ?? 0);
  }, [data?.shipping?.deliveryFee]);

  // Derived data (computations) – these can be placed after hooks but before conditional returns
  const cart = data?.cart;
  const totals = data?.totals as CartTotals | undefined;
  const items = (cart?.items as CartItem[]) ?? [];
  const subtotal = totals?.subtotal ?? 0;
  const grandTotal = subtotal + shippingFee;

  const deliveryInfo: DeliveryInfo | undefined = data?.cart
    ? {
        deliveryStateId: data.cart.deliveryStateId ?? undefined,
        deliveryLgaId: data.cart.deliveryLgaId ?? undefined,
        shippingZoneId: data.cart.shippingZoneId ?? undefined,
        deliveryFee: data.shipping?.deliveryFee ?? undefined,
      }
    : undefined;

  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // 2. Conditional returns (safe – hook order is now stable)
  if (isAuthLoading) return <CartSkeleton />;
  if (isAuthError || !user) return <SignInRequired />;
  if (isCartLoading) return <CartSkeleton />;
  if (isCartError) {
    const errorMessage =
      (cartError as any)?.data?.message || "Failed to load cart.";
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-red-200 bg-linear-to-br from-red-50 to-orange-50 p-8 text-center shadow-lg">
          <div className="rounded-full bg-red-100 p-3">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-red-800">
              Something went wrong
            </h3>
            <p className="text-red-600">{errorMessage}</p>
          </div>
        </div>
      </div>
    );
  }
  if (items.length === 0) return <EmptyCart />;

  // 3. Normal render
  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-5 fade-in duration-500">
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Shopping Cart
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Review and adjust your items before checkout
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-600 transition-all hover:border-green-500 hover:text-green-600 hover:shadow-md active:scale-95"
            >
              <ChevronLeft
                size={20}
                className="transition-transform group-hover:-translate-x-1"
              />
              Continue Shopping
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="animate-in slide-in-from-bottom-3 fade-in duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CartItemRow
                    item={item}
                    onIncrease={() => handleIncrease(item)}
                    onDecrease={() => handleDecrease(item)}
                    onRemove={() => handleRemove(item)}
                    isUpdating={updatingItemId === item.id}
                  />
                </div>
              ))}
            </div>

            <div className="animate-in slide-in-from-right-5 fade-in duration-500">
              <CartSummary
                subtotal={subtotal}
                shipping={shippingFee}
                grandTotal={grandTotal}
                itemCount={itemCount}
                onClearCart={handleClearCart}
                onCheckout={() => navigate("/checkout")}
                isClearing={isClearing}
                deliveryInfo={deliveryInfo}
                onShippingUpdate={setShippingFee}
                showToast={showToast}
              />
            </div>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-6 border-t border-gray-200 pt-8">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield size={16} className="text-green-600" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock size={16} className="text-green-600" />
              <span>14-Day Return Policy</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;