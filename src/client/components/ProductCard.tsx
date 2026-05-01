import {
  ShoppingCart,
  Heart,
  Check,
  Package,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../admin/store/store";
import { addToCart } from "../../admin/state-management/cartSlice";
import { toggleWishlist } from "../../admin/state-management/wishlistSlice";
import { useState, useMemo } from "react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: { id: string; name: string } | null;
  category: { id: string; name: string } | null;

  oemNumbers: { oemNumber: string }[];

  variants: any[];
  medias: { url: string }[];
  specifications: { name: string; value: string }[];
}

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  //////////////////////////////////////////////////////////
  // GLOBAL STATE
  //////////////////////////////////////////////////////////
  const wishlistItems = useSelector(
    (state: any) => state.wishlist.wishlist?.items || []
  );

  const isWishlistedGlobal = wishlistItems.some(
    (item: any) => item.productId === product.id
  );

  //////////////////////////////////////////////////////////
  // 🔥 OPTIMISTIC LOCAL STATE
  //////////////////////////////////////////////////////////
  const [optimisticWish, setOptimisticWish] = useState<boolean | null>(null);
  const [heartAnimating, setHeartAnimating] = useState(false);

  const isWishlisted =
    optimisticWish !== null ? optimisticWish : isWishlistedGlobal;

  //////////////////////////////////////////////////////////
  // CART STATE
  //////////////////////////////////////////////////////////
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const image = product.medias?.[0]?.url;
  const firstVariant = product.variants?.[0];
  const variantId = firstVariant?.id;

  //////////////////////////////////////////////////////////
  // OEM
  //////////////////////////////////////////////////////////
  const oemDisplay = useMemo(() => {
    if (!product.oemNumbers?.length) return null;

    const cleaned = product.oemNumbers
      .map((o) => o.oemNumber?.trim())
      .filter(Boolean);

    if (!cleaned.length) return null;

    const visible = cleaned.slice(0, 2).join(", ");
    const extra = cleaned.length > 2 ? ` +${cleaned.length - 2}` : "";

    return visible + extra;
  }, [product.oemNumbers]);

  //////////////////////////////////////////////////////////
  // STOCK
  //////////////////////////////////////////////////////////
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

  //////////////////////////////////////////////////////////
  // ADD TO CART
  //////////////////////////////////////////////////////////
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!variantId || adding || !stockStatus.available) return;

    try {
      setAdding(true);

      await dispatch(
        addToCart({
          variantId,
          quantity: 1,
        })
      ).unwrap();

      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } finally {
      setAdding(false);
    }
  };

  //////////////////////////////////////////////////////////
  // ❤️ OPTIMISTIC WISHLIST
  //////////////////////////////////////////////////////////
  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const newState = !isWishlisted;

    // ⚡ instant UI update
    setOptimisticWish(newState);

    // ❤️ trigger animation
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 300);

    try {
      await dispatch(toggleWishlist(product.id)).unwrap();

      // clear optimistic override after success
      setOptimisticWish(null);
    } catch (err) {
      console.error("Wishlist error:", err);

      // ❌ revert UI if failed
      setOptimisticWish(!newState);
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-green-200 transform hover:-translate-y-1"
    >
      {/* IMAGE */}
      <div className="relative h-52 bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Package size={48} />
          </div>
        )}

        {/* ❤️ WISHLIST BUTTON */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow-md transition-transform
            ${heartAnimating ? "scale-125" : "scale-100"}
          `}
        >
          <Heart
            size={18}
            className={`transition-all duration-300 ${
              isWishlisted
                ? "fill-red-500 text-red-500 scale-110"
                : "text-gray-600"
            }`}
          />
        </button>

        {/* STOCK */}
        {!stockStatus.available && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-lg">
            Out of Stock
          </div>
        )}

        {stockStatus.isLowStock && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-lg">
            Low Stock ({stockStatus.totalStock})
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <span className="font-semibold">{product.name}</span>
          {oemDisplay && (
            <span className="text-xs text-gray-400">{oemDisplay}</span>
          )}
        </div>

        {/* CART */}
        <button
          onClick={handleAddToCart}
          disabled={!variantId || adding || !stockStatus.available}
          className={`p-2.5 rounded-xl ${
            added
              ? "bg-green-700"
              : stockStatus.available
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-300"
          }`}
        >
          {added ? (
            <Check size={18} className="text-white" />
          ) : adding ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ShoppingCart size={18} className="text-white" />
          )}
        </button>

        {stockStatus.available && (
          <div className="text-xs text-green-600 flex items-center gap-1">
            <AlertCircle size={10} />
            {stockStatus.totalStock} in stock
          </div>
        )}
      </div>
    </div>
  );
}