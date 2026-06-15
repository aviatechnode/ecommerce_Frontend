import { useEffect, useState, useMemo,} from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { ArrowUp, X, Check, ChevronLeft, Calendar } from "lucide-react";
import { useGetProductsQuery } from "../../services/productApi";
import { useGetFitmentsQuery } from "../../services/fitmentApi";
import {
  useGetMakesQuery,
  useGetModelsQuery,
  useGetGenerationsQuery,
  useGetEnginesQuery,
  useGetTrimsQuery,
} from "../../services/vehicleApi";
import type {
  VehicleMake,
  VehicleModel,
  VehicleGeneration,
  VehicleEngine,
  VehicleTrim,
} from "../../types/vehicle-types";
import type { ProductFitment } from "../../types/fitment.types";

// ---------- Toast Component ----------
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

// ---------- BackToTop ----------
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

// ---------- Skeletons ----------
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

// ---------- Helper: match fitment against selected criteria ----------
const matchesFitment = (
  criteria: {
    makeId?: string | null;
    modelId?: string | null;
    generationId?: string | null;
    engineId?: string | null;
    trimId?: string | null;
    year?: number | null;
  },
  fitment: ProductFitment
): boolean => {
  if (criteria.makeId && fitment.makeId !== criteria.makeId) return false;
  if (criteria.modelId && fitment.modelId !== criteria.modelId) return false;
  if (criteria.generationId && fitment.generationId !== criteria.generationId) return false;
  if (criteria.engineId && fitment.engineId !== criteria.engineId) return false;
  if (criteria.trimId && fitment.trimId !== criteria.trimId) return false;
  if (criteria.year) {
    const year = criteria.year;
    if (fitment.yearStart && year < fitment.yearStart) return false;
    if (fitment.yearEnd && year > fitment.yearEnd) return false;
  }
  return true;
};

// ---------- VehicleFilterSidebar (for search page) ----------
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
  const { data: makesData, isLoading: makesLoading } = useGetMakesQuery({ page: 1, limit: 100 });
  const makes = makesData?.data || [];

  const { data: modelsData, isLoading: modelsLoading } = useGetModelsQuery(
    { makeId: tempMake?.id, page: 1, limit: 100 },
    { skip: !tempMake }
  );
  const models = modelsData?.data || [];

  const { data: generationsData, isLoading: generationsLoading } = useGetGenerationsQuery(
    { modelId: tempModel?.id, page: 1, limit: 100 },
    { skip: !tempModel }
  );
  const generations = generationsData?.data || [];

  const { data: enginesData, isLoading: enginesLoading } = useGetEnginesQuery(
    { generationId: tempGeneration?.id, page: 1, limit: 100 },
    { skip: !tempGeneration }
  );
  const engines = enginesData?.data || [];

  const { data: trimsData, isLoading: trimsLoading } = useGetTrimsQuery(
    { engineId: tempEngine?.id, page: 1, limit: 100 },
    { skip: !tempEngine }
  );
  const trims = trimsData?.data || [];

  const hasActiveFilters = tempMake || tempModel || tempGeneration || tempEngine || tempTrim || tempYear;

  const handleMakeChange = (makeId: string) => {
    const make = makes.find((m: VehicleMake) => m.id === makeId) || null;
    onTempMakeChange(make);
    onTempModelChange(null);
    onTempGenerationChange(null);
    onTempEngineChange(null);
    onTempTrimChange(null);
  };

  const handleModelChange = (modelId: string) => {
    const model = models.find((m: VehicleModel) => m.id === modelId) || null;
    onTempModelChange(model);
    onTempGenerationChange(null);
    onTempEngineChange(null);
    onTempTrimChange(null);
  };

  const handleGenerationChange = (genId: string) => {
    const gen = generations.find((g: VehicleGeneration) => g.id === genId) || null;
    onTempGenerationChange(gen);
    onTempEngineChange(null);
    onTempTrimChange(null);
  };

  const handleEngineChange = (engineId: string) => {
    const engine = engines.find((e: VehicleEngine) => e.id === engineId) || null;
    onTempEngineChange(engine);
    onTempTrimChange(null);
  };

  const handleTrimChange = (trimId: string) => {
    const trim = trims.find((t: VehicleTrim) => t.id === trimId) || null;
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
            {makes.map((make: VehicleMake) => (
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
              {models.map((model: VehicleModel) => (
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
              {generations.map((gen: VehicleGeneration) => (
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
              {engines.map((eng: VehicleEngine) => (
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
              {trims.map((trim: VehicleTrim) => (
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

// ---------- Main Fitment Search Page ----------
export default function FitmentSearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  // Filter state initialized from URL params
  const [tempMake, setTempMake] = useState<VehicleMake | null>(null);
  const [tempModel, setTempModel] = useState<VehicleModel | null>(null);
  const [tempGeneration, setTempGeneration] = useState<VehicleGeneration | null>(null);
  const [tempEngine, setTempEngine] = useState<VehicleEngine | null>(null);
  const [tempTrim, setTempTrim] = useState<VehicleTrim | null>(null);
  const [tempYear, setTempYear] = useState(searchParams.get("year") || "");
  
  // Store full objects for makes/models/etc by fetching them
  const makeIdFromUrl = searchParams.get("makeId");
  const modelIdFromUrl = searchParams.get("modelId");
  const generationIdFromUrl = searchParams.get("generationId");
  const engineIdFromUrl = searchParams.get("engineId");
  const trimIdFromUrl = searchParams.get("trimId");
  
  // Fetch all fitments and products
  const { data: fitmentsData, isLoading: fitmentsLoading } = useGetFitmentsQuery({ limit: 10000 });
  const fitments = fitmentsData?.items || [];
  const { data: allProducts = [], isLoading: productsLoading, error: productsError } = useGetProductsQuery();
  
  // Fetch vehicle data to resolve IDs to objects
  const { data: makesData } = useGetMakesQuery({ page: 1, limit: 100 });
  const { data: modelsData } = useGetModelsQuery({ page: 1, limit: 100 });
  const { data: generationsData } = useGetGenerationsQuery({ page: 1, limit: 100 });
  const { data: enginesData } = useGetEnginesQuery({ page: 1, limit: 100 });
  const { data: trimsData } = useGetTrimsQuery({ page: 1, limit: 100 });
  
  // Initialize filter objects from URL params when vehicle data loads
  useEffect(() => {
    if (makeIdFromUrl && makesData?.data) {
      const make = makesData.data.find((m: VehicleMake) => m.id === makeIdFromUrl);
      if (make) setTempMake(make);
    }
  }, [makeIdFromUrl, makesData]);
  
  useEffect(() => {
    if (modelIdFromUrl && modelsData?.data) {
      const model = modelsData.data.find((m: VehicleModel) => m.id === modelIdFromUrl);
      if (model) setTempModel(model);
    }
  }, [modelIdFromUrl, modelsData]);
  
  useEffect(() => {
    if (generationIdFromUrl && generationsData?.data) {
      const gen = generationsData.data.find((g: VehicleGeneration) => g.id === generationIdFromUrl);
      if (gen) setTempGeneration(gen);
    }
  }, [generationIdFromUrl, generationsData]);
  
  useEffect(() => {
    if (engineIdFromUrl && enginesData?.data) {
      const engine = enginesData.data.find((e: VehicleEngine) => e.id === engineIdFromUrl);
      if (engine) setTempEngine(engine);
    }
  }, [engineIdFromUrl, enginesData]);
  
  useEffect(() => {
    if (trimIdFromUrl && trimsData?.data) {
      const trim = trimsData.data.find((t: VehicleTrim) => t.id === trimIdFromUrl);
      if (trim) setTempTrim(trim);
    }
  }, [trimIdFromUrl, trimsData]);
  
  // Compute matching product IDs
  const filteredProductIds = useMemo(() => {
    if (fitmentsLoading || productsLoading) return null;
    
    const hasFilters = tempMake || tempModel || tempGeneration || tempEngine || tempTrim || tempYear;
    if (!hasFilters) return null;
    
    const criteria = {
      makeId: tempMake?.id,
      modelId: tempModel?.id,
      generationId: tempGeneration?.id,
      engineId: tempEngine?.id,
      trimId: tempTrim?.id,
      year: tempYear ? parseInt(tempYear) : null,
    };
    
    const matchingProductIds = new Set<string>();
    for (const fitment of fitments) {
      if (matchesFitment(criteria, fitment)) {
        matchingProductIds.add(fitment.productId);
      }
    }
    return matchingProductIds;
  }, [fitments, fitmentsLoading, productsLoading, tempMake, tempModel, tempGeneration, tempEngine, tempTrim, tempYear]);
  
  const displayProducts = useMemo(() => {
    if (filteredProductIds === null) return allProducts;
    return allProducts.filter((p: any) => filteredProductIds.has(p.id));
  }, [allProducts, filteredProductIds]);
  
  const isLoading = (productsLoading || fitmentsLoading) && displayProducts.length === 0;
  const resultCount = displayProducts.length;
  const hasActiveFilters = !!(tempMake || tempModel || tempGeneration || tempEngine || tempTrim || tempYear);
  
  const handleSearch = () => {
    // Update URL params and trigger re-search
    const params = new URLSearchParams();
    if (tempMake?.id) params.set("makeId", tempMake.id);
    if (tempModel?.id) params.set("modelId", tempModel.id);
    if (tempGeneration?.id) params.set("generationId", tempGeneration.id);
    if (tempEngine?.id) params.set("engineId", tempEngine.id);
    if (tempTrim?.id) params.set("trimId", tempTrim.id);
    if (tempYear) params.set("year", tempYear);
    
    if (!hasActiveFilters) {
      setToast({ message: "Please select at least one vehicle attribute to search.", type: "error" });
      return;
    }
    
    setSearchParams(params);
  };
  
  const clearFitmentFilters = () => {
    setTempMake(null);
    setTempModel(null);
    setTempGeneration(null);
    setTempEngine(null);
    setTempTrim(null);
    setTempYear("");
    setSearchParams({});
  };
  
  if (productsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white shadow-lg p-6 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 flex items-center justify-center mx-auto mb-4"><X size={32} className="text-red-500" /></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load products</h2>
          <p className="text-gray-500 mb-6">Please try again later.</p>
          <button onClick={() => navigate("/")} className="px-4 py-2 bg-emerald-800 text-white hover:bg-emerald-900 transition">Back to Home</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-gray-500 hover:text-emerald-600 mb-6 transition group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition" />
          <span>Back to Home</span>
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 mb-8">
          <div className="w-full">
            {fitmentsLoading ? (
              <VehicleFilterSidebarSkeleton />
            ) : (
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
            )}
          </div>
          
          <div className="w-full">
            {/* Results header */}
            <div className="bg-white border border-gray-100/50 p-5 mb-6">
              <h1 className="text-xl font-bold text-gray-900 mb-2">Fitment Search Results</h1>
              {hasActiveFilters ? (
                <p className="text-gray-600">
                  Found <span className="font-bold text-emerald-800">{resultCount}</span> product{resultCount !== 1 ? "s" : ""} that fit your vehicle.
                </p>
              ) : (
                <p className="text-gray-600">Select vehicle attributes above and click Search to find compatible products.</p>
              )}
            </div>
            
            {/* Product grid */}
            {isLoading ? (
              <ProductGridSkeleton />
            ) : displayProducts.length === 0 && hasActiveFilters ? (
              <div className="bg-white shadow-sm p-12 text-center text-gray-500">
                <p className="text-lg">No products found that fit your vehicle.</p>
                <p className="mt-2 text-sm">Try adjusting your filters or clearing them to see all products.</p>
                <button
                  onClick={clearFitmentFilters}
                  className="mt-4 px-4 py-2 bg-emerald-800 text-white hover:bg-emerald-900 transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="bg-white shadow-sm p-12 text-center text-gray-500">
                <p>Use the filter sidebar to search for compatible products.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {displayProducts.map((product: any) => (
                  <div key={product.id} className="transform transition-all duration-300 hover:-translate-y-1">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <BackToTop />
    </div>
  );
}