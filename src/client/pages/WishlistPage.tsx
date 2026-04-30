import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../admin/store/store";

import {
  fetchWishlist,
  removeWishlistItem,
  clearWishlist,
} from "../../admin/state-management/wishlistSlice";

import { useNavigate } from "react-router-dom";
import {
  Heart,
  Trash2,
  ShoppingCart,
  Loader2,
} from "lucide-react";

import type { Product } from "../../types/product";

/* ================= COMPONENT ================= */

export default function WishlistPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { wishlist, loading, error } = useSelector(
    (state: RootState) => state.wishlist
  );

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = async (id: string) => {
    await dispatch(removeWishlistItem(id));
  };

  const handleClear = async () => {
    await dispatch(clearWishlist());
  };

  const items = wishlist?.items || [];

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="text-center mt-10 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="text-red-500" /> Wishlist
        </h1>

        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="text-sm text-red-500 hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* EMPTY */}
      {items.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <Heart size={40} className="mx-auto mb-4" />
          <p>Your wishlist is empty</p>

          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Browse Products
          </button>
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {items.map((item: any) => {
          const product: Product = item.product;

          // ✅ FIXED IMAGE LOGIC (IMPORTANT)
          const image =
            product.medias?.find((m: any) => m.type === "IMAGE")?.url ??
            product.medias?.[0]?.url ??
            null;

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col"
            >

              {/* IMAGE */}
              <div
                onClick={() => navigate(`/product/${product.id}`)}
                className="cursor-pointer"
              >
                <div className="h-40 bg-gray-100 rounded-lg overflow-hidden">

                  {image ? (
                    <img
                      src={image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No Image
                    </div>
                  )}

                </div>
              </div>

              {/* CONTENT */}
              <div className="mt-3 flex-1 flex flex-col justify-between">

                <div>
                  <h3
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="font-medium text-sm cursor-pointer hover:text-green-600 line-clamp-2"
                  >
                    {product.name}
                  </h3>

                  {product.price && (
                    <p className="text-green-600 font-semibold mt-1">
                      ₦{Number(product.price).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex items-center justify-between mt-4">

                  <button
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="flex items-center gap-1 text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg"
                  >
                    <ShoppingCart size={14} />
                    View
                  </button>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>

                </div>

              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}