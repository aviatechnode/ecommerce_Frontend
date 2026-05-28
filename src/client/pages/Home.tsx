import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import ProductCard from "../components/ProductCard";
import {
  Search,
  ChevronRight,
  Percent,
  Filter,
  X,
  ChevronDown,
  Star,
  TrendingUp,
  Clock,
  Copy,
  Check,
  ArrowUp,
  Shield,
  Factory,
  Award,
  ThumbsUp,
  Truck,
  Layers,
} from "lucide-react";
import { useListCouponsQuery } from "../../services/couponApi";
import type { Coupon } from "../../types/coupon-types";
import { useGetProductsQuery } from "../../services/productApi";
import { useGetCategoriesQuery } from "../../services/categoryApi";
import { transformCategoriesToNavbar } from "../helpers/category-helper";
import type { Category } from "../../services/categoryApi";
import { useMeQuery } from "../../services/authApi";

/* =========================================================
TOAST NOTIFICATION
========================================================= */
const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`rounded-lg shadow-lg px-4 py-3 flex items-center gap-2 ${
        type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
      }`}>
        {type === "success" ? <Check size={18} /> : <X size={18} />}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

/* =========================================================
BACK TO TOP BUTTON
========================================================= */
const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
    >
      <ArrowUp size={20} />
    </button>
  );
};

/* =========================================================
HERO CAROUSEL – SLIGHTLY REDUCED TITLE FONT
========================================================= */
const HeroCarousel = ({ products }: { products: any[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef(0);

  const slides = useMemo(() => {
    if (products.length === 0) {
      return [
        { id: "1", title: "Premium Auto Parts", subtitle: "Quality you can trust", description: "Shop the best selection of auto parts with warranty", image: "/api/placeholder/1200/400", cta: "Shop Now" },
        { id: "2", title: "Limited Time Deals", subtitle: "Use your coupons", description: "Check your active coupons for exclusive savings", image: "/api/placeholder/1200/400", cta: "View Coupons" },
      ];
    }
    return products.slice(0, 5).map((p) => ({
      id: p.id,
      title: p.name,
      subtitle: p.categoryName || "Premium Quality",
      description: p.description?.slice(0, 100) || "Shop now for the best deals",
      image: p.medias?.[0]?.url || "/api/placeholder/600/400",
      cta: "View Details",
    }));
  }, [products]);

  const nextSlide = useCallback(() => setCurrentIndex((prev) => (prev + 1) % slides.length), [slides.length]);
  const prevSlide = useCallback(() => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
  };

  if (slides.length === 0) return null;

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-2xl bg-linear-to-r from-gray-900 to-gray-800 group"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {slides.map((slide) => (
          <div key={slide.id} className="min-w-full relative">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-64 md:h-80 lg:h-96 object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-transparent flex items-center">
              <div className="text-white p-4 sm:p-6 md:p-10 w-full max-w-3xl overflow-visible wrap-break-word">
                <span className="inline-block px-3 py-1 bg-green-600/90 backdrop-blur-sm rounded-full text-xs font-semibold mb-3">
                  {slide.subtitle}
                </span>
                {/* Slightly reduced title font sizes */}
                <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-[2.5rem] font-bold mb-2 leading-tight">
                  {slide.title}
                </h2>
                <p className="text-xs sm:text-[0.95rem] text-gray-200 mb-4 line-clamp-2">
                  {slide.description}
                </p>
                <button className="bg-green-600 hover:bg-green-700 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all transform hover:scale-105 shadow-lg whitespace-nowrap">
                  {slide.cta} →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={prevSlide} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full p-2 transition-all duration-200 opacity-70 md:opacity-0 md:group-hover:opacity-100 z-10">
        <ChevronRight className="w-5 h-5 rotate-180" />
      </button>
      <button onClick={nextSlide} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full p-2 transition-all duration-200 opacity-70 md:opacity-0 md:group-hover:opacity-100 z-10">
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-white w-6" : "bg-white/50 w-2 hover:bg-white/80"}`}
          />
        ))}
      </div>
    </div>
  );
};

/* =========================================================
PRODUCT GRID SKELETON
========================================================= */
const ProductGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
        <div className="aspect-square bg-linear-to-br from-gray-200 to-gray-100" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-5 bg-gray-200 rounded w-1/2" />
          <div className="flex justify-between items-center mt-2">
            <div className="h-8 bg-gray-200 rounded w-16" />
            <div className="h-8 w-8 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* =========================================================
COLLAPSIBLE CATEGORY GROUP
========================================================= */
const CollapsibleCategoryGroup = ({
  group,
  selectedCategory,
  onSelectCategory,
  categories,
  productCounts,
}: {
  group: {
    title: string;
    icon: React.ReactNode;
    items: string[];
  };

  selectedCategory: string | null;

  onSelectCategory: (id: string | null) => void;

  categories: Category[];

  productCounts: Record<string, number>;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const groupTotalCount = useMemo(() => {
    return group.items.reduce((total, itemName) => {
      const category = categories.find(
        (cat) => cat.name === itemName && cat.isActive
      );

      if (!category) return total;

      return total + (productCounts[category.id] || 0);
    }, 0);
  }, [group.items, categories, productCounts]);

  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-gray-100 bg-white/80 shadow-xs backdrop-blur-sm transition-all duration-300 hover:border-green-100 hover:shadow-md">
      {/* HEADER */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 transition-all duration-200 hover:bg-gray-50/80"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-green-50 to-emerald-100 text-green-700 shadow-xs">
            {group.icon}
          </div>

          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800">
              {group.title}
            </p>

            <p className="text-xs text-gray-500">
              {groupTotalCount} product
              {groupTotalCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div
          className={`rounded-lg p-1 transition-all duration-300 ${
            isOpen
              ? "rotate-180 bg-green-50 text-green-600"
              : "text-gray-400"
          }`}
        >
          <ChevronDown size={16} />
        </div>
      </button>

      {/* CONTENT */}
      <div
        className={`grid transition-all duration-300 ${
          isOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-1 border-t border-gray-100 px-3 py-3">
            {group.items.map((itemName) => {
              const category = categories.find(
                (cat) =>
                  cat.name === itemName && cat.isActive
              );

              const count = category
                ? productCounts[category.id] || 0
                : 0;

              const isActive =
                selectedCategory === category?.id;

              return (
                <button
                  key={itemName}
                  onClick={() =>
                    category && onSelectCategory(category.id)
                  }
                  disabled={!category}
                  className={`
                    group/sub flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all duration-200
                    ${
                      isActive
                        ? "bg-linear-to-r from-green-50 to-emerald-50 text-green-700 shadow-inner ring-1 ring-green-100"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                    ${
                      !category
                        ? "cursor-not-allowed opacity-40"
                        : ""
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`
                        h-2 w-2 rounded-full transition-all duration-200
                        ${
                          isActive
                            ? "scale-110 bg-green-500 shadow-sm"
                            : "bg-gray-300 group-hover/sub:bg-gray-400"
                        }
                      `}
                    />

                    <span
                      className={`text-sm ${
                        isActive
                          ? "font-semibold"
                          : "font-medium"
                      }`}
                    >
                      {itemName}
                    </span>
                  </div>

                  {count > 0 && (
                    <span
                      className={`
                        rounded-full px-2 py-0.5 text-xs font-semibold transition-all
                        ${
                          isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }
                      `}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
TRUST SECTION
========================================================= */
const TrustSection = () => {
  const trustPoints = [
    {
      icon: Factory,
      title: "Factory-Direct Pricing",
      description:
        "We source directly from trusted manufacturers to ensure competitive pricing, consistent quality, and complete product authenticity.",
    },

    {
      icon: Shield,
      title: "Verified Genuine Parts",
      description:
        "Every product is carefully verified to meet OEM and industry quality standards for safety, durability, and performance.",
    },

    {
      icon: Award,
      title: "Warranty Protection",
      description:
        "Enjoy added confidence with warranty coverage on eligible products and dedicated after-sales support when you need it.",
    },

    {
      icon: ThumbsUp,
      title: "Trusted by Mechanics & Drivers",
      description:
        "Thousands of workshops, fleet operators, and everyday drivers rely on our parts for dependable vehicle maintenance.",
    },

    {
      icon: Truck,
      title: "Reliable Nationwide Delivery",
      description:
        "Fast order processing, secure packaging, and real-time delivery updates help your parts arrive safely and on time.",
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-100/60 bg-white/90 p-5 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-linear-to-br from-green-500 to-emerald-600 p-2 shadow-sm">
          <Shield size={18} className="text-white" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Why Customers Trust Us
          </h3>

          <p className="text-sm text-gray-500">
            Quality parts, reliable service, and support you can depend on.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {trustPoints.map((point, idx) => (
          <div
            key={idx}
            className="group/trust flex items-start gap-3 rounded-xl border border-transparent p-2 transition-all hover:border-green-100 hover:bg-green-50/40"
          >
            <div className="rounded-xl bg-linear-to-br from-green-50 to-emerald-50 p-2 shadow-sm transition-all group-hover/trust:scale-105 group-hover/trust:shadow">
              <point.icon size={17} className="text-green-700" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">
                {point.title}
              </p>

              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                {point.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
/* =========================================================
SIDEBAR – refined / premium ecommerce look
========================================================= */
const Sidebar = ({
  categories,
  selectedCategory,
  onSelectCategory,
  coupons,
  couponsLoading,
  products,
  userId,
}: {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  coupons: Coupon[];
  couponsLoading: boolean;
  products: any[];
  userId: string | null;
}) => {
  const navbarCategories = useMemo(
    () => transformCategoriesToNavbar(categories),
    [categories]
  );

  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    products.forEach((p) => {
      if (p.categoryId) {
        counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
      }
    });

    return counts;
  }, [products]);

  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const handleCopyCoupon = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCoupon(code);

      setTimeout(() => {
        setCopiedCoupon(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.type === "PERCENTAGE") {
      return `${coupon.percentOff}% OFF`;
    }

    if (coupon.type === "FIXED_AMOUNT") {
      return `$${coupon.amountOff} OFF`;
    }

    return "Special Offer";
  };

  // Only coupons available to this user
  const userCoupons = useMemo(() => {
    if (!userId) return [];

    return coupons.filter((coupon) => {
      if (!coupon.customerIds || coupon.customerIds.length === 0) {
        return true;
      }

      return coupon.customerIds.includes(userId);
    });
  }, [coupons, userId]);

  const totalProducts = products.length;

  return (
    <aside className="sticky top-24 space-y-6">
      {/* =========================================================
      CATEGORIES
      ========================================================= */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* Header */}
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="text-sm font-semibold tracking-wide text-gray-900 uppercase">
            Categories
          </h3>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto px-3 py-3">
          <div className="space-y-1">
            {/* ALL PRODUCTS */}
            <button
              onClick={() => onSelectCategory(null)}
              className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors duration-200
              ${
                selectedCategory === null
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers
                  size={16}
                  className={
                    selectedCategory === null
                      ? "text-white"
                      : "text-gray-400"
                  }
                />

                <span className="font-medium">All Products</span>
              </div>

              <span
                className={`rounded-md px-2 py-0.5 text-xs font-medium
                ${
                  selectedCategory === null
                    ? "bg-white/10 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {totalProducts}
              </span>
            </button>

            {/* CATEGORY GROUPS */}
            {navbarCategories.map((group) => (
              <CollapsibleCategoryGroup
                key={group.title}
                group={group}
                selectedCategory={selectedCategory}
                onSelectCategory={onSelectCategory}
                categories={categories}
                productCounts={productCounts}
              />
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================
      COUPONS
      ========================================================= */}
      {!!userCoupons.length && (
        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="text-sm font-semibold tracking-wide text-gray-900 uppercase">
              Available Offers
            </h3>
          </div>

          <div className="space-y-3 p-4">
            {userCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className="rounded-xl border border-gray-200 p-4 transition-colors hover:border-gray-300"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDiscount(coupon)}
                    </p>

                    {coupon.description && (
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">
                        {coupon.description}
                      </p>
                    )}
                  </div>

                  <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                    {coupon.code}
                  </span>
                </div>

                <button
                  onClick={() => handleCopyCoupon(coupon.code)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm font-medium transition-colors
                  ${
                    copiedCoupon === coupon.code
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {copiedCoupon === coupon.code
                    ? "Copied"
                    : "Copy Coupon"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <TrustSection />

      {/* Coupons section – only rendered when user has applicable coupons */}
      {!couponsLoading && userId && userCoupons.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100/80 p-5 transition-all hover:shadow-xl">
          <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <div className="p-1.5 bg-linear-to-br from-amber-500 to-orange-600 rounded-xl shadow-sm"><Percent size={16} className="text-white" /></div>
            Active Coupons
          </h3>
          <div className="space-y-3">
            {userCoupons.map((coupon) => (
              <div key={coupon.id} className="group relative bg-linear-to-br from-white via-green-50/30 to-white border border-green-200/60 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="absolute top-3 right-3">
                  <button onClick={() => handleCopyCoupon(coupon.code)} className="text-green-600 hover:text-green-700 transition-all p-1.5 hover:bg-green-100 rounded-full">
                    {copiedCoupon === coupon.code ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="pr-6">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono font-bold text-green-700 text-sm bg-green-100/80 px-2.5 py-1 rounded-lg border border-green-200/50">{coupon.code}</span>
                    <span className="text-xs font-bold text-green-600 bg-green-100/50 px-2 py-0.5 rounded-full">{formatDiscount(coupon)}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{coupon.name}</p>
                  {coupon.description && <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{coupon.description}</p>}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                    {coupon.minimumOrderAmount && <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full">💰 Min. ${coupon.minimumOrderAmount}</span>}
                    {coupon.expiresAt && <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full"><Clock size={10} /> Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

/* =========================================================
SECTION HEADER (modern)
========================================================= */
const SectionHeader = ({ title, icon, color = "green" }: { title: string; icon?: React.ReactNode; color?: string }) => (
  <div className="flex items-center gap-3 mb-5">
    {icon && <div className={`text-${color}-600 bg-${color}-50 p-2 rounded-xl shadow-sm`}>{icon}</div>}
    <div className={`w-1 h-7 bg-${color}-600 rounded-full`} />
    <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
  </div>
);

/* =========================================================
MAIN HOME COMPONENT
========================================================= */
export default function Home() {
  const { data: user, isLoading: userLoading } = useMeQuery();
  const userId = user?.id || null;

  const { data: products = [], isLoading: productsLoading, error: productsError } = useGetProductsQuery();
  const { data: categoriesList = [], isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { data: couponsData, isLoading: couponsLoading } = useListCouponsQuery({ page: 1, limit: 10, status: "ACTIVE" });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const activeCoupons = useMemo(() => couponsData?.coupons || [], [couponsData]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (debouncedSearch) filtered = filtered.filter((p) => p.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
    if (selectedCategory) filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    return filtered;
  }, [products, debouncedSearch, selectedCategory]);

  const relatedProducts = useMemo(() => {
    if (products.length === 0 || filteredProducts.length === 0) return [];
    let targetCategoryId = selectedCategory;
    if (!targetCategoryId && filteredProducts[0]) targetCategoryId = filteredProducts[0].categoryId;
    if (!targetCategoryId) {
      const categoryCount = new Map<string, number>();
      products.forEach((p) => { if (p.categoryId) categoryCount.set(p.categoryId, (categoryCount.get(p.categoryId) || 0) + 1); });
      if (categoryCount.size > 0) targetCategoryId = Array.from(categoryCount.entries()).sort((a, b) => b[1] - a[1])[0][0];
    }
    if (!targetCategoryId) return [];
    return products.filter((p) => p.categoryId === targetCategoryId && !filteredProducts.some((fp) => fp.id === p.id)).slice(0, 6);
  }, [products, selectedCategory, filteredProducts]);

  const trendingProducts = useMemo(() => {
    if (products.length === 0) return [];
    return [...products].sort((a, b) => {
      const stockA = a.variants?.[0]?.inventories?.[0]?.stock || 0;
      const stockB = b.variants?.[0]?.inventories?.[0]?.stock || 0;
      return stockB - stockA;
    }).slice(0, 6);
  }, [products]);

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedCategory(null);
  };

  const isLoading = (productsLoading || categoriesLoading || userLoading) && products.length === 0;

  const errorMessage = (() => {
    if (!productsError) return null;
    if (typeof productsError === "string") return productsError;
    if ("message" in productsError) return productsError.message;
    if ("data" in productsError && productsError.data && typeof productsError.data === "object" && "message" in productsError.data)
      return (productsError.data as any).message;
    return "Please try again later.";
  })();

  if (productsError && !productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><X size={32} className="text-red-500" /></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load products</h2>
          <p className="text-gray-500 mb-6">{errorMessage}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Try Again</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-64 md:h-80 bg-gray-200 rounded-2xl animate-pulse mb-8" />
          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            <div className="space-y-6"><div className="h-64 bg-white rounded-xl animate-pulse" /><div className="h-48 bg-white rounded-xl animate-pulse" /></div>
            <div className="space-y-6"><div className="h-10 bg-gray-200 rounded-lg w-48 animate-pulse" /><ProductGridSkeleton /></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="lg:hidden mb-5">
          <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-3 text-gray-700 font-medium shadow-sm active:scale-95 transition-transform">
            <Filter size={18} /> {showMobileFilters ? "Hide Filters & Coupons" : "Show Filters & Coupons"}
          </button>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className={`${showMobileFilters ? "block" : "hidden"} lg:block lg:w-80 shrink-0 transition-all duration-300`}>
            <Sidebar
              categories={categoriesList}
              selectedCategory={selectedCategory}
              onSelectCategory={(id) => { setSelectedCategory(id); setShowMobileFilters(false); }}
              coupons={activeCoupons}
              couponsLoading={couponsLoading}
              products={products}
              userId={userId}
            />
          </div>
          <div className="flex-1 space-y-10">
            <HeroCarousel products={products} />
            
            {/* Search & Filter Bar Section */}
            <section>
              <SectionHeader title="Search & Filter" icon={<Search size={20} />} color="green" />
              <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center justify-between sticky top-4 z-30 backdrop-blur-sm">
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition" />
                  {searchTerm && <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16} /></button>}
                </div>
                {(selectedCategory || debouncedSearch) && <button onClick={clearFilters} className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1 whitespace-nowrap px-3 py-1.5 rounded-lg hover:bg-green-50 transition"><X size={14} /> Clear filters</button>}
              </div>
            </section>

            {/* Featured Products Section */}
            <section>
              <SectionHeader 
                title={debouncedSearch || selectedCategory ? `Search Results (${filteredProducts.length})` : "Featured Products"} 
                icon={<Star size={20} />} 
                color="green" 
              />
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Search size={32} className="text-gray-400" /></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
                  <p className="text-gray-500">Try adjusting your search or browse our categories.</p>
                  <button onClick={clearFilters} className="mt-4 text-green-600 hover:text-green-700 font-medium">Clear all filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="transform transition-all duration-300 hover:-translate-y-1"><ProductCard product={product} /></div>
                  ))}
                </div>
              )}
            </section>

            {/* Trending Now Section */}
            {trendingProducts.length > 0 && filteredProducts.length > 0 && (
              <section>
                <SectionHeader title="Trending Now" icon={<TrendingUp size={20} />} color="amber" />
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {trendingProducts.slice(0, 4).map((product) => (
                    <div key={product.id} className="transform transition-all duration-300 hover:-translate-y-1"><ProductCard product={product} /></div>
                  ))}
                </div>
              </section>
            )}

            {/* You May Also Like Section */}
            {relatedProducts.length > 0 && (
              <section>
                <SectionHeader title="You May Also Like" icon={<Star size={20} />} color="blue" />
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {relatedProducts.slice(0, 4).map((product) => (
                    <div key={product.id} className="transform transition-all duration-300 hover:-translate-y-1"><ProductCard product={product} /></div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
      <BackToTop />
    </div>
  );
}