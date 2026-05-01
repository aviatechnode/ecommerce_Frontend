// src/pages/Wishlist.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import type { AppDispatch, RootState } from "../../admin/store/store";
import {
  fetchWishlist,
  removeWishlistItem,
  clearWishlist,
} from "../../admin/state-management/wishlistSlice";
// Import the actual type from the slice to avoid mismatch
import type { WishlistItem } from "../../admin/state-management/wishlistSlice";

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
LOADING SKELETON
========================================================= */
const WishlistSkeleton = () => (
  <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-4">
            <div className="h-40 bg-gray-200 rounded-lg animate-pulse" />
            <div className="mt-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="flex justify-between mt-4">
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* =========================================================
MAIN WISHLIST COMPONENT
========================================================= */
export default function WishlistPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { wishlist, loading, error } = useSelector(
    (state: RootState) => state.wishlist
  );

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [removeItemId, setRemoveItemId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = async (id: string) => {
    setActionLoading(`remove_${id}`);
    try {
      await dispatch(removeWishlistItem(id)).unwrap();
    } catch (err) {
      console.error("Failed to remove item");
    } finally {
      setActionLoading(null);
      setRemoveItemId(null);
    }
  };

  const handleClear = async () => {
    setActionLoading("clear");
    try {
      await dispatch(clearWishlist()).unwrap();
    } catch (err) {
      console.error("Failed to clear wishlist");
    } finally {
      setActionLoading(null);
      setShowClearConfirm(false);
    }
  };

  // Get image URL from product.medias (matches slice's structure: { url: string }[])
  const getProductImage = (product: WishlistItem["product"]): string | null => {
    if (product.medias && product.medias.length > 0) {
      return product.medias[0].url;
    }
    return null;
  };

  const items: WishlistItem[] = wishlist?.items || [];

  // Loading state
  if (loading && !wishlist) {
    return <WishlistSkeleton />;
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load wishlist</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => dispatch(fetchWishlist())}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty wishlist
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save your favorite items here and come back to them anytime.</p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Remove Item Confirmation Modal */}
      <ConfirmModal
        isOpen={!!removeItemId}
        onClose={() => setRemoveItemId(null)}
        onConfirm={() => removeItemId && handleRemove(removeItemId)}
        title="Remove Item"
        message="Are you sure you want to remove this item from your wishlist?"
      />
      {/* Clear All Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClear}
        title="Clear Wishlist"
        message="Are you sure you want to remove all items from your wishlist? This action cannot be undone."
      />

      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-gray-900">
              <svg className="w-7 h-7 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              My Wishlist
              <span className="text-sm font-normal text-gray-500 ml-2">({items.length})</span>
            </h1>

            {items.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={actionLoading === "clear"}
                className="text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            )}
          </div>

          {/* Wishlist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => {
              const product = item.product;
              const imageUrl = getProductImage(product);
              const isLoading = actionLoading === `remove_${item.id}`;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
                >
                  {/* Image Container */}
                  <div
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="cursor-pointer overflow-hidden bg-gray-100 aspect-square"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div>
                      <h3
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="font-medium text-gray-900 hover:text-green-600 cursor-pointer line-clamp-2 transition-colors"
                      >
                        {product.name}
                      </h3>
                      {product.price && (
                        <p className="text-green-600 font-semibold mt-1">
                          ₦{Number(product.price).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4">
                      <button
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="flex items-center gap-1.5 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Quick View
                      </button>

                      <button
                        onClick={() => setRemoveItemId(item.id)}
                        disabled={isLoading}
                        className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 p-1"
                        aria-label="Remove from wishlist"
                      >
                        {isLoading ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}