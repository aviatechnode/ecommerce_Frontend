import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart, Heart, Check, Package, Tag, AlertCircle, ChevronLeft,
  Minus, Plus, Truck, ShieldCheck, RefreshCw, Star, Edit, Trash2,
  X, Info,
} from "lucide-react";

import { useGetProductQuery, type Product } from "../../services/productApi";
import { useAddToCartMutation } from "../../services/cartApi";
import {
  useGetReviewsQuery,
  useGetRatingSummaryQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from "../../services/reviewApi";

import {
  useGetWishlistQuery,
  useToggleWishlistMutation,
  useRemoveWishlistItemMutation,
} from "../../services/wishlistApi";

import type { ProductVariant, Media } from "../../schemas/product.schema";

interface ExtendedProduct extends Product {
  brand?: { id: string; name: string } | null;
  category?: { id: string; name: string } | null;
}

const getAvailableStock = (inventories: Array<{ stock: number; reserved: number }> = []) => {
  return inventories.reduce((sum, inv) => sum + (inv.stock - (inv.reserved || 0)), 0);
};

const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-slide-up ${
      type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
    }`}>
      {type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80"><X size={16} /></button>
    </div>
  );
};

// ==============================
// CUSTOM HOOKS
// ==============================

function useProductData(productId: string | undefined) {
  const { 
    data: product, 
    isLoading: loading, 
    error: productError,
    refetch: refetchProduct
  } = useGetProductQuery(productId || "", { skip: !productId });

  const { 
    data: reviews = [], 
    isLoading: reviewsLoading, 
    error: reviewsError,
    refetch: refetchReviews
  } = useGetReviewsQuery(productId || "", { skip: !productId });

  const {
    data: ratingSummary,
    refetch: refetchSummary
  } = useGetRatingSummaryQuery(productId || "", { skip: !productId });

  useEffect(() => {
    if (productId) {
      refetchProduct();
      refetchReviews();
      refetchSummary();
    }
  }, [productId, refetchProduct, refetchReviews, refetchSummary]);

  const averageRating = ratingSummary?.averageRating || 0;
  const totalReviews = ratingSummary?.totalReviews || 0;

  const extendedProduct: ExtendedProduct | null = product ? { ...product } as ExtendedProduct : null;

  return { 
    product: extendedProduct, 
    loading, 
    error: productError, 
    reviews, 
    averageRating, 
    totalReviews, 
    reviewsLoading, 
    reviewsError,
  };
}

function useVariantManager(product: ExtendedProduct | null) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const selectedVariant = useMemo(() => {
    if (!product || !selectedVariantId) return null;
    return product.variants?.find((v) => v.id === selectedVariantId) || null;
  }, [product, selectedVariantId]);

  const stockStatus = useMemo(() => {
    if (!selectedVariant?.inventories?.length) {
      return { available: false, totalStock: 0, isLowStock: false };
    }
    const totalStock = getAvailableStock(selectedVariant.inventories);
    return {
      available: totalStock > 0,
      totalStock,
      isLowStock: totalStock > 0 && totalStock <= 5,
    };
  }, [selectedVariant]);

  useEffect(() => {
    if (product?.variants?.length && !selectedVariantId) {
      const firstVariantId = product.variants[0].id;
      if (firstVariantId) setSelectedVariantId(firstVariantId);
    }
  }, [product, selectedVariantId]);

  return { selectedVariantId, setSelectedVariantId, selectedVariant, stockStatus };
}

function useCartActions(selectedVariantId: string | null, stockStatus: { available: boolean; totalStock: number }) {
  const [addToCart, { isLoading: adding }] = useAddToCartMutation();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const increaseQty = () => {
    if (quantity < stockStatus.totalStock) setQuantity((q) => q + 1);
  };
  const decreaseQty = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  const handleAddToCart = async () => {
    if (!selectedVariantId || adding || !stockStatus.available) return;
    try {
      await addToCart({ variantId: selectedVariantId, quantity }).unwrap();
      setAdded(true);
      setToast({ message: "Added to cart!", type: "success" });
      setTimeout(() => setAdded(false), 2000);
    } catch (err: any) {
      setToast({ message: err.message || "Failed to add to cart", type: "error" });
    }
  };

  return { quantity, adding, added, toast, setToast, increaseQty, decreaseQty, handleAddToCart };
}

function useReviewActions(productId: string | undefined) {
  const [createReview, { isLoading: createLoading }] = useCreateReviewMutation();
  const [updateReview, { isLoading: updateLoading }] = useUpdateReviewMutation();
  const [deleteReview, { isLoading: deleteLoading }] = useDeleteReviewMutation();
  const { refetch: refetchReviews } = useGetReviewsQuery(productId || "", { skip: !productId });
  const { refetch: refetchSummary } = useGetRatingSummaryQuery(productId || "", { skip: !productId });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submitLoading = createLoading || updateLoading || deleteLoading;

  const handleCreate = async (data: { title: string; rating: number; comment: string }) => {
    if (!productId) return;
    setErrorMessage(null);
    try {
      await createReview({ productId, ...data }).unwrap();
      await Promise.all([refetchReviews(), refetchSummary()]);
      setShowCreateForm(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create review");
    }
  };

  const handleUpdate = async (reviewId: string, data: { title: string; rating: number; comment: string }) => {
    if (!productId) return;
    setErrorMessage(null);
    try {
      await updateReview({ id: reviewId, productId, data }).unwrap();
      await Promise.all([refetchReviews(), refetchSummary()]);
      setEditingReviewId(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update review");
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!productId) return;
    setErrorMessage(null);
    try {
      await deleteReview({ id: reviewId, productId }).unwrap();
      await Promise.all([refetchReviews(), refetchSummary()]);
      setDeleteConfirmId(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete review");
    }
  };

  return {
    showCreateForm, setShowCreateForm,
    editingReviewId, setEditingReviewId,
    deleteConfirmId, setDeleteConfirmId,
    submitLoading,
    errorMessage,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}

// ==============================
// HELPER COMPONENTS
// ==============================

const StarRatingInput = ({ rating, onChange, size = 28 }: {
  rating: number;
  onChange: (val: number) => void;
  size?: number;
}) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            size={size}
            className={`transition-colors ${
              star <= (hover || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewForm = ({ initialData, onSubmit, onCancel, loading, error }: {
  initialData?: { title?: string; rating?: number; comment?: string } | null;
  onSubmit: (data: { title: string; rating: number; comment: string }) => void;
  onCancel: () => void;
  loading: boolean;
  error?: string | null;
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [comment, setComment] = useState(initialData?.comment || "");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    if (rating === 0) {
      setValidationError("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      setValidationError("Please write a review");
      return;
    }
    onSubmit({ title, rating, comment });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-5 space-y-4 border border-gray-100">
      {(validationError || error) && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg flex items-center gap-2">
          <AlertCircle size={16} /> {validationError || error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating <span className="text-red-500">*</span></label>
        <StarRatingInput rating={rating} onChange={setRating} size={28} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Review <span className="text-red-500">*</span></label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition">
          {loading ? "Submitting..." : initialData ? "Update Review" : "Submit Review"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition">
          Cancel
        </button>
      </div>
    </form>
  );
};

const ProductImageGallery = ({ medias, mainImage, setMainImage }: {
  medias: Media[];
  mainImage: string | null;
  setMainImage: (url: string) => void;
}) => {
  const imageMedias = medias?.filter(m => m.type === "IMAGE") || [];

  return (
    <div className="space-y-4">
      <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-md">
        {mainImage ? (
          <img src={mainImage} alt="Product" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400"><Package size={64} strokeWidth={1} /></div>
        )}
      </div>
      {imageMedias.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {imageMedias.map((media, idx) => (
            <button
              key={media.id || `${media.url}-${idx}`}
              onMouseEnter={() => setMainImage(media.url)}
              onClick={() => setMainImage(media.url)}
              className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                mainImage === media.url ? "border-green-500 shadow-md" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <img src={media.url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const VariantSelector = ({ variants, selectedId, onChange }: {
  variants: ProductVariant[];
  selectedId: string | null;
  onChange: (id: string) => void;
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">Select Variant</label>
    <div className="flex flex-wrap gap-3">
      {variants.map((variant) => (
        <button
          key={variant.id}
          onClick={() => variant.id && onChange(variant.id)}
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
            selectedId === variant.id
              ? "border-green-600 bg-green-50 text-green-700 shadow-sm"
              : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:shadow-sm"
          }`}
          disabled={!variant.id}
        >
          {variant.name}
        </button>
      ))}
    </div>
  </div>
);

const ProductDetailsSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse mb-6" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-4">
        <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
        <div className="flex gap-2">
          {[1, 2, 3].map(i => <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse" />)}
        </div>
      </div>
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="h-20 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
        <div className="h-12 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

// ==============================
// MAIN COMPONENT
// ==============================
export default function ProductDetails() {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { product, loading, error, reviews, averageRating, totalReviews, reviewsLoading, reviewsError } = useProductData(productId);
  const { selectedVariantId, setSelectedVariantId, selectedVariant, stockStatus } = useVariantManager(product);
  const { quantity, adding, added, toast, setToast, increaseQty, decreaseQty, handleAddToCart } = useCartActions(selectedVariantId, stockStatus);
  const reviewActions = useReviewActions(productId);

  const { data: wishlist, refetch: refetchWishlist } = useGetWishlistQuery();
  const [toggleWishlist, { isLoading: toggleWishlistLoading }] = useToggleWishlistMutation();
  const [removeFromWishlist, { isLoading: removeFromWishlistLoading }] = useRemoveWishlistItemMutation();

  const [mainImage, setMainImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"specs" | "fitment" | "reviews">("specs");
  const [showStickyBar, setShowStickyBar] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const reviewSectionRef = useRef<HTMLDivElement>(null);

  const isInWishlist = useMemo(() => {
    if (!wishlist?.items || !product?.id) return false;
    return wishlist.items.some(item => item.productId === product.id);
  }, [wishlist, product?.id]);

  const wishlistLoading = toggleWishlistLoading || removeFromWishlistLoading;

  useEffect(() => {
    if (product && !mainImage) {
      const firstImage = product.medias?.find((m) => m.type === "IMAGE")?.url || null;
      setMainImage(firstImage);
    }
  }, [product, mainImage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-100px 0px 0px 0px" }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleWriteReviewClick = () => {
    setActiveTab("reviews");
    reviewActions.setShowCreateForm(true);
    reviewActions.setEditingReviewId(null);
    setTimeout(() => {
      reviewSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleWishlistToggle = async () => {
    if (!product?.id) return;
    try {
      if (isInWishlist) {
        const wishlistItem = wishlist?.items.find(item => item.productId === product.id);
        if (wishlistItem?.id) {
          await removeFromWishlist({ wishlistItemId: wishlistItem.id }).unwrap();
        } else {
          await removeFromWishlist({ productId: product.id }).unwrap();
        }
        setToast({ message: "Removed from wishlist", type: "success" });
      } else {
        await toggleWishlist({ productId: product.id }).unwrap();
        setToast({ message: "Added to wishlist", type: "success" });
      }
      await refetchWishlist();
    } catch (err: any) {
      setToast({ message: err.message || "Failed to update wishlist", type: "error" });
    }
  };

  const oemDisplay = useMemo(() => {
    if (!product?.oemNumbers?.length) return null;
    const cleaned = product.oemNumbers.map((o) => o.oemNumber?.trim()).filter(Boolean);
    if (!cleaned.length) return null;
    const visible = cleaned.slice(0, 3).join(", ");
    const extra = cleaned.length > 3 ? ` +${cleaned.length - 3}` : "";
    return visible + extra;
  }, [product]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  if (loading) return <ProductDetailsSkeleton />;

  // ✅ FIX: Safely extract error message
  const getErrorMessage = (err: unknown): string => {
    if (typeof err === "string") return err;
    if (err && typeof err === "object") {
      const anyErr = err as any;
      if (anyErr.message) return anyErr.message;
      if (anyErr.data?.message) return anyErr.data.message;
      if (anyErr.status && anyErr.data) return `Error ${anyErr.status}: ${JSON.stringify(anyErr.data)}`;
    }
    return "Product not found";
  };

  if (error || !product) {
    const errorMsg = getErrorMessage(error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <AlertCircle size={48} className="text-red-500" />
        <p className="text-gray-600 text-center">{errorMsg}</p>
        <button onClick={() => navigate("/")} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-green-600 mb-6 transition group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="animate-fade-in">
            <ProductImageGallery medias={product.medias || []} mainImage={mainImage} setMainImage={setMainImage} />
          </div>

          <div className="space-y-6 animate-slide-up">
            <div ref={observerRef} className="relative -top-20" />

            <div className="flex flex-wrap gap-2">
              {product.brand?.name && (
                <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                  Brand: {product.brand.name}
                </span>
              )}
              {product.category?.name && (
                <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                  Category: {product.category.name}
                </span>
              )}
              {oemDisplay && (
                <span className="text-xs text-gray-500 font-mono bg-gray-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Tag size={12} /> OEM: {oemDisplay}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{product.name}</h1>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={18} className={star <= Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({totalReviews} {totalReviews === 1 ? "review" : "reviews"})</span>
              <button onClick={handleWriteReviewClick} className="ml-auto text-sm text-green-600 hover:text-green-700 font-medium transition">
                Write a review
              </button>
            </div>

            {product.description && <p className="text-gray-600 leading-relaxed">{product.description}</p>}

            {product.variants && product.variants.length > 1 && (
              <VariantSelector variants={product.variants} selectedId={selectedVariantId} onChange={setSelectedVariantId} />
            )}

            <div className="border-t border-b border-gray-200 py-4 space-y-3">
              <div className="flex items-baseline gap-2">
                {selectedVariant ? (
                  <>
                    <span className="text-3xl font-bold text-green-600">₦{selectedVariant.price.toLocaleString()}</span>
                    {selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > 0 && (
                      <span className="text-sm text-gray-400 line-through">₦{selectedVariant.compareAtPrice.toLocaleString()}</span>
                    )}
                  </>
                ) : (
                  <span className="text-xl text-gray-500">Price on request</span>
                )}
              </div>
              {stockStatus.available ? (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-700 font-medium">In stock</span>
                  <span className="text-gray-500">({stockStatus.totalStock} units)</span>
                  {stockStatus.isLowStock && <span className="text-orange-600">– Only {stockStatus.totalStock} left</span>}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle size={14} /> Out of stock
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariantId || adding || !stockStatus.available}
                className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  added ? "bg-green-700 text-white" : stockStatus.available ? "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {added ? <><Check size={20} /> Added to Cart</> : adding ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><ShoppingCart size={20} /> Add to Cart</>}
              </button>
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50 group relative"
                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                {wishlistLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart 
                    size={20} 
                    className={`transition-all ${
                      isInWishlist 
                        ? "fill-orange-400 text-orange-400 group-hover:scale-110" 
                        : "text-gray-600 group-hover:text-red-500 group-hover:scale-110"
                    }`} 
                  />
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600"><Truck size={18} className="text-green-600" /><span>Fast delivery</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><RefreshCw size={18} className="text-green-600" /><span>30-day returns</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><ShieldCheck size={18} className="text-green-600" /><span>2-year warranty</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><Tag size={18} className="text-green-600" /><span>Secure payment</span></div>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-6">
            <nav className="flex gap-6 overflow-x-auto custom-scrollbar">
              {product.specifications && product.specifications.length > 0 && (
                <button onClick={() => setActiveTab("specs")} className={`py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === "specs" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-700"
                }`}>Specifications</button>
              )}
              {product.productFitments && product.productFitments.length > 0 && (
                <button onClick={() => setActiveTab("fitment")} className={`py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === "fitment" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-700"
                }`}>Vehicle Fitment</button>
              )}
              <button onClick={() => setActiveTab("reviews")} className={`py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "reviews" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-700"
              }`}>Reviews ({totalReviews})</button>
            </nav>
          </div>

          <div className="p-6" ref={reviewSectionRef}>
            {activeTab === "specs" && product.specifications && product.specifications.length > 0 && (
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {product.specifications.map((spec, idx) => (
                  <div key={idx} className="flex py-2 border-b border-gray-100">
                    <dt className="w-1/3 text-sm font-medium text-gray-700">{spec.name}</dt>
                    <dd className="w-2/3 text-sm text-gray-600">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {activeTab === "fitment" && product.productFitments && product.productFitments.length > 0 && (
              <div className="space-y-2">
                {product.productFitments.map((fit, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-600 py-2 border-b border-gray-100">
                    <Info size={16} className="text-green-500 mt-0.5" />
                    <span><strong>Trim ID:</strong> {fit.trimId} {fit.notes && <>– {fit.notes}</>}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                {reviewActions.showCreateForm && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3">Write a new review</h3>
                    <ReviewForm
                      onSubmit={reviewActions.handleCreate}
                      onCancel={() => reviewActions.setShowCreateForm(false)}
                      loading={reviewActions.submitLoading}
                      error={reviewActions.errorMessage}
                    />
                  </div>
                )}

                {reviewsLoading ? (
                  <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>
                ) : reviewsError ? (
                  <div className="text-center py-8 text-red-500 flex items-center justify-center gap-2"><AlertCircle size={20} /> Failed to load reviews</div>
                ) : reviews.length === 0 && !reviewActions.showCreateForm ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Star size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No reviews yet.</p>
                    <button onClick={handleWriteReviewClick} className="mt-3 text-green-600 hover:text-green-700 font-medium transition">
                      Be the first to review this product
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                        {reviewActions.editingReviewId === review.id ? (
                          <ReviewForm
                            initialData={{ title: review.title || "", rating: review.rating, comment: review.comment || "" }}
                            onSubmit={(data) => reviewActions.handleUpdate(review.id, data)}
                            onCancel={() => reviewActions.setEditingReviewId(null)}
                            loading={reviewActions.submitLoading}
                            error={reviewActions.errorMessage}
                          />
                        ) : (
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} size={16} className={star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                                  ))}
                                </div>
                                {review.title && <span className="font-semibold text-gray-900">{review.title}</span>}
                              </div>
                              <p className="text-gray-600 mt-2">{review.comment}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                <span>{review.user?.name || "Anonymous"}</span>
                                <span>•</span>
                                <span>{formatDate(review.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => reviewActions.setEditingReviewId(review.id)} className="p-1 text-gray-400 hover:text-green-600 transition"><Edit size={16} /></button>
                              {reviewActions.deleteConfirmId === review.id ? (
                                <div className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                                  <button onClick={() => reviewActions.handleDelete(review.id)} className="text-xs text-red-600 hover:text-red-700">Confirm</button>
                                  <button onClick={() => reviewActions.setDeleteConfirmId(null)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                                </div>
                              ) : (
                                <button onClick={() => reviewActions.setDeleteConfirmId(review.id)} className="p-1 text-gray-400 hover:text-red-600 transition"><Trash2 size={16} /></button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showStickyBar && stockStatus.available && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 flex items-center justify-between gap-3 animate-slide-up z-40 md:hidden">
          <div>
            <p className="text-sm font-medium text-gray-900">{product.name}</p>
            <p className="text-lg font-bold text-green-600">₦{selectedVariant?.price?.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button onClick={decreaseQty} className="px-3 py-1.5" disabled={quantity <= 1}><Minus size={16} /></button>
              <span className="w-8 text-center">{quantity}</span>
              <button onClick={increaseQty} className="px-3 py-1.5" disabled={quantity >= stockStatus.totalStock}><Plus size={16} /></button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold flex items-center gap-2"
            >
              {adding ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ShoppingCart size={18} />}
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}