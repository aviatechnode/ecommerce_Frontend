import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../admin/store/store";
import { fetchProduct, clearProduct } from "../../admin/state-management/productSlice";
import { addToCart } from "../../admin/state-management/cartSlice";
import {
  ShoppingCart, Heart, Check, Package, Tag, AlertCircle, ChevronLeft,
  Minus, Plus, Truck, ShieldCheck, RefreshCw, Star, Edit, Trash2,
  X, Info,
} from "lucide-react";
import {
  fetchReviews,
  fetchRatingSummary,
  createReview,
  updateReview,
  deleteReview,
} from "../../admin/state-management/reviewSlice";

// ==============================
// 1. TYPES
// ==============================
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: { id: string; name: string } | null;
  category: { id: string; name: string } | null;
  oemNumbers: Array<{ oemNumber: string }>;
  variants: Variant[];
  medias: Media[];
  specifications: Array<{ name: string; value: string }>;
  productFitments: Array<{ trimId: string; notes: string | null }>;
}

interface Variant {
  id: string;
  name: string;
  sku: string;
  price: number;
  costPrice: number | null;
  compareAtPrice?: number | null;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  inventories: Inventory[];
}

interface Inventory {
  warehouseId: string;
  stock: number;
  reserved: number;
  threshold: number;
}

interface Media {
  url: string;
  type: "IMAGE" | "VIDEO";
  position: number;
}

// Toast notification component (inline for simplicity)
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
// 2. CUSTOM HOOKS (same logic, enhanced)
// ==============================

function useProductData(productId: string | undefined) {
  const dispatch = useDispatch<AppDispatch>();
  const product = useSelector((state: RootState) => state.adminProducts.product) as Product | null;
  const loading = useSelector((state: RootState) => state.adminProducts.loading);
  const error = useSelector((state: RootState) => state.adminProducts.error);

  const reviews = useSelector((state: RootState) => state.reviews.reviews);
  const averageRating = useSelector((state: RootState) => state.reviews.averageRating);
  const totalReviews = useSelector((state: RootState) => state.reviews.totalReviews);
  const reviewsLoading = useSelector((state: RootState) => state.reviews.loading);
  const reviewsError = useSelector((state: RootState) => state.reviews.error);

  useEffect(() => {
    if (productId) {
      dispatch(fetchProduct(productId));
      dispatch(fetchReviews(productId));
      dispatch(fetchRatingSummary(productId));
    }
    return () => {
      dispatch(clearProduct());
    };
  }, [productId, dispatch]);

  return { product, loading, error, reviews, averageRating, totalReviews, reviewsLoading, reviewsError };
}

function useVariantManager(product: Product | null) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const selectedVariant = useMemo(() => {
    if (!product || !selectedVariantId) return null;
    return product.variants.find((v) => v.id === selectedVariantId) || null;
  }, [product, selectedVariantId]);

  const stockStatus = useMemo(() => {
    if (!selectedVariant?.inventories?.length) {
      return { available: false, totalStock: 0, isLowStock: false };
    }
    const totalStock = selectedVariant.inventories.reduce(
      (sum, inv) => sum + (inv.stock - (inv.reserved ?? 0)), 0
    );
    return {
      available: totalStock > 0,
      totalStock,
      isLowStock: totalStock > 0 && totalStock <= 5,
    };
  }, [selectedVariant]);

  useEffect(() => {
    if (product && product.variants.length && !selectedVariantId) {
      setSelectedVariantId(product.variants[0].id);
    }
  }, [product, selectedVariantId]);

  return { selectedVariantId, setSelectedVariantId, selectedVariant, stockStatus };
}

function useCartActions(selectedVariantId: string | null, stockStatus: { available: boolean; totalStock: number }) {
  const dispatch = useDispatch<AppDispatch>();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
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
    setAdding(true);
    try {
      await dispatch(addToCart({ variantId: selectedVariantId, quantity })).unwrap();
      setAdded(true);
      setToast({ message: "Added to cart!", type: "success" });
      setTimeout(() => setAdded(false), 2000);
    } catch (err: any) {
      setToast({ message: err.message || "Failed to add to cart", type: "error" });
    } finally {
      setAdding(false);
    }
  };

  return { quantity, adding, added, toast, setToast, increaseQty, decreaseQty, handleAddToCart };
}

function useReviewActions(productId: string | undefined) {
  const dispatch = useDispatch<AppDispatch>();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreate = async (data: { title: string; rating: number; comment: string }) => {
    if (!productId) return;
    setSubmitLoading(true);
    setErrorMessage(null);
    try {
      await dispatch(createReview({ productId, ...data })).unwrap();
      dispatch(fetchRatingSummary(productId));
      setShowCreateForm(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create review");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdate = async (reviewId: string, data: { title: string; rating: number; comment: string }) => {
    setSubmitLoading(true);
    setErrorMessage(null);
    try {
      await dispatch(updateReview({ id: reviewId, data })).unwrap();
      if (productId) dispatch(fetchRatingSummary(productId));
      setEditingReviewId(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update review");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!productId) return;
    setSubmitLoading(true);
    setErrorMessage(null);
    try {
      await dispatch(deleteReview(reviewId)).unwrap();
      dispatch(fetchRatingSummary(productId));
      setDeleteConfirmId(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete review");
    } finally {
      setSubmitLoading(false);
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
// 3. HELPER COMPONENTS (modernized)
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
  const imageMedias = medias.filter(m => m.type === "IMAGE");
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
              key={idx}
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
  variants: Variant[];
  selectedId: string | null;
  onChange: (id: string) => void;
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">Select Variant</label>
    <div className="flex flex-wrap gap-3">
      {variants.map((variant) => (
        <button
          key={variant.id}
          onClick={() => onChange(variant.id)}
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
            selectedId === variant.id
              ? "border-green-600 bg-green-50 text-green-700 shadow-sm"
              : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:shadow-sm"
          }`}
        >
          {variant.name}
        </button>
      ))}
    </div>
  </div>
);

// Loading skeleton for product details
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
// 4. MAIN COMPONENT
// ==============================
export default function ProductDetails() {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Data hooks
  const { product, loading, error, reviews, averageRating, totalReviews, reviewsLoading, reviewsError } = useProductData(productId);
  const { selectedVariantId, setSelectedVariantId, selectedVariant, stockStatus } = useVariantManager(product);
  const { quantity, adding, added, toast, setToast, increaseQty, decreaseQty, handleAddToCart } = useCartActions(selectedVariantId, stockStatus);
  const reviewActions = useReviewActions(productId);

  // Local UI
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"specs" | "fitment" | "reviews">("specs");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // Set main image when product loads
  useEffect(() => {
    if (product) {
      const firstImage = product.medias?.find((m) => m.type === "IMAGE")?.url || null;
      setMainImage(firstImage);
    }
  }, [product]);

  // Intersection observer for sticky add-to-cart bar
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-100px 0px 0px 0px" }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleWishlistToggle = async () => {
    setWishlistLoading(true);
    // Simulate API call – replace with actual wishlist mutation
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsWishlisted(!isWishlisted);
    setToast({ message: isWishlisted ? "Removed from wishlist" : "Added to wishlist", type: "success" });
    setWishlistLoading(false);
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

  // Loading skeleton
  if (loading) return <ProductDetailsSkeleton />;

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <AlertCircle size={48} className="text-red-500" />
        <p className="text-gray-600 text-center">{error || "Product not found"}</p>
        <button onClick={() => navigate("/")} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button with breadcrumb feel */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-green-600 mb-6 transition group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition" />
          <span>Back</span>
        </button>

        {/* Product grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Gallery */}
          <div className="animate-fade-in">
            <ProductImageGallery medias={product.medias || []} mainImage={mainImage} setMainImage={setMainImage} />
          </div>

          {/* Right: Info with ref for sticky bar */}
          <div className="space-y-6 animate-slide-up">
            <div ref={observerRef} className="relative -top-20" /> {/* invisible anchor for sticky detection */}

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.brand?.name && (
                <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">{product.brand.name}</span>
              )}
              {product.category?.name && (
                <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">{product.category.name}</span>
              )}
              {oemDisplay && (
                <span className="text-xs text-gray-500 font-mono bg-gray-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Tag size={12} /> OEM: {oemDisplay}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={18} className={star <= Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({totalReviews} {totalReviews === 1 ? "review" : "reviews"})</span>
              <button
                onClick={() => { setActiveTab("reviews"); reviewActions.setShowCreateForm(true); reviewActions.setEditingReviewId(null); }}
                className="ml-auto text-sm text-green-600 hover:text-green-700 font-medium transition"
              >
                Write a review
              </button>
            </div>

            {/* Description */}
            {product.description && <p className="text-gray-600 leading-relaxed">{product.description}</p>}

            {/* Variant selector */}
            {product.variants.length > 1 && (
              <VariantSelector variants={product.variants} selectedId={selectedVariantId} onChange={setSelectedVariantId} />
            )}

            {/* Price & stock */}
            <div className="border-t border-b border-gray-200 py-4 space-y-3">
              <div className="flex items-baseline gap-2">
                {selectedVariant ? (
                  <>
                    <span className="text-3xl font-bold text-green-600">₦{selectedVariant.price.toLocaleString()}</span>
                    {selectedVariant.compareAtPrice && (
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

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4">
              {stockStatus.available && (
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button onClick={decreaseQty} className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50" disabled={quantity <= 1}>
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button onClick={increaseQty} className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition" disabled={quantity >= stockStatus.totalStock}>
                    <Plus size={16} />
                  </button>
                </div>
              )}
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
                className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
              >
                {wishlistLoading ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <Heart size={20} className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"} />}
              </button>
            </div>

            {/* Shipping info */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600"><Truck size={18} className="text-green-600" /><span>Free shipping over ₦50,000</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><RefreshCw size={18} className="text-green-600" /><span>30-day returns</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><ShieldCheck size={18} className="text-green-600" /><span>2-year warranty</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><Tag size={18} className="text-green-600" /><span>Secure payment</span></div>
            </div>
          </div>
        </div>

        {/* Tabs section */}
        <div className="mt-16 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-6">
            <nav className="flex gap-6 overflow-x-auto custom-scrollbar">
              {product.specifications?.length > 0 && (
                <button onClick={() => setActiveTab("specs")} className={`py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === "specs" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-700"
                }`}>Specifications</button>
              )}
              {product.productFitments?.length > 0 && (
                <button onClick={() => setActiveTab("fitment")} className={`py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === "fitment" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-700"
                }`}>Vehicle Fitment</button>
              )}
              <button onClick={() => setActiveTab("reviews")} className={`py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "reviews" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-700"
              }`}>Reviews ({totalReviews})</button>
            </nav>
          </div>

          <div className="p-6">
            {/* Specifications */}
            {activeTab === "specs" && product.specifications?.length > 0 && (
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {product.specifications.map((spec, idx) => (
                  <div key={idx} className="flex py-2 border-b border-gray-100">
                    <dt className="w-1/3 text-sm font-medium text-gray-700">{spec.name}</dt>
                    <dd className="w-2/3 text-sm text-gray-600">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {/* Fitment */}
            {activeTab === "fitment" && product.productFitments?.length > 0 && (
              <div className="space-y-2">
                {product.productFitments.map((fit, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-600 py-2 border-b border-gray-100">
                    <Info size={16} className="text-green-500 mt-0.5" />
                    <span><strong>Trim ID:</strong> {fit.trimId} {fit.notes && <>– {fit.notes}</>}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews */}
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
                    <button onClick={() => reviewActions.setShowCreateForm(true)} className="mt-3 text-green-600 hover:text-green-700 font-medium transition">
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
                                <span>{review.user.name}</span>
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

      {/* Sticky Add-to-Cart Bar (mobile/scroll) */}
      {showStickyBar && stockStatus.available && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 flex items-center justify-between gap-3 animate-slide-up z-40 md:hidden">
          <div>
            <p className="text-sm font-medium text-gray-900">{product.name}</p>
            <p className="text-lg font-bold text-green-600">₦{selectedVariant?.price.toLocaleString()}</p>
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