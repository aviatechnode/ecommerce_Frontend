import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useProductBuilder } from "../store/productBuilderStore";
import { useGetProductsQuery } from "../../services/productApi";
import { ChevronDown, ChevronUp, FolderOpen, Search, Package } from "lucide-react";

import StepBasic from "../steps/StepBasic";
import StepVariants from "../steps/StepVariants";
import StepInventory from "../steps/StepInventory";
import StepMedia from "../steps/StepMedia";
import StepReview from "../steps/StepReview";

import { FormProvider } from "react-hook-form";
import { useProductForm } from "../steps/util/formProvider";

// Fixed row height for virtualization (in pixels)
const ROW_HEIGHT = 65;
// Number of extra rows to render outside viewport for smoother scrolling
const BUFFER_COUNT = 5;

export default function ProductBuilder() {
  const step = useProductBuilder((s) => s.step);
  const store = useProductBuilder();
  const { form } = useProductForm();

  // Toggle state for product table
  const [showProducts, setShowProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Refs for virtualization
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Fetch products list
  const { data: products = [], isLoading, error, refetch } = useGetProductsQuery();

  // Filter products based on search term (name or ID only)
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  // Virtualization calculations
  const totalRows = filteredProducts.length;
  const totalHeight = totalRows * ROW_HEIGHT;

  // Calculate visible range based on scroll position
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_COUNT);
  const endIndex = Math.min(
    totalRows,
    Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + BUFFER_COUNT
  );

  // Get visible products
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, startIndex, endIndex]);

  // Calculate offset for the visible rows container
  const offsetY = startIndex * ROW_HEIGHT;

  // Handle scroll event with throttling
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const newScrollTop = scrollContainerRef.current.scrollTop;
      setScrollTop(newScrollTop);
    }
  }, []);

  // Update container height on resize
  const updateContainerHeight = useCallback(() => {
    if (scrollContainerRef.current) {
      setContainerHeight(scrollContainerRef.current.clientHeight);
    }
  }, []);

  // Set up scroll and resize listeners
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    updateContainerHeight();
    scrollContainer.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", updateContainerHeight);

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateContainerHeight);
    };
  }, [handleScroll, updateContainerHeight]);

  // Reset scroll position when search term changes or table is shown
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [searchTerm, showProducts]);

  // Handler to load a full product into the builder store
  const handleLoadProduct = (product: any) => {
    store.reset();

    store.setProduct("id", product.id);
    store.setProduct("name", product.name);
    store.setProduct("description", product.description);
    store.setProduct("brandId", product.brandId);
    store.setProduct("categoryId", product.categoryId);
    store.setProduct("isActive", product.isActive);
    store.setProduct("isFeatured", product.isFeatured);
    store.setProduct("searchKeywords", product.searchKeywords);

    if (product.medias?.length) {
      store.setMedias(product.medias);
    }

    if (product.variants?.length) {
      product.variants.forEach((variant: any) => {
        store.addVariant(variant);
      });
    }

    if (product.specifications?.length) {
      product.specifications.forEach((spec: any, idx: number) => {
        store.addSpec();
        store.updateSpec(idx, "name", spec.name);
        store.updateSpec(idx, "value", spec.value);
      });
    }

    if (product.productFitments?.length) {
      product.productFitments.forEach((fitment: any) => {
        store.addFitment(fitment);
      });
    }

    if (product.oemNumbers?.length) {
      product.oemNumbers.forEach((oem: any, idx: number) => {
        store.addOEMNumber();
        store.updateOEMNumber(idx, oem.oemNumber);
      });
    }
  };

  return (
    <FormProvider {...form}>
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <div className="mx-auto w-full px-4 py-6 lg:px-6 xl:px-8">
          <div className="space-y-6">
            {/* Header with toggle button and title */}
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">
                  🛍️ Product Builder
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Create or edit your product across multiple steps
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProducts((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {showProducts ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide Products Table
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show Products Table
                  </>
                )}
              </button>
            </div>

            {/* Expandable product table card with virtualization */}
            {showProducts && (
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all">
                <div className="border-b border-gray-200 bg-gray-50/80 px-6 py-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">📋 Existing Products</h2>
                      <p className="text-sm text-gray-500">Load a product to edit or continue from where you left off</p>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Virtualized scroll container */}
                <div
                  ref={scrollContainerRef}
                  className="overflow-y-auto"
                  style={{ height: "500px" }}
                >
                  {isLoading && (
                    <div className="flex items-center justify-center gap-2 p-12 text-gray-500">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
                      <span>Loading products...</span>
                    </div>
                  )}
                  {error && (
                    <div className="p-8 text-center text-red-500">
                      <p>Failed to load products.</p>
                      <button
                        onClick={() => refetch()}
                        className="mt-2 inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  {!isLoading && !error && filteredProducts.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                      <Package className="mx-auto h-10 w-10 text-gray-300" />
                      <p className="mt-2">No products found</p>
                      <p className="text-xs text-gray-400">
                        {searchTerm ? "Try a different search term" : "Create your first product using the form above"}
                      </p>
                    </div>
                  )}
                  {!isLoading && !error && filteredProducts.length > 0 && (
                    <div className="relative">
                      {/* Table Header - sticky */}
                      <div className="sticky top-0 z-10 grid items-center gap-4 border-b border-gray-200 bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                           style={{
                             gridTemplateColumns: "minmax(200px, 2fr) minmax(100px, 1fr) minmax(80px, 0.8fr) minmax(100px, 1fr) minmax(90px, 0.8fr)",
                           }}>
                        <div>Product Name</div>
                        <div>ID</div>
                        <div>Status</div>
                        <div>Created</div>
                        <div className="text-right">Actions</div>
                      </div>

                      {/* Spacer for total height to enable scrolling */}
                      <div style={{ height: `${totalHeight}px`, position: "relative" }}>
                        {/* Visible rows container with absolute positioning */}
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            transform: `translateY(${offsetY}px)`,
                          }}
                        >
                          {visibleProducts.map((product) => (
                            <div
                              key={product.id}
                              className="grid items-center gap-4 border-b border-gray-100 px-6 py-3 transition hover:bg-gray-50"
                              style={{
                                height: `${ROW_HEIGHT}px`,
                                gridTemplateColumns: "minmax(200px, 2fr) minmax(100px, 1fr) minmax(80px, 0.8fr) minmax(100px, 1fr) minmax(90px, 0.8fr)",
                              }}
                            >
                              <div className="truncate text-sm font-medium text-gray-900" title={product.name}>
                                {product.name}
                              </div>
                              <div className="font-mono text-xs text-gray-500">
                                {product.id.slice(0, 8)}…
                              </div>
                              <div>
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    product.isActive
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {product.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(product.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-right text-sm">
                                <button
                                  onClick={() => handleLoadProduct(product)}
                                  className="inline-flex items-center gap-1 rounded-md px-3 py-1 text-green-700 transition hover:bg-green-50 hover:text-green-900"
                                  title="Load this product into the builder"
                                >
                                  <FolderOpen className="h-4 w-4" />
                                  Load
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {!isLoading && !error && filteredProducts.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-right text-xs text-gray-500">
                    Showing {filteredProducts.length} of {products.length} products
                  </div>
                )}
              </div>
            )}

            {/* Step forms – now wrapped in a consistent card with matching padding */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              {step === 1 && <StepBasic nextStep={store.nextStep} />}
              {step === 2 && (
                <StepVariants nextStep={store.nextStep} prevStep={store.prevStep} />
              )}
              {step === 3 && (
                <StepInventory nextStep={store.nextStep} prevStep={store.prevStep} />
              )}
              {step === 4 && (
                <StepMedia nextStep={store.nextStep} prevStep={store.prevStep} />
              )}
              {step === 5 && <StepReview prevStep={store.prevStep} />}
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}