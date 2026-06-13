import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import {
  ChevronRight,
  X,
  Check,
  ArrowUp,
  Calendar,
} from "lucide-react";
import { useGetProductsQuery } from "../../services/productApi";
import { useMeQuery } from "../../services/authApi";
import {
  useGetMakesQuery,
  useGetModelsQuery,
  useGetGenerationsQuery,
  useGetEnginesQuery,
  useGetTrimsQuery,
} from "../../services/vehicleApi";
import { useGetCategoriesQuery } from "../../services/categoryApi";
import { useGetBrandsQuery } from "../../services/brandApi";

// ---------- Local types (since vehicleApi doesn't export them) ----------
interface VehicleMake {
  id: string;
  name: string;
  slug?: string;
}

interface VehicleModel {
  id: string;
  name: string;
  slug?: string;
}

interface VehicleGeneration {
  id: string;
  name: string;
  yearStart?: number;
  yearEnd?: number;
}

interface VehicleEngine {
  id: string;
  engineCode: string;
}

interface VehicleTrim {
  id: string;
  name: string;
}

/* ---------- Toast Component ---------- */
const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`shadow-lg px-4 py-3 flex items-center gap-2 ${
        type === "success" ? "bg-emerald-800 text-white" : "bg-red-600 text-white"
      }`}>
        {type === "success" ? <Check size={18} /> : <X size={18} />}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

/* ---------- BackToTop ---------- */
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
      className="fixed bottom-6 cursor-pointer right-6 z-40 bg-green-600 hover:bg-green-700 text-white p-3 shadow-lg transition-all duration-300 hover:scale-110"
    >
      <ArrowUp size={20} />
    </button>
  );
};

/* ---------- HeroCarousel ---------- */
const HeroCarousel = ({ products }: { products: any[] }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef(0);

  const slides = useMemo(() => {
    if (products.length === 0) {
      return [
        { id: "1", title: "Premium Auto Parts", subtitle: "Quality you can trust", description: "Shop the best selection of auto parts with warranty", image: "/api/placeholder/1200/400", cta: "Shop Now" },
        { id: "2", title: "New Arrivals", subtitle: "Latest products", description: "Discover our newest auto parts and accessories", image: "/api/placeholder/1200/400", cta: "Explore" },
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
      className="relative overflow-hidden shadow-2xl bg-linear-to-r from-gray-900 to-gray-800 group"
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
                <span className="inline-block px-3 py-1 bg-emerald-800/90 backdrop-blur-sm text-xs font-semibold mb-3">
                  {slide.subtitle}
                </span>
                <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-[2.5rem] font-bold mb-2 leading-tight">
                  {slide.title}
                </h2>
                <p className="text-xs sm:text-[0.95rem] text-gray-200 mb-4 line-clamp-2">
                  {slide.description}
                </p>
                <button
                  onClick={() => {
                    if (products.length > 0 && slide.id && slide.id !== "1" && slide.id !== "2") {
                      navigate(`/product/${slide.id}`);
                    }
                  }}
                  className="bg-emerald-800 hover:bg-emerald-900 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all transform hover:scale-105 shadow-lg whitespace-nowrap"
                >
                  {slide.cta}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={prevSlide} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm p-2 transition-all duration-200 opacity-70 md:opacity-0 md:group-hover:opacity-100 z-10">
        <ChevronRight className="w-5 h-5 rotate-180" />
      </button>
      <button onClick={nextSlide} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm p-2 transition-all duration-200 opacity-70 md:opacity-0 md:group-hover:opacity-100 z-10">
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 transition-all duration-300 ${idx === currentIndex ? "bg-white w-6" : "bg-white/50 w-2 hover:bg-white/80"}`}
          />
        ))}
      </div>
    </div>
  );
};

/* ---------- Skeletons ---------- */
const HeroCarouselSkeleton = () => (
  <div className="relative overflow-hidden shadow-2xl bg-gray-200 animate-pulse">
    <div className="w-full h-64 md:h-80 lg:h-96 bg-linear-to-r from-gray-200 to-gray-300" />
    <div className="absolute inset-0 bg-black/20 flex items-center">
      <div className="p-4 sm:p-6 md:p-10 w-full max-w-3xl space-y-3">
        <div className="w-24 h-6 bg-gray-300" />
        <div className="h-8 sm:h-10 bg-gray-300 w-3/4" />
        <div className="h-4 bg-gray-300 w-full max-w-md" />
        <div className="w-32 h-10 bg-gray-300" />
      </div>
    </div>
  </div>
);

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="bg-white shadow-sm overflow-hidden animate-pulse">
        <div className="aspect-square bg-linear-to-br from-gray-200 to-gray-100" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-gray-200 w-3/4" />
          <div className="h-5 bg-gray-200 w-1/2" />
          <div className="flex justify-between items-center mt-2">
            <div className="h-8 bg-gray-200 w-16" />
            <div className="h-8 w-8 bg-gray-200" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const VehicleFilterSidebarSkeleton = () => (
  <div className="bg-white border border-gray-100/50 animate-pulse">
    <div className="border-b border-gray-100/50 px-5 py-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-300" />
        <div className="h-5 bg-gray-300 w-32" />
      </div>
    </div>
    <div className="p-4 space-y-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i}>
          <div className="h-3 bg-gray-200 w-16 mb-1" />
          <div className="h-10 bg-gray-100 w-full" />
        </div>
      ))}
      <div className="h-10 bg-gray-100 w-full mt-2" />
    </div>
  </div>
);


/* ---------- VehicleFilterSidebar (UI only – no backend search) ---------- */
interface VehicleFilterSidebarProps {
  tempMake: VehicleMake | null;
  tempModel: VehicleModel | null;
  tempGeneration: VehicleGeneration | null;
  tempEngine: VehicleEngine | null;
  tempTrim: VehicleTrim | null;
  tempYear: string;
  onTempMakeChange: (make: VehicleMake | null) => void;
  onTempModelChange: (model: VehicleModel | null) => void;
  onTempGenerationChange: (gen: VehicleGeneration | null) => void;
  onTempEngineChange: (engine: VehicleEngine | null) => void;
  onTempTrimChange: (trim: VehicleTrim | null) => void;
  onTempYearChange: (year: string) => void;
  onSearch: () => void;
  onClearFilters: () => void;
}

const VehicleFilterSidebar = ({
  tempMake,
  tempModel,
  tempGeneration,
  tempEngine,
  tempTrim,
  tempYear,
  onTempMakeChange,
  onTempModelChange,
  onTempGenerationChange,
  onTempEngineChange,
  onTempTrimChange,
  onTempYearChange,
  onSearch,
  onClearFilters,
}: VehicleFilterSidebarProps) => {
  const { data: makes = [], isLoading: makesLoading } = useGetMakesQuery();
  const { data: models = [], isLoading: modelsLoading } = useGetModelsQuery(tempMake?.id || "", { skip: !tempMake });
  const { data: generations = [], isLoading: generationsLoading } = useGetGenerationsQuery(tempModel?.id || "", { skip: !tempModel });
  const { data: engines = [], isLoading: enginesLoading } = useGetEnginesQuery(tempGeneration?.id || "", { skip: !tempGeneration });
  const { data: trims = [], isLoading: trimsLoading } = useGetTrimsQuery(tempEngine?.id || "", { skip: !tempEngine });

  const hasActiveFilters = tempMake || tempModel || tempGeneration || tempEngine || tempTrim || tempYear;

  const handleMakeChange = (makeId: string) => {
    const make = makes.find((m: any) => m.id === makeId) || null;
    onTempMakeChange(make);
    onTempModelChange(null);
    onTempGenerationChange(null);
    onTempEngineChange(null);
    onTempTrimChange(null);
  };

  const handleModelChange = (modelId: string) => {
    const model = models.find((m: any) => m.id === modelId) || null;
    onTempModelChange(model);
    onTempGenerationChange(null);
    onTempEngineChange(null);
    onTempTrimChange(null);
  };

  const handleGenerationChange = (genId: string) => {
    const gen = generations.find((g: any) => g.id === genId) || null;
    onTempGenerationChange(gen);
    onTempEngineChange(null);
    onTempTrimChange(null);
  };

  const handleEngineChange = (engineId: string) => {
    const engine = engines.find((e: any) => e.id === engineId) || null;
    onTempEngineChange(engine);
    onTempTrimChange(null);
  };

  const handleTrimChange = (trimId: string) => {
    const trim = trims.find((t: any) => t.id === trimId) || null;
    onTempTrimChange(trim);
  };

  return (
    <div className="bg-white border border-gray-100/50 h-full">
      <div className="border-b border-gray-100/50 px-5 py-4 bg-gray-50/40">
        <h3 className="text-[1rem] font-semibold tracking-wide text-gray-900 flex items-center gap-2">
          Find car parts for your Vehicle
        </h3>
      </div>
      <div className="p-5 space-y-5">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Make</label>
          <select
            value={tempMake?.id || ""}
            onChange={(e) => handleMakeChange(e.target.value)}
            className="w-full border border-gray-300 bg-white p-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
            disabled={makesLoading}
          >
            <option value="">All Makes</option>
            {makes.map((make: any) => (
              <option key={make.id} value={make.id}>{make.name}</option>
            ))}
          </select>
        </div>

        {tempMake && (
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Model</label>
            <select
              value={tempModel?.id || ""}
              onChange={(e) => handleModelChange(e.target.value)}
              className="w-full border border-gray-300 bg-white p-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
              disabled={modelsLoading}
            >
              <option value="">All Models</option>
              {models.map((model: any) => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
          </div>
        )}

        {tempModel && (
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Generation</label>
            <select
              value={tempGeneration?.id || ""}
              onChange={(e) => handleGenerationChange(e.target.value)}
              className="w-full border border-gray-300 bg-white p-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
              disabled={generationsLoading}
            >
              <option value="">All Generations</option>
              {generations.map((gen: any) => (
                <option key={gen.id} value={gen.id}>
                  {gen.name} ({gen.yearStart}{gen.yearEnd ? `-${gen.yearEnd}` : ""})
                </option>
              ))}
            </select>
          </div>
        )}

        {tempGeneration && (
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Engine</label>
            <select
              value={tempEngine?.id || ""}
              onChange={(e) => handleEngineChange(e.target.value)}
              className="w-full border border-gray-300 bg-white p-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
              disabled={enginesLoading}
            >
              <option value="">All Engines</option>
              {engines.map((eng: any) => (
                <option key={eng.id} value={eng.id}>
                  {eng.engineCode}
                </option>
              ))}
            </select>
          </div>
        )}

        {tempEngine && (
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Trim</label>
            <select
              value={tempTrim?.id || ""}
              onChange={(e) => handleTrimChange(e.target.value)}
              className="w-full border border-gray-300 bg-white p-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
              disabled={trimsLoading}
            >
              <option value="">All Trims</option>
              {trims.map((trim: any) => (
                <option key={trim.id} value={trim.id}>{trim.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">
            <Calendar size={12} /> Year
          </label>
          <input
            type="number"
            placeholder="e.g., 2020"
            value={tempYear}
            onChange={(e) => onTempYearChange(e.target.value)}
            className="w-full border border-gray-300 bg-white p-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onSearch}
            className="flex-1 bg-emerald-800 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 transition-colors flex items-center justify-center gap-2 shadow-sm tracking-wide"
          >
            Search
          </button>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------- SectionHeader ---------- */
const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex justify-center items-center mb-5">
    <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight text-center">
      {title}
    </h2>
  </div>
);

/* ---------- Helper functions for curated sections ---------- */
const getProductPrice = (product: any): number => {
  return product.variants?.[0]?.price ?? 0;
};

const getRandomDiverseProducts = (products: any[], limit: number): any[] => {
  if (!products.length) return [];
  const grouped: Record<string, any[]> = {};
  for (const p of products) {
    const catId = p.categoryId || "uncategorized";
    if (!grouped[catId]) grouped[catId] = [];
    grouped[catId].push(p);
  }
  for (const cat in grouped) {
    for (let i = grouped[cat].length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [grouped[cat][i], grouped[cat][j]] = [grouped[cat][j], grouped[cat][i]];
    }
  }
  const result: any[] = [];
  const categoryList = Object.keys(grouped);
  let takenFromCat: Record<string, number> = {};
  while (result.length < limit && categoryList.length) {
    let added = false;
    for (const cat of categoryList) {
      if (result.length >= limit) break;
      const taken = takenFromCat[cat] || 0;
      if (taken < 2 && grouped[cat].length > taken) {
        result.push(grouped[cat][taken]);
        takenFromCat[cat] = taken + 1;
        added = true;
      }
    }
    if (!added) break;
  }
  if (result.length < limit) {
    const remaining = products.filter(p => !result.includes(p));
    result.push(...remaining.slice(0, limit - result.length));
  }
  return result;
};

const getOnePerCategory = (products: any[], categories: any[], maxCategories = 8): any[] => {
  if (!products.length || !categories.length) return [];
  const groupMap = new Map<string, any[]>();
  for (const p of products) {
    const catId = p.categoryId;
    if (!catId) continue;
    if (!groupMap.has(catId)) groupMap.set(catId, []);
    groupMap.get(catId)!.push(p);
  }
  const shuffledCategories = [...categories].sort(() => Math.random() - 0.5);
  const selectedCategories = shuffledCategories.slice(0, maxCategories);
  const result: any[] = [];
  for (const cat of selectedCategories) {
    const catProducts = groupMap.get(cat.id) || [];
    if (catProducts.length) {
      const randomIndex = Math.floor(Math.random() * catProducts.length);
      result.push(catProducts[randomIndex]);
    }
  }
  return result;
};

const getCheapestPerCategory = (products: any[], maxItems = 8): any[] => {
  if (!products.length) return [];
  const categoryMap = new Map<string, any>();
  for (const p of products) {
    const catId = p.categoryId;
    if (!catId) continue;
    const price = getProductPrice(p);
    const existing = categoryMap.get(catId);
    if (!existing || price < getProductPrice(existing)) {
      categoryMap.set(catId, p);
    }
  }
  const cheapestProducts = Array.from(categoryMap.values());
  cheapestProducts.sort((a, b) => getProductPrice(a) - getProductPrice(b));
  return cheapestProducts.slice(0, maxItems);
};

/* ========== MAIN HOME COMPONENT ========== */
export default function Home() {
  const { isLoading: userLoading } = useMeQuery();
  const [section1Limit, setSection1Limit] = useState(8);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Vehicle filter state (UI only – no backend search yet)
  const [tempMake, setTempMake] = useState<VehicleMake | null>(null);
  const [tempModel, setTempModel] = useState<VehicleModel | null>(null);
  const [tempGeneration, setTempGeneration] = useState<VehicleGeneration | null>(null);
  const [tempEngine, setTempEngine] = useState<VehicleEngine | null>(null);
  const [tempTrim, setTempTrim] = useState<VehicleTrim | null>(null);
  const [tempYear, setTempYear] = useState("");

  const { data: allProducts = [], isLoading: productsLoading, error: productsError } = useGetProductsQuery();
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { data: brands = [], isLoading: brandsLoading } = useGetBrandsQuery();

  const section1Products = useMemo(() => {
    if (productsLoading || !allProducts.length) return [];
    return getRandomDiverseProducts(allProducts, section1Limit);
  }, [allProducts, productsLoading, section1Limit]);

  const section2Products = useMemo(() => {
    if (productsLoading || categoriesLoading || !allProducts.length || !categories.length) return [];
    return getOnePerCategory(allProducts, categories, 8);
  }, [allProducts, categories, productsLoading, categoriesLoading]);

  const section4Products = useMemo(() => {
    if (productsLoading || !allProducts.length) return [];
    return getCheapestPerCategory(allProducts, 8);
  }, [allProducts, productsLoading]);

  const isLoading = (productsLoading || userLoading) && allProducts.length === 0;

  const errorMessage = (() => {
    if (productsError && !productsLoading) {
      if (typeof productsError === "string") return productsError;
      if ("message" in productsError) return productsError.message;
      if ("data" in productsError && productsError.data && typeof productsError.data === "object" && "message" in productsError.data)
        return (productsError.data as any).message;
      return "Please try again later.";
    }
    return null;
  })();

  const handleSearch = () => {
    setToast({ message: "Vehicle‑based product search is coming soon!", type: "error" });
  };

  const clearFitmentFilters = () => {
    setTempMake(null);
    setTempModel(null);
    setTempGeneration(null);
    setTempEngine(null);
    setTempTrim(null);
    setTempYear("");
  };

  if (productsError && !productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white shadow-lg p-6 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 flex items-center justify-center mx-auto mb-4"><X size={32} className="text-red-500" /></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load products</h2>
          <p className="text-gray-500 mb-6">{errorMessage}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-emerald-800 text-white hover:bg-emerald-900 transition">Try Again</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 mb-8">
            <div><VehicleFilterSidebarSkeleton /></div>
            <div><HeroCarouselSkeleton /></div>
          </div>
          <div className="space-y-6">
            <div className="h-10 bg-gray-200 w-48 animate-pulse" />
            <ProductGridSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Top Row: Sidebar + Carousel */}
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 mb-8">
          <div className="w-full">
            <VehicleFilterSidebar
              tempMake={tempMake}
              tempModel={tempModel}
              tempGeneration={tempGeneration}
              tempEngine={tempEngine}
              tempTrim={tempTrim}
              tempYear={tempYear}
              onTempMakeChange={setTempMake}
              onTempModelChange={setTempModel}
              onTempGenerationChange={setTempGeneration}
              onTempEngineChange={setTempEngine}
              onTempTrimChange={setTempTrim}
              onTempYearChange={setTempYear}
              onSearch={handleSearch}
              onClearFilters={clearFitmentFilters}
            />
          </div>
          <div className="w-full">
            <HeroCarousel products={allProducts} />
          </div>
        </div>

        {/* Product sections (no fitment search active) */}
        <div className="w-full space-y-10">
          <section>
            <SectionHeader title="MOgrace Auto Store: Buy car parts online" />
            {productsLoading ? (
              <ProductGridSkeleton />
            ) : section1Products.length === 0 ? (
              <div className="bg-white shadow-sm p-8 text-center text-gray-500">No products available.</div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {section1Products.map((product: any) => (
                    <div key={product.id} className="transform transition-all duration-300 hover:-translate-y-1">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-4 mt-6">
                  {section1Limit < allProducts.length && (
                    <button
                      onClick={() => setSection1Limit(prev => prev + 8)}
                      className="px-5 py-2 bg-emerald-800 text-white hover:bg-emerald-900 transition"
                    >
                      Show More
                    </button>
                  )}
                  {section1Limit > 8 && (
                    <button
                      onClick={() => setSection1Limit(8)}
                      className="px-5 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                    >
                      Show Less
                    </button>
                  )}
                </div>
              </>
            )}
          </section>

          <section>
            <SectionHeader title="All Your Car Essentials in One Place" />
            {productsLoading || categoriesLoading ? (
              <ProductGridSkeleton />
            ) : section2Products.length === 0 ? (
              <div className="bg-white shadow-sm p-8 text-center text-gray-500">No products found.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {section2Products.map((product: any) => (
                  <div key={product.id} className="transform transition-all duration-300 hover:-translate-y-1">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex justify-center items-center mb-5">
              <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-gray-800 text-center">
                Find Affordable Auto Parts for Leading Car Brands
              </h2>
            </div>
            {brandsLoading ? (
              <div className="flex flex-wrap gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-10 w-24 bg-gray-200 animate-pulse" />
                ))}
              </div>
            ) : brands.length === 0 ? (
              <div className="bg-white shadow-sm p-8 text-center text-gray-500">No brands available.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => window.location.href = `/brand/${brand.id}`}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-800 text-sm font-bold uppercase tracking-wide hover:border-emerald-500 hover:text-emerald-800 transition shadow-sm w-full text-center"
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            )}
          </section>

          <section>
            <SectionHeader title="MOgrace Auto Bestsellers: Buy genuine car parts online at unbeatable prices"/>
            {productsLoading ? (
              <ProductGridSkeleton />
            ) : section4Products.length === 0 ? (
              <div className="bg-white shadow-sm p-8 text-center text-gray-500">No products found.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {section4Products.map((product: any) => (
                  <div key={product.id} className="transform transition-all duration-300 hover:-translate-y-1">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
      <BackToTop />
    </div>
  );
}