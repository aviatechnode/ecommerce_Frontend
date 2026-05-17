import { memo, useMemo, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { ChevronRight, Plus, X, AlertCircle, Package, Tag, Building2, Brush, CheckCircle2 } from "lucide-react";

import type { ProductFormValues } from "../../types/product.form.types";
import { useProductBuilder } from "../store/productBuilderStore";
import { useGetCategoriesQuery } from "../../services/categoryApi";
import { useGetBrandsQuery } from "../../services/brandApi";
import type { StepProps } from "./util/stepProps";


/* =========================================================
   COMPONENT PROPS
========================================================= */
interface StepBasicProps extends StepProps {}

/* =========================================================
   COMPONENT
========================================================= */
function StepBasicComponent({ nextStep }: StepBasicProps) {
  // ---------------------- STORE --------------------------
  const store = useProductBuilder();
  const {
    product,
    oemNumbers,
    setProduct,
    addOEMNumber,
    updateOEMNumber,
    removeOEMNumber,
  } = store;

  // ---------------------- FORM CONTEXT (for validation & submission) -----
  const {
    setValue,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  // ---------------------- API data --------------------------
  const { data: categories = [], isLoading: categoryLoading } = useGetCategoriesQuery();
  const { data: brands = [], isLoading: brandLoading } = useGetBrandsQuery();

  // ---------------------- Memoized derived state --------------------------
  const canProceed = useMemo(() => {
    return !!product.name && !!product.brandId && !!product.categoryId;
  }, [product.name, product.brandId, product.categoryId]);

  const completionPercentage = useMemo(() => {
    let completed = 0;
    let total = 3;
    if (product.name) completed++;
    if (product.brandId) completed++;
    if (product.categoryId) completed++;
    return (completed / total) * 100;
  }, [product.name, product.brandId, product.categoryId]);

  // ---------------------- Handlers that update BOTH store AND form ---------
  const handleProductChange = useCallback(
    <K extends keyof typeof product>(field: K, value: typeof product[K]) => {
      // 1. Update store
      setProduct(field, value);
      // 2. Sync to react‑hook‑form – use type assertion because the shapes match
      setValue(field as any, value, { shouldDirty: true, shouldValidate: true });
    },
    [setProduct, setValue]
  );

  const handleAddOEM = useCallback(() => {
    // 1. Update store
    addOEMNumber();
    // 2. Sync to form's field array
    const updated = [...oemNumbers, { oemNumber: "" }];
    setValue("oemNumbers", updated, { shouldDirty: true });
  }, [addOEMNumber, oemNumbers, setValue]);

  const handleUpdateOEM = useCallback(
    (index: number, value: string) => {
      // 1. Update store
      updateOEMNumber(index, value);
      // 2. Sync to form
      const updated = [...oemNumbers];
      if (updated[index]) updated[index].oemNumber = value;
      setValue("oemNumbers", updated, { shouldDirty: true });
    },
    [updateOEMNumber, oemNumbers, setValue]
  );

  const handleRemoveOEM = useCallback(
    (index: number) => {
      // 1. Update store
      removeOEMNumber(index);
      // 2. Sync to form
      const updated = oemNumbers.filter((_, i) => i !== index);
      setValue("oemNumbers", updated, { shouldDirty: true });
    },
    [removeOEMNumber, oemNumbers, setValue]
  );

  // ---------------------- Render --------------------------
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="mx-auto w-full px-4 py-6 lg:px-6 xl:px-8">
        <div className="space-y-6">
          {/* HEADER with progress */}
          <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">
                📦 Basic Product Information
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Start by adding core product details
              </p>
            </div>

            {/* Progress indicator */}
            <div className="w-full lg:w-64">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Completion</span>
                <span>{Math.round(completionPercentage)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-linear-to-r from-green-500 to-green-600 transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* MAIN FORM GRID */}
          <div className="grid gap-6 xl:grid-cols-3">
            {/* MAIN FORM - 2/3 width */}
            <div className="space-y-6 xl:col-span-2">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
                  <p className="text-sm text-gray-500">Core information about your product</p>
                </div>

                <div className="space-y-6 p-6">
                  {/* PRODUCT NAME */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="e.g., Asimco Brake Pads"
                      value={product.name}
                      onChange={(e) => handleProductChange("name", e.target.value)}
                      className={`block w-full rounded-lg border px-4 py-2.5 shadow-sm transition focus:ring-2 focus:ring-green-500 ${
                        errors.name
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-300 focus:border-green-500"
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">Product name is required</p>
                    )}
                  </div>

                  {/* DESCRIPTION */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      placeholder="Describe your product in detail..."
                      rows={4}
                      value={product.description ?? ""}
                      onChange={(e) => handleProductChange("description", e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      {product.description?.length || 0} characters • A good description helps with SEO
                    </p>
                  </div>

                  {/* SEARCH KEYWORDS */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Search Keywords
                    </label>
                    <input
                      placeholder="brake pads, ceramic brake pads, toyota camry"
                      value={product.searchKeywords ?? ""}
                      onChange={(e) => handleProductChange("searchKeywords", e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                    />
                    <div className="mt-1 flex flex-wrap gap-2">
                      <p className="text-xs text-gray-400">
                        Comma-separated keywords for better discovery
                      </p>
                      {product.searchKeywords && product.searchKeywords.split(",").length > 0 && (
                        <span className="text-xs text-green-600">
                          {product.searchKeywords.split(",").length} keyword
                          {product.searchKeywords.split(",").length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* OEM NUMBERS - using store actions */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        OEM Numbers
                      </label>
                      <button
                        type="button"
                        onClick={handleAddOEM}
                        className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add OEM
                      </button>
                    </div>

                    {oemNumbers.length === 0 && (
                      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                        <Package className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">No OEM numbers added yet</p>
                        <p className="text-xs text-gray-400">Add manufacturer part numbers for cross-referencing</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {oemNumbers.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            placeholder="e.g., KD2520, 12345-ABC"
                            value={item.oemNumber}
                            onChange={(e) => handleUpdateOEM(index, e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-sm shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOEM(index)}
                            className="rounded-lg bg-red-50 px-4 py-2.5 text-red-600 transition hover:bg-red-100"
                            title="Remove"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* BRAND & CATEGORY SECTION */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">Classification</h2>
                  <p className="text-sm text-gray-500">Categorize your product for better organization</p>
                </div>

                <div className="p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* BRAND */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Brand <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <select
                          value={product.brandId}
                          onChange={(e) => handleProductChange("brandId", e.target.value)}
                          className="block w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                        >
                          <option value="">
                            {brandLoading ? "Loading brands..." : "Select brand"}
                          </option>
                          {brands.map((brand) => (
                            <option key={brand.id} value={brand.id}>
                              {brand.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* CATEGORY */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <select
                          value={product.categoryId}
                          onChange={(e) => handleProductChange("categoryId", e.target.value)}
                          className="block w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                        >
                          <option value="">
                            {categoryLoading ? "Loading categories..." : "Select category"}
                          </option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SIDEBAR - 1/3 width */}
            <div className="space-y-6">
              {/* Status Card */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="font-semibold text-gray-900">Status</h3>
                </div>
                <div className="space-y-4 p-6">
                  <label className="flex cursor-pointer items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${product.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                      <span className="text-sm font-medium text-gray-700">Active Product</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={product.isActive}
                      onChange={(e) => handleProductChange("isActive", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Brush className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Featured Product</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={product.isFeatured}
                      onChange={(e) => handleProductChange("isFeatured", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </label>
                </div>
              </div>

              {/* Requirements Card */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="font-semibold text-gray-900">Requirements</h3>
                </div>
                <div className="space-y-3 p-6">
                  <div className="flex items-center gap-2">
                    {product.name ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-gray-300" />
                    )}
                    <span className="text-sm text-gray-600">Product Name</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.brandId ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-gray-300" />
                    )}
                    <span className="text-sm text-gray-600">Brand Selection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.categoryId ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-gray-300" />
                    )}
                    <span className="text-sm text-gray-600">Category Selection</span>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="font-semibold text-gray-900">Quick Stats</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{oemNumbers.length}</p>
                    <p className="text-xs text-gray-500">OEM Numbers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {product.description?.length || 0}
                    </p>
                    <p className="text-xs text-gray-500">Characters</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WARNING & ACTION */}
          <div className="space-y-4">
            {!canProceed && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Required fields missing</p>
                  <p className="text-xs text-amber-700">
                    Please fill in Product Name, Brand, and Category to continue.
                  </p>
                </div>
              </div>
            )}

            {/* NEXT BUTTON */}
            <button
              type="button"
              onClick={nextStep}
              disabled={!canProceed}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Variants
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const StepBasic = memo(StepBasicComponent);

export default StepBasic;