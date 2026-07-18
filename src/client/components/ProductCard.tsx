import {
  ShoppingCartIcon,
  Check,
  Package,
  Bookmark,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";

/* RTK QUERY */
import {
  useAddToCartMutation,
} from "../../services/cartApi";

import {
  useToggleWishlistMutation,
  useGetWishlistQuery,
} from "../../services/wishlistApi";

/* PRODUCT TYPE (from actual API) */
import type { Product } from "../../services/productApi";

/* =========================================================
PROPS
========================================================= */
interface Props {
  product: Product;
}

/* =========================================================
HELPER: Extract OEM numbers safely
========================================================= */
function extractOemNumbers(oemNumbers: unknown): string[] {
  if (!Array.isArray(oemNumbers)) return [];

  const result: string[] = [];

  for (const item of oemNumbers) {
    if (typeof item === "string") {
      const trimmed = item.trim();
      if (trimmed) result.push(trimmed);
    } else if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>;
      const oemValue = obj.oemNumber;
      if (typeof oemValue === "string") {
        const trimmed = oemValue.trim();
        if (trimmed) result.push(trimmed);
      }
    }
  }

  return result;
}

/* =========================================================
COMPONENT
========================================================= */
export default function ProductCard({ product }: Props) {
  const navigate = useNavigate();

  // RTK QUERY HOOKS
  const [addToCart, { isLoading: adding }] = useAddToCartMutation();
  const [toggleWishlist] = useToggleWishlistMutation();
  const { data: wishlistData } = useGetWishlistQuery();

  // Wishlist state
  const isWishlisted = useMemo(() => {
    return (
      wishlistData?.items?.some(
        (item) => item.productId === product.id
      ) ?? false
    );
  }, [wishlistData, product.id]);

  const [heartAnimating, setHeartAnimating] = useState(false);
  const [added, setAdded] = useState(false);

  const image = product.medias?.[0]?.url;
  const firstVariant = product.variants?.[0];
  const variantId = firstVariant?.id;

  // Price formatting – Naira (₦)
  const displayPrice = useMemo(() => {
    const price = firstVariant?.price;
    if (typeof price === "number") {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    }
    if (typeof price === "string") {
      return `₦${price}`;
    }
    return "Price N/A";
  }, [firstVariant]);

  // OEM display – now shows only the first OEM number
  const oemDisplay = useMemo(() => {
    const cleaned = extractOemNumbers(product.oemNumbers);
    if (!cleaned.length) return null;
    return cleaned[0]; // only the first one
  }, [product.oemNumbers]);

  // Stock status
  const stockStatus = useMemo(() => {
    if (!firstVariant?.inventories?.length) {
      return { available: false, totalStock: 0, isLowStock: false };
    }

    const totalStock = firstVariant.inventories.reduce(
      (sum: number, inv: any) => sum + (inv.stock - (inv.reserved ?? 0)),
      0
    );

    return {
      available: totalStock > 0,
      totalStock,
      isLowStock: totalStock > 0 && totalStock <= 5,
    };
  }, [firstVariant]);

  // Add to cart handler
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!variantId || !stockStatus.available) return;

    try {
      await addToCart({ variantId, quantity: 1 }).unwrap();
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      console.error("Add to cart failed:", err);
    }
  };

  // Wishlist toggle handler
  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 300);

    try {
      await toggleWishlist({ productId: product.id }).unwrap();
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="
        group relative flex flex-col
        overflow-hidden rounded-xl
        bg-white
        border border-gray-100
        shadow-sm
        transition-all duration-200 ease-out
        hover:shadow-lg hover:-translate-y-1
        cursor-pointer
      "
    >
      {/* IMAGE SECTION - SQUARE ASPECT, COMPACT */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <Package size={36} />
          </div>
        )}

        {/* WISHLIST BUTTON */}
        <button
          onClick={handleWishlist}
          className={`
            absolute top-2 right-2
            flex h-8 w-8 items-center justify-center rounded-full
            bg-white/80 backdrop-blur-sm
            shadow-sm
            transition-all duration-200
            hover:bg-white hover:scale-110 hover:shadow-md
            ${heartAnimating ? "scale-125" : "scale-100"}
          `}
        >
          <Bookmark
            size={16}
            className={`
              transition-colors duration-200
              ${
                isWishlisted
                  ? "fill-amber-500 text-amber-500"
                  : "text-gray-600 hover:text-amber-500"
              }
            `}
          />
        </button>

        {/* STOCK BADGES */}
        {!stockStatus.available && (
          <div className="absolute top-2 left-2 rounded-full bg-rose-500 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
            Out of Stock
          </div>
        )}
        {stockStatus.isLowStock && (
          <div className="absolute top-2 left-2 rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
            Only {stockStatus.totalStock} left
          </div>
        )}
      </div>

      {/* CONTENT SECTION */}
      <div className="flex flex-col gap-1.5 p-3.5">
        {/* PRODUCT TITLE */}
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-gray-800 group-hover:text-emerald-600 transition-colors">
          {product.name}
        </h3>

        {/* OEM NUMBER – now only the first one */}
        {oemDisplay && (
          <p className="line-clamp-1 text-xs text-gray-400">
            OEM: <span className="font-mono text-gray-500">{oemDisplay}</span>
          </p>
        )}

        {/* PRICE & ADD TO CART ROW */}
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-emerald-700">
            {displayPrice}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={!variantId || adding || !stockStatus.available}
            className={`
              flex items-center justify-center gap-1.5
              rounded-full px-4 py-1.5 text-xs font-medium
              transition-all duration-200 active:scale-95
              ${
                added
                  ? "bg-emerald-600 text-white"
                  : stockStatus.available
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600 shadow-sm"
                  : "cursor-not-allowed bg-gray-100 text-gray-400"
              }
            `}
          >
            {added ? (
              <>
                <Check size={14} strokeWidth={2.5} /> Added
              </>
            ) : adding ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <ShoppingCartIcon size={14} /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}