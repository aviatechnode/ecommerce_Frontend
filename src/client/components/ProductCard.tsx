import { ShoppingCart, Heart, Check, Package, Tag, Layers, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../admin/store/store";
import { addToCart } from "../../admin/state-management/cartSlice";
import { addToWishlist } from "../../admin/state-management/wishlistSlice";
import { useState, useMemo } from "react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: { id: string; name: string } | null;
  category: { id: string; name: string } | null;

  // ✅ FIXED: now matches backend
  oemNumbers: Array<{
    oemNumber: string;
  }>;

  variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    costPrice: number | null;
    weight: number | null;
    length: number | null;
    width: number | null;
    height: number | null;
    inventories: Array<{
      warehouseId: string;
      stock: number;
      reserved: number;
      threshold: number;
    }>;
  }>;

  medias: Array<{ url: string; type: "IMAGE" | "VIDEO"; position: number }>;
  specifications: Array<{ name: string; value: string }>;
  productFitments: Array<{ trimId: string; notes: string | null }>;
}

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const image = product.medias?.[0]?.url;
  const firstVariant = product.variants?.[0];
  const variantId = firstVariant?.id;

  // ✅ OEM formatter (safe + clean)
  const oemDisplay = useMemo(() => {
    if (!product.oemNumbers?.length) return null;

    const cleaned = product.oemNumbers
      .map((o) => o.oemNumber?.trim())
      .filter(Boolean);

    if (!cleaned.length) return null;

    // Optional: limit display (better UX)
    const visible = cleaned.slice(0, 2).join(", ");
    const extra = cleaned.length > 2 ? ` +${cleaned.length - 2}` : "";

    return visible + extra;
  }, [product.oemNumbers]);

  const priceRange = useMemo(() => {
    if (!product.variants?.length) return null;

    const prices = product.variants
      .map((v) => v.price)
      .filter((p): p is number => p != null);

    if (!prices.length) return null;

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return { min, max, hasRange: min !== max };
  }, [product.variants]);

  const stockStatus = useMemo(() => {
    if (!firstVariant?.inventories?.length) {
      return { available: false, totalStock: 0, isLowStock: false };
    }

    const totalStock = firstVariant.inventories.reduce(
      (sum, inv) => sum + (inv.stock - (inv.reserved ?? 0)),
      0
    );

    return {
      available: totalStock > 0,
      totalStock,
      isLowStock: totalStock > 0 && totalStock <= 5,
    };
  }, [firstVariant]);

  const firstSpec = product.specifications?.[0];
  const hasMultipleVariants = (product.variants?.length || 0) > 1;
  const hasMultipleImages = (product.medias?.length || 0) > 1;

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

  const handleWishlist = async (e: React.MouseEvent) => {
  e.stopPropagation();

  try {
    if (isWishlisted) {
      // optional: implement removeWishlistItem(productId)
      setIsWishlisted(false);
      return;
    }

    await dispatch(addToWishlist(product.id)).unwrap();
    setIsWishlisted(true);
  } catch (err) {
    console.error("Wishlist error:", err);
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
          <>
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />

            {hasMultipleImages && (
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                +{product.medias.length - 1} more
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50">
            <Package size={48} strokeWidth={1} />
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow-md hover:scale-110"
        >
          <Heart
            size={18}
            className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}
          />
        </button>

        {/* Stock */}
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
        {/* Brand + OEM */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {product.brand?.name && (
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                {product.brand.name}
              </span>
            )}

            {product.category?.name && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                {product.category.name}
              </span>
            )}
          </div>

          {/* ✅ FIXED OEM DISPLAY */}
          {oemDisplay && (
            <span className="text-xs text-gray-400 font-mono">
              OEM: {oemDisplay}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-gray-800 line-clamp-2 hover:text-green-600">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {product.description}
          </p>
        )}

        {firstSpec && (
          <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg w-fit">
            <Tag size={12} />
            <span>
              {firstSpec.name}: {firstSpec.value}
            </span>
          </div>
        )}

        {hasMultipleVariants && (
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <Layers size={12} />
            <span>{product.variants.length} variants available</span>
          </div>
        )}

        {/* PRICE */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            {priceRange ? (
              <div>
                <span className="text-2xl font-bold text-green-600">
                  ₦{priceRange.min.toLocaleString()}
                  {priceRange.hasRange && (
                    <span className="text-sm text-gray-500 ml-1">
                      - ₦{priceRange.max.toLocaleString()}
                    </span>
                  )}
                </span>
                {hasMultipleVariants && (
                  <div className="text-xs text-gray-400">Starting from</div>
                )}
              </div>
            ) : (
              <span className="text-xl font-bold text-green-600">
                Price on request
              </span>
            )}
          </div>

          {/* ADD TO CART */}
          <button
            onClick={handleAddToCart}
            disabled={!variantId || adding || !stockStatus.available}
            className={`p-2.5 rounded-xl flex items-center gap-2 ${
              added
                ? "bg-green-700"
                : stockStatus.available
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-300"
            }`}
          >
            {added ? (
              <>
                <Check size={18} className="text-white" />
              </>
            ) : adding ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart size={18} className="text-white" />
              </>
            )}
          </button>
        </div>

        {/* STOCK INFO */}
        {stockStatus.available && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <AlertCircle size={10} />
            <span>{stockStatus.totalStock} units in stock</span>
          </div>
        )}
      </div>
    </div>
  );
}