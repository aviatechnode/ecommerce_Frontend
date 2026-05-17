import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../admin/state-management/productSlice";
import { fetchCategories } from "../admin/state-management/categorySlice";
import type { RootState, AppDispatch } from "../admin/store/store";
import ProductCard from "../client/components/ProductCard";
import { Search, ChevronRight, Tag, Percent, Truck, Sparkles, Filter, X } from "lucide-react";
import { useListCouponsQuery } from "../services/couponApi";

/* =========================================================
TYPES
========================================================= */
interface Category {
  id: string;
  name: string;
  parentId?: string | null;
}

interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  amountOff?: number;
  percentOff?: number;
  freeShipping?: boolean;
  minimumOrderAmount?: number;
}

/* =========================================================
CAROUSEL COMPONENT
========================================================= */
const HeroCarousel = ({ products }: { products: any[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Use first 5 products for carousel slides, or fallback images
  const slides = useMemo(() => {
    if (products.length === 0) {
      return [
        { id: "1", title: "Premium Auto Parts", subtitle: "Quality you can trust", image: "/api/placeholder/1200/400" },
        { id: "2", title: "Special Offers", subtitle: "Up to 30% off", image: "/api/placeholder/1200/400" },
        { id: "3", title: "Free Shipping", subtitle: "On orders over $50", image: "/api/placeholder/1200/400" },
      ];
    }
    return products.slice(0, 5).map((p) => ({
      id: p.id,
      title: p.name,
      subtitle: p.brand?.name || "Premium Quality",
      image: p.medias?.[0]?.url || "/api/placeholder/600/400",
    }));
  }, [products]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  if (slides.length === 0) return null;

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-xl bg-gray-900"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="min-w-full relative">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-64 md:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
              <div className="text-white p-6 md:p-10 max-w-lg">
                <h2 className="text-2xl md:text-4xl font-bold mb-2">{slide.title}</h2>
                <p className="text-sm md:text-base text-gray-200 mb-4">{slide.subtitle}</p>
                <button className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-full text-sm font-semibold transition">
                  Shop Now →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full p-2 transition"
      >
        <ChevronRight className="w-5 h-5 rotate-180" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full p-2 transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition ${
              idx === currentIndex ? "bg-white w-4" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/* =========================================================
LOADING SKELETON
========================================================= */
const ProductGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="aspect-square bg-gray-200 animate-pulse" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse" />
          <div className="flex justify-between items-center mt-2">
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* =========================================================
SIDEBAR COMPONENT
========================================================= */
const Sidebar = ({
  categories,
  selectedCategory,
  onSelectCategory,
  coupons,
  couponsLoading,
}: {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  coupons: Coupon[];
  couponsLoading: boolean;
}) => {
  const specialOffers = [
    { id: "1", title: "Free Shipping", description: "On orders over $50", icon: Truck, color: "bg-blue-100 text-blue-700" },
    { id: "2", title: "10% Off First Order", description: "Use code: WELCOME10", icon: Percent, color: "bg-purple-100 text-purple-700" },
    { id: "3", title: "Buy 2 Get 1 Free", description: "Selected items only", icon: Sparkles, color: "bg-amber-100 text-amber-700" },
  ];

  return (
    <aside className="space-y-6">
      {/* Categories Section */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
          <Tag size={18} className="text-green-600" />
          Categories
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => onSelectCategory(null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
              selectedCategory === null
                ? "bg-green-50 text-green-700 font-medium border-l-4 border-green-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                selectedCategory === cat.id
                  ? "bg-green-50 text-green-700 font-medium border-l-4 border-green-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Special Offers Section */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
          <Sparkles size={18} className="text-amber-500" />
          Special Offers
        </h3>
        <div className="space-y-3">
          {specialOffers.map((offer) => (
            <div key={offer.id} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50">
              <div className={`p-2 rounded-full ${offer.color}`}>
                <offer.icon size={16} />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800">{offer.title}</p>
                <p className="text-xs text-gray-500">{offer.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coupons Section */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
          <Percent size={18} className="text-green-600" />
          Active Coupons
        </h3>
        {couponsLoading ? (
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        ) : coupons.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No active coupons at the moment</p>
        ) : (
          <div className="space-y-3">
            {coupons.slice(0, 3).map((coupon) => (
              <div key={coupon.id} className="border border-dashed border-green-200 rounded-lg p-3 bg-green-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono font-bold text-green-700 text-sm">{coupon.code}</p>
                    <p className="text-xs text-gray-600 mt-1">{coupon.name}</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(coupon.code)}
                    className="text-xs bg-white px-2 py-1 rounded border border-green-200 text-green-600 hover:bg-green-100"
                  >
                    Copy
                  </button>
                </div>
                {coupon.description && (
                  <p className="text-xs text-gray-500 mt-2">{coupon.description}</p>
                )}
                {coupon.minimumOrderAmount && (
                  <p className="text-xs text-gray-400 mt-1">Min. order: ${coupon.minimumOrderAmount}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

/* =========================================================
MAIN HOME COMPONENT
========================================================= */
export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error } = useSelector((state: RootState) => state.adminProducts);
  const { categories: categoryList } = useSelector((state: RootState) => state.categories);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch coupons
  const { data: couponsData, isLoading: couponsLoading } = useListCouponsQuery({
    page: 1,
    limit: 5,
    status: "ACTIVE",
  });

  const activeCoupons = useMemo(() => {
    return couponsData?.coupons || [];
  }, [couponsData]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (debouncedSearch) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category?.id === selectedCategory);
    }
    return filtered;
  }, [products, debouncedSearch, selectedCategory]);

  // Related products: products from the same category as the first product (if any) OR most popular category
  const relatedProducts = useMemo(() => {
    if (products.length === 0) return [];
    let targetCategoryId = selectedCategory;
    if (!targetCategoryId) {
      // Find the category with most products
      const categoryCount = new Map<string, number>();
      products.forEach((p) => {
        if (p.category?.id) {
          categoryCount.set(p.category.id, (categoryCount.get(p.category.id) || 0) + 1);
        }
      });
      if (categoryCount.size > 0) {
        targetCategoryId = Array.from(categoryCount.entries()).sort((a, b) => b[1] - a[1])[0][0];
      }
    }
    if (!targetCategoryId) return [];
    return products.filter((p) => p.category?.id === targetCategoryId && p.id !== filteredProducts[0]?.id).slice(0, 6);
  }, [products, selectedCategory, filteredProducts]);

  // Recommended products: based on stock or random selection
  const recommendedProducts = useMemo(() => {
    if (products.length === 0) return [];
    // Simulate recommendation: products with higher stock first, then shuffle remainder
    const withStock = products.filter((p) => p.variants?.[0]?.inventories?.[0]?.stock > 5);
    const withoutStock = products.filter((p) => !withStock.includes(p));
    const sorted = [...withStock, ...withoutStock];
    return sorted.slice(0, 6);
  }, [products]);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedCategory(null);
  };

  // Loading & Error States
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-64 bg-gray-200 rounded-2xl animate-pulse mb-8" />
          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            <div className="space-y-6">
              <div className="h-64 bg-white rounded-xl animate-pulse" />
              <div className="h-48 bg-white rounded-xl animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-10 bg-gray-200 rounded-lg w-48 animate-pulse" />
              <ProductGridSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load products</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => dispatch(fetchProducts())}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-2.5 text-gray-700 font-medium"
          >
            <Filter size={18} />
            {showMobileFilters ? "Hide Filters & Offers" : "Show Filters & Offers"}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - hidden on mobile unless toggled */}
          <div className={`${showMobileFilters ? "block" : "hidden"} lg:block lg:w-80 flex-shrink-0`}>
            <Sidebar
              categories={categoryList}
              selectedCategory={selectedCategory}
              onSelectCategory={(id) => {
                setSelectedCategory(id);
                setShowMobileFilters(false);
              }}
              coupons={activeCoupons}
              couponsLoading={couponsLoading}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Hero Carousel */}
            <HeroCarousel products={products} />

            {/* Search & Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {(selectedCategory || debouncedSearch) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1 whitespace-nowrap"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Main Product Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {debouncedSearch || selectedCategory
                    ? `Found ${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""}`
                    : "Featured Products"}
                </h2>
                <p className="text-sm text-gray-500">{filteredProducts.length} items</p>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
                  <p className="text-gray-500">Try adjusting your search or browse our categories.</p>
                  <button onClick={clearFilters} className="mt-4 text-green-600 hover:text-green-700 font-medium">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-green-600 rounded-full" />
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">You May Also Like</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {relatedProducts.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* Recommended Products Section */}
            {recommendedProducts.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={20} className="text-amber-500" />
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Recommended For You</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {recommendedProducts.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>Need help finding the right part? Contact our experts</p>
          <p className="mt-2">© 2025 MOgrace Auto Parts. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}