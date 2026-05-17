import { useState } from "react";
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
} from "lucide-react";

import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} from "../../services/cartApi";

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

/* =========================================================
   SUBCOMPONENTS
========================================================= */

const CartSkeleton = () => (
  <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Header Skeleton */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-9 w-48 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-4 w-64 animate-pulse rounded-lg bg-gray-200" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-lg bg-gray-200" />
      </div>

      {/* Cart grid skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Items list skeleton */}
        <div className="space-y-4 lg:col-span-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex gap-4">
                {/* Image skeleton */}
                <div className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-gray-200" />
                {/* Info skeleton */}
                <div className="flex flex-col justify-center space-y-2">
                  <div className="h-5 w-32 animate-pulse rounded-lg bg-gray-200" />
                  <div className="h-4 w-24 animate-pulse rounded-lg bg-gray-200" />
                  <div className="h-4 w-28 animate-pulse rounded-lg bg-gray-200 sm:hidden" />
                </div>
              </div>
              {/* Actions skeleton */}
              <div className="flex items-center justify-between sm:gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
                  <div className="h-5 w-8 animate-pulse rounded-lg bg-gray-200" />
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden h-5 w-24 animate-pulse rounded-lg bg-gray-200 sm:inline" />
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary sidebar skeleton */}
        <div className="sticky top-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 h-6 w-32 animate-pulse rounded-lg bg-gray-200" />
          <div className="space-y-3 border-b border-gray-100 pb-4">
            <div className="flex justify-between">
              <div className="h-4 w-24 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-4 w-20 animate-pulse rounded-lg bg-gray-200" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-24 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-4 w-20 animate-pulse rounded-lg bg-gray-200" />
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            <div className="h-6 w-16 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-6 w-24 animate-pulse rounded-lg bg-gray-200" />
          </div>
          <div className="mt-6 space-y-3">
            <div className="h-12 w-full animate-pulse rounded-xl bg-gray-200" />
            <div className="h-11 w-full animate-pulse rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const EmptyCart = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
    <div className="rounded-full bg-gray-100 p-4">
      <ShoppingBag className="h-12 w-12 text-gray-400" />
    </div>
    <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
    <p className="text-gray-500">Looks like you haven't added any items yet.</p>
    <Link
      to="/"
      className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:scale-105 hover:shadow-md"
    >
      Continue Shopping
      <ArrowRight size={18} />
    </Link>
  </div>
);

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
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-4">
        {/* Image */}
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={item.variant.product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <ShoppingBag size={24} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <h3 className="font-medium text-gray-800">{item.variant.product.name}</h3>
          <p className="text-sm text-gray-500">₦{item.unitPrice.toLocaleString()} each</p>
          <p className="text-xs font-medium text-green-600 sm:hidden">
            Total: ₦{itemTotal.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between sm:gap-6">
        <div className="flex items-center gap-2">
          <button
            onClick={onDecrease}
            disabled={item.quantity <= 1 || isUpdating}
            className="rounded-lg border border-gray-300 p-1.5 text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <button
            onClick={onIncrease}
            disabled={isUpdating}
            className="rounded-lg border border-gray-300 p-1.5 text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden font-medium text-gray-800 sm:inline">
            ₦{itemTotal.toLocaleString()}
          </span>
          <button
            onClick={onRemove}
            disabled={isUpdating}
            className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
            aria-label="Remove item"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  grandTotal: number;
  itemCount: number;
  onClearCart: () => void;
  onCheckout: () => void;
  isClearing?: boolean;
}

const CartSummary = ({
  subtotal,
  shipping,
  grandTotal,
  itemCount,
  onClearCart,
  onCheckout,
  isClearing,
}: CartSummaryProps) => (
  <div className="sticky top-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <h3 className="mb-4 text-lg font-semibold text-gray-800">Order Summary</h3>

    <div className="space-y-3 border-b border-gray-100 pb-4">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Subtotal ({itemCount} items)</span>
        <span className="font-medium">₦{subtotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="flex items-center gap-1 text-gray-600">
          <Truck size={14} />
          Shipping
        </span>
        <span className="font-medium">
          {shipping === 0 ? "Free" : `₦${shipping.toLocaleString()}`}
        </span>
      </div>
    </div>

    <div className="mt-4 flex justify-between text-lg font-bold text-gray-900">
      <span>Total</span>
      <span>₦{grandTotal.toLocaleString()}</span>
    </div>

    <div className="mt-6 space-y-3">
      <button
        onClick={onCheckout}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 py-3 font-semibold text-white shadow-sm transition hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        <CreditCard size={18} />
        Proceed to Checkout
      </button>
      <button
        onClick={onClearCart}
        disabled={isClearing}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-2.5 font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 size={16} />
        Clear Cart
      </button>
    </div>
  </div>
);

/* =========================================================
   CUSTOM HOOK FOR CART ACTIONS
========================================================= */

const useCartActions = () => {
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [updateItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveCartItemMutation();
  const [clearCart] = useClearCartMutation();

  const handleIncrease = async (item: CartItem) => {
    try {
      setUpdatingItemId(item.id);
      await updateItem({ id: item.id, quantity: item.quantity + 1 }).unwrap();
    } catch (err) {
      console.error("Failed to increase quantity", err);
      // TODO: show toast notification
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleDecrease = async (item: CartItem) => {
    if (item.quantity <= 1) return;
    try {
      setUpdatingItemId(item.id);
      await updateItem({ id: item.id, quantity: item.quantity - 1 }).unwrap();
    } catch (err) {
      console.error("Failed to decrease quantity", err);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      setUpdatingItemId(id);
      await removeItem(id).unwrap();
    } catch (err) {
      console.error("Failed to remove item", err);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your entire cart?")) return;
    try {
      await clearCart(undefined).unwrap();
    } catch (err) {
      console.error("Failed to clear cart", err);
    }
  };

  return {
    updatingItemId,
    handleIncrease,
    handleDecrease,
    handleRemove,
    handleClearCart,
  };
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const Cart = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGetCartQuery(undefined);
  const {
    updatingItemId,
    handleIncrease,
    handleDecrease,
    handleRemove,
    handleClearCart,
  } = useCartActions();

  /* ---------------------------------------------------------
     Derived data
  --------------------------------------------------------- */
  const cart = data?.cart;
  const totals = data?.totals as CartTotals | undefined;
  const shipping = data?.shipping ?? 0;
  const grandTotal = data?.grandTotal ?? 0;
  const items = (cart?.items as CartItem[]) ?? [];

  /* ---------------------------------------------------------
     Loading & error states
  --------------------------------------------------------- */
  if (isLoading) return <CartSkeleton />;

  if (isError) {
    const errorMessage =
      (error as any)?.data?.message || "Failed to load cart. Please try again.";
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-red-700">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) return <EmptyCart />;

  /* ---------------------------------------------------------
     Render cart with items
  --------------------------------------------------------- */
  const subtotal = totals?.subtotal ?? 0;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Your Cart
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Review and adjust your items before checkout
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-green-600 transition-colors border border-gray-300 rounded-lg hover:border-green-500"
          >
           <ChevronLeft size={20} className="group-hover:-translate-x-1 transition" />
            Back
          </button>
        </div>

        {/* Cart grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Items list */}
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onIncrease={() => handleIncrease(item)}
                onDecrease={() => handleDecrease(item)}
                onRemove={() => handleRemove(item.id)}
                isUpdating={updatingItemId === item.id}
              />
            ))}
          </div>

          {/* Summary sidebar */}
          <div>
            <CartSummary
              subtotal={subtotal}
              shipping={shipping}
              grandTotal={grandTotal}
              itemCount={itemCount}
              onClearCart={handleClearCart}
              onCheckout={() => navigate("/checkout")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;