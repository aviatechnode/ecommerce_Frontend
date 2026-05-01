// src/pages/Cart.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import type { RootState, AppDispatch } from "../../admin/store/store";
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../admin/state-management/cartSlice";

/* =========================================================
TYPES & HELPERS
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

/* =========================================================
LOADING SKELETON
========================================================= */
const CartSkeleton = () => (
  <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-gray-200 rounded-lg animate-pulse mt-2" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 flex gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="flex gap-2 mt-2">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
            <div className="border-t my-3" />
            <div className="flex justify-between">
              <div className="h-5 w-16 bg-gray-200 rounded" />
              <div className="h-5 w-28 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="h-12 w-full bg-gray-200 rounded-lg mt-6 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

/* =========================================================
CONFIRMATION MODAL
========================================================= */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
EMPTY CART STATE
========================================================= */
const EmptyCart = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h11L17 13M9 21h6" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Looks like you haven't added any items yet.</p>
      <Link
        to="/shop"
        className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
      >
        Start Shopping
      </Link>
    </div>
  </div>
);

/* =========================================================
QUANTITY CONTROL BUTTONS
========================================================= */
const QuantityControl = ({
  quantity,
  onDecrease,
  onIncrease,
  disabled,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  disabled?: boolean;
}) => (
  <div className="flex items-center gap-2">
    <button
      onClick={onDecrease}
      disabled={disabled || quantity <= 0}
      className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      aria-label="Decrease quantity"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    </button>
    <span className="w-8 text-center font-medium">{quantity}</span>
    <button
      onClick={onIncrease}
      disabled={disabled}
      className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      aria-label="Increase quantity"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </button>
  </div>
);

/* =========================================================
MAIN CART COMPONENT
========================================================= */
const Cart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { cart, totals, shipping, grandTotal, loading, error } = useSelector(
    (state: RootState) => state.cart
  );

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [removeItemId, setRemoveItemId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleIncrease = async (item: CartItem) => {
    setActionLoading(`inc_${item.id}`);
    try {
      await dispatch(
        updateCartItem({
          id: item.id,
          quantity: item.quantity + 1,
        })
      ).unwrap();
    } catch (err) {
      // Error is handled in slice
      console.error("Failed to increase quantity");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecrease = async (item: CartItem) => {
    if (item.quantity <= 1) {
      handleRemoveClick(item.id);
      return;
    }
    setActionLoading(`dec_${item.id}`);
    try {
      await dispatch(
        updateCartItem({
          id: item.id,
          quantity: item.quantity - 1,
        })
      ).unwrap();
    } catch (err) {
      console.error("Failed to decrease quantity");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveClick = (id: string) => {
    setRemoveItemId(id);
  };

  const confirmRemove = async () => {
    if (!removeItemId) return;
    setActionLoading(`remove_${removeItemId}`);
    try {
      await dispatch(removeCartItem(removeItemId)).unwrap();
    } catch (err) {
      console.error("Failed to remove item");
    } finally {
      setActionLoading(null);
      setRemoveItemId(null);
    }
  };

  const handleClearCart = async () => {
    setActionLoading("clear");
    try {
      await dispatch(clearCart()).unwrap();
    } catch (err) {
      console.error("Failed to clear cart");
    } finally {
      setActionLoading(null);
      setShowClearConfirm(false);
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  // Loading state
  if (loading && !cart) {
    return <CartSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load cart</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => dispatch(fetchCart())}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!cart || !cart.items || cart.items.length === 0) {
    return <EmptyCart />;
  }

  const items = cart.items as CartItem[];

  return (
    <>
      <ConfirmModal
        isOpen={!!removeItemId}
        onClose={() => setRemoveItemId(null)}
        onConfirm={confirmRemove}
        title="Remove Item"
        message="Are you sure you want to remove this item from your cart?"
      />
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearCart}
        title="Clear Cart"
        message="Are you sure you want to remove all items from your cart? This action cannot be undone."
      />

      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-1">
              {totals.totalItems} {totals.totalItems === 1 ? "item" : "items"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const productName = item.variant.product.name;
                const imageUrl = item.variant.product.medias?.[0]?.url;
                const itemTotal = item.unitPrice * item.quantity;
                const isLoading = actionLoading?.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-4 transition-all hover:shadow-md"
                  >
                    {/* Image */}
                    <div className="shrink-0">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={productName}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{productName}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          ₦{item.unitPrice.toLocaleString()} each
                        </p>
                        <p className="text-sm font-medium text-green-600 mt-1">
                          Total: ₦{itemTotal.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <QuantityControl
                          quantity={item.quantity}
                          onDecrease={() => handleDecrease(item)}
                          onIncrease={() => handleIncrease(item)}
                          disabled={!!isLoading}
                        />
                        <button
                          onClick={() => handleRemoveClick(item.id)}
                          disabled={!!isLoading}
                          className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                          aria-label="Remove item"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Clear Cart Button (mobile) */}
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={actionLoading === "clear"}
                className="w-full lg:hidden mt-2 text-red-500 text-sm py-2 hover:text-red-700 transition-colors disabled:opacity-50"
              >
                Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 h-fit sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₦{totals.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>₦{shipping.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 my-3" />
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₦{grandTotal.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  *Shipping calculated at checkout
                </p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={actionLoading !== null}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {actionLoading === "checkout" && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Proceed to Checkout
              </button>

              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={actionLoading === "clear"}
                className="w-full mt-3 text-red-500 text-sm py-2 hover:text-red-700 transition-colors disabled:opacity-50 hidden lg:block"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;