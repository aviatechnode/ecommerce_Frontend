import { ShoppingCart, Heart, Check, Package, Tag, Layers, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../admin/store/store";
import { addToCart } from "../../admin/state-management/cartSlice";
import { useState, useMemo } from "react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: { id: string; name: string } | null;
  category: { id: string; name: string } | null;
  oemNumber: string | null;
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

  // Extract product information with enhanced properties
  const image = product.medias?.[0]?.url;
  const firstVariant = product.variants?.[0];
  const variantId = firstVariant?.id;

  // Calculate price range across all variants
  const priceRange = useMemo(() => {
    if (!product.variants?.length) return null;
    const prices = product.variants
      .map((v) => v.price)
      .filter((p): p is number => p != null);
    if (prices.length === 0) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { min, max, hasRange: min !== max };
  }, [product.variants]);

  // Calculate stock status from first variant's inventories
  const stockStatus = useMemo(() => {
    if (!firstVariant?.inventories?.length)
      return { available: false, totalStock: 0, isLowStock: false };

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

  // Get first specification if exists
  const firstSpec = product.specifications?.[0];

  // Check if product has multiple variants
  const hasMultipleVariants = (product.variants?.length || 0) > 1;

  // Check if product has any media
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

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    // Add wishlist API call here if needed
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-green-200 transform hover:-translate-y-1"
    >
      {/* IMAGE SECTION */}
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
              <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                +{product.medias.length - 1} more
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50">
            <Package size={48} strokeWidth={1} />
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-110"
        >
          <Heart
            size={18}
            className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}
          />
        </button>

        {/* Stock Status Badge */}
        {!stockStatus.available && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-lg shadow-md">
            Out of Stock
          </div>
        )}
        {stockStatus.isLowStock && stockStatus.available && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-lg shadow-md">
            Low Stock ({stockStatus.totalStock})
          </div>
        )}
      </div>

      {/* CONTENT SECTION */}
      <div className="p-4 space-y-3">
        {/* Brand & Category Row */}
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

          {/* OEM Number if exists */}
          {product.oemNumber && (
            <span className="text-xs text-gray-400 font-mono">
              OEM: {product.oemNumber}
            </span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-800 line-clamp-2 text-base hover:text-green-600 transition-colors">
          {product.name}
        </h3>

        {/* Description Preview */}
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Specification Preview */}
        {firstSpec && (
          <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg w-fit">
            <Tag size={12} />
            <span>
              {firstSpec.name}: {firstSpec.value}
            </span>
          </div>
        )}

        {/* Variants Info */}
        {hasMultipleVariants && (
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <Layers size={12} />
            <span>{product.variants?.length} variants available</span>
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            {priceRange ? (
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-green-600">
                  ₦{priceRange.min.toLocaleString()}
                  {priceRange.hasRange && (
                    <span className="text-sm text-gray-500 font-normal ml-1">
                      - ₦{priceRange.max.toLocaleString()}
                    </span>
                  )}
                </span>
                {hasMultipleVariants && (
                  <span className="text-xs text-gray-400">Starting from</span>
                )}
              </div>
            ) : (
              <span className="text-xl font-bold text-green-600">
                Price on request
              </span>
            )}
          </div>

          {/* Add to Cart Button with Stock Awareness */}
          <button
            onClick={handleAddToCart}
            disabled={!variantId || adding || !stockStatus.available}
            className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2
              ${
                added
                  ? "bg-green-700 hover:bg-green-800"
                  : stockStatus.available
                  ? "bg-green-600 hover:bg-green-700 hover:shadow-lg active:scale-95"
                  : "bg-gray-300 cursor-not-allowed"
              } disabled:opacity-50`}
          >
            {added ? (
              <>
                <Check size={18} className="text-white" />
                <span className="text-white text-sm font-medium hidden sm:inline">
                  Added!
                </span>
              </>
            ) : adding ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart size={18} className="text-white" />
                <span className="text-white text-sm font-medium hidden sm:inline">
                  {!stockStatus.available ? "Out of stock" : "Add"}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Quick Stock Info */}
        {stockStatus.available && stockStatus.totalStock > 0 && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <AlertCircle size={10} />
            <span>{stockStatus.totalStock} units in stock</span>
          </div>
        )}
      </div>
    </div>
  );
}