import {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";

import { FormProvider } from "react-hook-form";

import {
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Search,
  Package,
  Copy,
  Trash2,
  Plus,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import {
  nextStep,
  prevStep,
  resetStep,
} from "../steps/util/stepSlice";
import type { RootState } from "../store/store";

import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "../../services/productApi";

import { useProductForm, emptyProduct } from "../../admin/steps/util/formProvider";

import type { Product } from "../../services/productApi";

import StepBasic from "../steps/StepBasic";
import StepVariants from "../steps/StepVariants";
import StepSpecifications from "../steps/StepSpecifications";
import StepInventory from "../steps/StepInventory";
import StepMedia from "../steps/StepMedia";
import StepReview from "../steps/StepReview";
import StepFitments from "../steps/StepFitments";

/* =========================================================
CONSTANTS
========================================================= */

const ROW_HEIGHT = 65;
const BUFFER_COUNT = 5;

/* =========================================================
COMPONENT
========================================================= */

export default function AdminProducts() {
  const step = useSelector((state: RootState) => state.step.value);
  const dispatch = useDispatch();

  const { form, resetFormWithProduct, save } = useProductForm();
  const [deleteProduct] = useDeleteProductMutation();

  const [showProducts, setShowProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | undefined>(undefined);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const { data: products = [], isLoading, error, refetch } = useGetProductsQuery();

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(term) ||
        product.id?.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  // Virtual scroll logic
  const totalRows = filteredProducts.length;
  const totalHeight = totalRows * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_COUNT);
  const endIndex = Math.min(totalRows, Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + BUFFER_COUNT);
  const visibleProducts = useMemo(() => filteredProducts.slice(startIndex, endIndex), [filteredProducts, startIndex, endIndex]);
  const offsetY = startIndex * ROW_HEIGHT;

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) setScrollTop(scrollContainerRef.current.scrollTop);
  }, []);

  const updateContainerHeight = useCallback(() => {
    if (scrollContainerRef.current) setContainerHeight(scrollContainerRef.current.clientHeight);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    updateContainerHeight();
    container.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", updateContainerHeight);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateContainerHeight);
    };
  }, [handleScroll, updateContainerHeight]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [searchTerm, showProducts]);

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopySuccessId(id);
      setTimeout(() => setCopySuccessId(null), 2000);
    } catch (error) {
      console.error("Failed to copy product ID:", error);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`);
    if (!confirmed) return;
    try {
      await deleteProduct(product.id).unwrap();
      refetch();
      if (editingProductId === product.id) {
        resetFormWithProduct(emptyProduct);
        setEditingProductId(undefined);
        dispatch(resetStep());
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  const handleLoadProduct = (product: Product) => {
    resetFormWithProduct(product);
    setEditingProductId(product.id);
    dispatch(resetStep());
  };

  const handleNewProduct = () => {
    resetFormWithProduct(emptyProduct);
    setEditingProductId(undefined);
    dispatch(resetStep());
  };

  return (
    <FormProvider {...form}>
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <div className="mx-auto w-full px-4 py-6 lg:px-6 xl:px-8">
          <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">
                  🛍️ Product Builder
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Create or edit products across multiple steps
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleNewProduct}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  New Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowProducts((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:shadow-md"
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
            </div>

            {/* PRODUCTS TABLE */}
            {showProducts && (
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {/* Table Header */}
                <div className="border-b border-gray-200 bg-gray-50/80 px-6 py-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        📋 Existing Products
                      </h2>
                      <p className="text-sm text-gray-500">
                        Edit, copy ID, or delete products
                      </p>
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

                {/* Table Body */}
                <div ref={scrollContainerRef} className="overflow-y-auto" style={{ height: "500px" }}>
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
                    </div>
                  )}
                  {!isLoading && !error && filteredProducts.length > 0 && (
                    <div className="relative">
                      {/* Sticky Header */}
                      <div
                        className="sticky top-0 z-10 grid items-center gap-4 border-b border-gray-200 bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        style={{
                          gridTemplateColumns: "minmax(200px, 2fr) minmax(100px, 1fr) minmax(80px, 0.8fr) minmax(100px, 1fr) minmax(140px, 1fr)",
                        }}
                      >
                        <div>Product Name</div>
                        <div>ID</div>
                        <div>Status</div>
                        <div>Created</div>
                        <div className="text-right">Actions</div>
                      </div>

                      {/* Virtualized Body */}
                      <div style={{ height: `${totalHeight}px`, position: "relative" }}>
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
                                gridTemplateColumns: "minmax(200px, 2fr) minmax(100px, 1fr) minmax(80px, 0.8fr) minmax(100px, 1fr) minmax(140px, 1fr)",
                              }}
                            >
                              <div className="truncate text-sm font-medium text-gray-900" title={product.name}>
                                {product.name}
                              </div>
                              <div className="flex items-center gap-1 font-mono text-xs text-gray-500">
                                {product.id.slice(0, 8)}…
                                <button
                                  type="button"
                                  onClick={() => handleCopyId(product.id)}
                                  className="text-gray-400 transition hover:text-green-600"
                                  title="Copy full ID"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                                {copySuccessId === product.id && (
                                  <span className="ml-1 text-[10px] text-green-600">Copied!</span>
                                )}
                              </div>
                              <div>
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    product.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {product.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(product.createdAt).toLocaleDateString()}
                              </div>
                              <div className="flex items-center justify-end gap-2 text-sm">
                                <button
                                  type="button"
                                  onClick={() => handleLoadProduct(product)}
                                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-green-700 transition hover:bg-green-50"
                                  title="Edit product"
                                >
                                  <FolderOpen className="h-4 w-4" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(product)}
                                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-red-600 transition hover:bg-red-50"
                                  title="Delete product"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {!isLoading && !error && filteredProducts.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-right text-xs text-gray-500">
                    Showing {filteredProducts.length} of {products.length} products
                  </div>
                )}
              </div>
            )}

            {/* STEP CONTENT */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              {step === 1 && <StepBasic nextStep={() => dispatch(nextStep())} />}
              {step === 2 && (
                <StepVariants
                  nextStep={() => dispatch(nextStep())}
                  prevStep={() => dispatch(prevStep())}
                />
              )}
              {step === 3 && (
                <StepSpecifications
                  nextStep={() => dispatch(nextStep())}
                  prevStep={() => dispatch(prevStep())}
                />
              )}
              {step === 4 && (
                <StepFitments
                  nextStep={() => dispatch(nextStep())}
                  prevStep={() => dispatch(prevStep())}
                />
              )}
              {step === 5 && (
                <StepInventory
                  nextStep={() => dispatch(nextStep())}
                  prevStep={() => dispatch(prevStep())}
                />
              )}
              {step === 6 && (
                <StepMedia
                  nextStep={() => dispatch(nextStep())}
                  prevStep={() => dispatch(prevStep())}
                />
              )}
              {step === 7 && (
                <StepReview
                  prevStep={() => dispatch(prevStep())}
                  onSave={save}
                  productId={editingProductId}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}