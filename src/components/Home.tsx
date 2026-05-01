import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../admin/state-management/productSlice";
import type { RootState, AppDispatch } from "../admin/store/store";
import ProductCard from "../client/components/ProductCard";
import { Search, SlidersHorizontal, X } from "lucide-react";

/* =========================================================
TYPES
========================================================= */
interface Category {
  id: string;
  name: string;
}

/* =========================================================
LOADING SKELETON (Product Grid)
========================================================= */
const ProductGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
CATEGORY PILLS
========================================================= */
const CategoryFilter = ({
  categories,
  selectedCategory,
  onSelect,
}: {
  categories: Category[];
  selectedCategory: string | null;
  onSelect: (categoryId: string | null) => void;
}) => {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          selectedCategory === null
            ? "bg-green-600 text-white shadow-md"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCategory === cat.id
              ? "bg-green-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};

/* =========================================================
MAIN HOME COMPONENT
========================================================= */
export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error } = useSelector(
    (state: RootState) => state.adminProducts
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique categories from products
  const categories = useMemo(() => {
    const catMap = new Map<string, string>();
    products.forEach((product) => {
      if (product.category?.id && product.category?.name) {
        catMap.set(product.category.id, product.category.name);
      }
    });
    return Array.from(catMap.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter products by search and category
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

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleClearSearch = () => {
    setSearchTerm("");
    setDebouncedSearch("");
  };

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero skeleton */}
        <div className="bg-green-700 py-16 md:py-20 text-center px-4">
          <div className="max-w-4xl mx-auto">
            <div className="h-10 md:h-14 bg-green-500 rounded-lg w-3/4 mx-auto animate-pulse mb-4" />
            <div className="h-5 md:h-6 bg-green-500 rounded-lg w-1/2 mx-auto animate-pulse mb-8" />
            <div className="max-w-2xl mx-auto">
              <div className="w-full h-12 bg-white/20 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="h-7 bg-gray-200 rounded w-40 mb-6 animate-pulse" />
          <ProductGridSkeleton />
        </div>
      </div>
    );
  }

  // Error state
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-green-700 to-green-600 text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in">
            Find the Right Auto Parts
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Quality parts for every vehicle – from daily drivers to performance machines
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for parts, brands, or vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-3 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-lg"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Filter Toggle (mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden mt-3 w-full flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white py-2 rounded-full"
            >
              <SlidersHorizontal size={16} />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-4 py-10 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {debouncedSearch || selectedCategory
              ? `Found ${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""}`
              : "Latest Products"}
          </h2>
          {filteredProducts.length > 0 && (
            <p className="text-sm text-gray-500">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          )}
        </div>

        {/* Category Filters */}
        <div className={`${showFilters ? "block" : "hidden md:block"} transition-all duration-300`}>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
            <p className="text-gray-500">
              Try adjusting your search or browse our categories.
            </p>
            {(debouncedSearch || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setDebouncedSearch("");
                  setSelectedCategory(null);
                }}
                className="mt-4 text-green-600 hover:text-green-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
            {filteredProducts.map((product, idx) => (
              <div
                key={product.id}
                className="animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer CTA */}
      <div className="bg-white border-t border-gray-100 mt-12 py-8 text-center text-sm text-gray-500">
        <p>Need help finding the right part? Contact our experts</p>
      </div>
    </div>
  );
}