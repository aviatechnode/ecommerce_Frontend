import {
  ShoppingCartIcon,
  Heart,
  Check,
  Package,
  AlertCircle,
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

/* =========================================================
TYPES
========================================================= */

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

/* =========================================================
COMPONENT
========================================================= */

export default function ProductCard({ product }: Props) {
  const navigate = useNavigate();

  //////////////////////////////////////////////////////////
  // RTK QUERY HOOKS
  //////////////////////////////////////////////////////////

  const [addToCart, { isLoading: adding }] =
    useAddToCartMutation();

  const [toggleWishlist] =
    useToggleWishlistMutation();

  const { data: wishlistData } =
    useGetWishlistQuery();

  //////////////////////////////////////////////////////////
  // WISHLIST STATE (GLOBAL ONLY)
  //////////////////////////////////////////////////////////

  const isWishlisted = useMemo(() => {
    return (
      wishlistData?.items?.some(
        (item) => item.productId === product.id
      ) ?? false
    );
  }, [wishlistData, product.id]);

  const [heartAnimating, setHeartAnimating] =
    useState(false);

  //////////////////////////////////////////////////////////
  // LOCAL UI STATE
  //////////////////////////////////////////////////////////

  const [added, setAdded] = useState(false);

  const image = product.medias?.[0]?.url;
  const firstVariant = product.variants?.[0];
  const variantId = firstVariant?.id;

  //////////////////////////////////////////////////////////
  // OEM DISPLAY
  //////////////////////////////////////////////////////////

  const oemDisplay = useMemo(() => {
    if (!product.oemNumbers?.length) return null;

    const cleaned = product.oemNumbers
      .map((o) => o.oemNumber?.trim())
      .filter(Boolean);

    if (!cleaned.length) return null;

    const visible = cleaned.slice(0, 2).join(", ");
    const extra =
      cleaned.length > 2
        ? ` +${cleaned.length - 2}`
        : "";

    return visible + extra;
  }, [product.oemNumbers]);

  //////////////////////////////////////////////////////////
  // STOCK
  //////////////////////////////////////////////////////////

  const stockStatus = useMemo(() => {
    if (!firstVariant?.inventories?.length) {
      return {
        available: false,
        totalStock: 0,
        isLowStock: false,
      };
    }

    const totalStock =
      firstVariant.inventories.reduce(
        (sum: number, inv: any) =>
          sum +
          (inv.stock - (inv.reserved ?? 0)),
        0
      );

    return {
      available: totalStock > 0,
      totalStock,
      isLowStock:
        totalStock > 0 && totalStock <= 5,
    };
  }, [firstVariant]);

  //////////////////////////////////////////////////////////
  // ADD TO CART (RTK QUERY)
  //////////////////////////////////////////////////////////

  const handleAddToCart = async (
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (!variantId || !stockStatus.available)
      return;

    try {
      await addToCart({
        variantId,
        quantity: 1,
      }).unwrap();

      setAdded(true);

      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      console.error("Add to cart failed:", err);
    }
  };

  //////////////////////////////////////////////////////////
  // WISHLIST TOGGLE (RTK QUERY)
  //////////////////////////////////////////////////////////

  const handleWishlist = async (
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    setHeartAnimating(true);

    setTimeout(
      () => setHeartAnimating(false),
      300
    );

    try {
      await toggleWishlist({
        productId: product.id,
      }).unwrap();
    } catch (err) {
      console.error(
        "Wishlist error:",
        err
      );
    }
  };

  //////////////////////////////////////////////////////////
  // RENDER
  //////////////////////////////////////////////////////////

  return (
    <div
      onClick={() =>
        navigate(`/product/${product.id}`)
      }
      className="
        group
        flex
        h-full
        min-h-105
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-gray-100
        bg-white
        shadow-lg
        transition-all
        duration-300
        cursor-pointer
        hover:-translate-y-1
        hover:border-green-200
        hover:shadow-2xl
      "
    >
      {/* IMAGE */}
      <div className="
        relative
        aspect-4/3
        w-full
        overflow-hidden
        bg-linear-to-br
        from-gray-50
        to-gray-100
        shrink-0
      ">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-110
            "
          />
        ) : (
          <div className="
            flex
            h-full
            items-center
            justify-center
            text-gray-400
          ">
            <Package size={48} />
          </div>
        )}

        {/* WISHLIST */}
        <button
          onClick={handleWishlist}
          className={`
            absolute top-3 right-3 rounded-full
            bg-white/90 p-2 shadow-md
            transition-transform
            ${heartAnimating ? "scale-125" : "scale-100"}
          `}
        >
          <Heart
            size={18}
            className={`
              transition-all duration-300
              ${
                isWishlisted
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-gray-600"
              }
            `}
          />
        </button>

        {/* STOCK */}
        {!stockStatus.available && (
          <div className="
            absolute top-3 left-3
            rounded-lg bg-red-500
            px-2 py-1 text-xs text-white
          ">
            Out of Stock
          </div>
        )}

        {stockStatus.isLowStock && (
          <div className="
            absolute top-3 left-3
            rounded-lg bg-orange-500
            px-2 py-1 text-xs text-white
          ">
            Low Stock ({stockStatus.totalStock})
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="space-y-2">
          <h3 className="
            line-clamp-2 min-h-12
            text-sm font-semibold
            text-gray-900
          ">
            {product.name}
          </h3>

          {oemDisplay && (
            <p className="
              text-xs text-gray-400
              line-clamp-1
            ">
              {oemDisplay}
            </p>
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-4 space-y-3">
          <button
            onClick={handleAddToCart}
            disabled={
              !variantId ||
              adding ||
              !stockStatus.available
            }
            className={`
              flex w-full items-center justify-center
              rounded-xl py-3 transition-all
              ${
                added
                  ? "bg-green-700"
                  : stockStatus.available
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-300"
              }
            `}
          >
            {added ? (
              <Check
                size={18}
                className="text-white"
              />
            ) : adding ? (
              <div className="
                h-5 w-5 animate-spin
                rounded-full border-2
                border-white border-t-transparent
              " />
            ) : (
              <ShoppingCartIcon
                size={18}
                className="text-white"
              />
            )}
          </button>

          <div className="min-h-5">
            {stockStatus.available && (
              <div className="
                flex items-center gap-1
                text-xs text-green-600
              ">
                <AlertCircle size={10} />
                {stockStatus.totalStock} in stock
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}