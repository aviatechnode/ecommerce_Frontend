import { memo, useMemo } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { ChevronRight, Plus, X, AlertCircle, Package, Tag, Building2, Brush, CheckCircle2 } from "lucide-react";
import { useGetCategoriesQuery } from "../../services/categoryApi";
import { useGetBrandsQuery } from "../../services/brandApi";
import type { StepProps } from "./util/stepProps";
import type { CreateProductInput } from "../../schemas/product.schema";

function StepBasicComponent({ nextStep }: StepProps) {
  const { register, watch, formState: { errors } } = useFormContext<CreateProductInput>();
  const { fields: oemFields, append: addOEM, remove: removeOEM } = useFieldArray({
    name: "oemNumbers",
  });

  const { data: categories = [], isLoading: categoryLoading } = useGetCategoriesQuery();
  const { data: brands = [], isLoading: brandLoading } = useGetBrandsQuery();

  const name = watch("name");
  const brandId = watch("brandId");
  const categoryId = watch("categoryId");
  const description = watch("description");
  const searchKeywords = watch("searchKeywords");
  const isActive = watch("isActive");
  const isFeatured = watch("isFeatured");

  const canProceed = useMemo(() => !!name && !!brandId && !!categoryId, [name, brandId, categoryId]);
  const completionPercentage = useMemo(() => {
    let completed = 0;
    if (name) completed++;
    if (brandId) completed++;
    if (categoryId) completed++;
    return (completed / 3) * 100;
  }, [name, brandId, categoryId]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="mx-auto w-full px-4 py-6 lg:px-6 xl:px-8">
        <div className="space-y-6">
          {/* Header with progress */}
          <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">
                📦 Basic Product Information
              </h1>
              <p className="mt-1 text-sm text-gray-500">Start by adding core product details</p>
            </div>
            <div className="w-full lg:w-64">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                <span>Completion</span>
                <span>{Math.round(completionPercentage)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-linear-to-r from-green-500 to-green-600 transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            {/* Main form */}
            <div className="space-y-6 xl:col-span-2">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
                  <p className="text-sm text-gray-500">Core information about your product</p>
                </div>
                <div className="space-y-6 p-6">
                  {/* Product Name */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Product Name <span className="text-red-500">*</span></label>
                    <input
                      placeholder="e.g., Asimco Brake Pads"
                      {...register("name")}
                      className={`block w-full rounded-lg border px-4 py-2.5 shadow-sm transition focus:ring-2 focus:ring-green-500 ${
                        errors.name ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-green-500"
                      }`}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">Product name is required</p>}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      placeholder="Describe your product in detail..."
                      rows={4}
                      {...register("description")}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                    />
                    <p className="mt-1 text-xs text-gray-400">{description?.length || 0} characters • A good description helps with SEO</p>
                  </div>

                  {/* Search Keywords */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Search Keywords</label>
                    <input
                      placeholder="brake pads, ceramic brake pads, toyota camry"
                      {...register("searchKeywords")}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                    />
                    <div className="mt-1 flex flex-wrap gap-2">
                      <p className="text-xs text-gray-400">Comma-separated keywords for better discovery</p>
                      {searchKeywords && searchKeywords.split(",").length > 0 && (
                        <span className="text-xs text-green-600">
                          {searchKeywords.split(",").length} keyword{searchKeywords.split(",").length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* OEM Numbers */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">OEM Numbers</label>
                      <button
                        type="button"
                        onClick={() => addOEM({ oemNumber: "" })}
                        className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add OEM
                      </button>
                    </div>
                    {oemFields.length === 0 && (
                      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                        <Package className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">No OEM numbers added yet</p>
                        <p className="text-xs text-gray-400">Add manufacturer part numbers for cross-referencing</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      {oemFields.map((field, idx) => (
                        <div key={field.id} className="flex gap-2">
                          <input
                            placeholder="e.g., KD2520, 12345-ABC"
                            {...register(`oemNumbers.${idx}.oemNumber`)}
                            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-sm shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeOEM(idx)}
                            className="rounded-lg bg-red-50 px-4 py-2.5 text-red-600 transition hover:bg-red-100"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand & Category */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">Classification</h2>
                  <p className="text-sm text-gray-500">Categorize your product for better organization</p>
                </div>
                <div className="p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Brand <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <select {...register("brandId")} className="block w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200">
                          <option value="">{brandLoading ? "Loading brands..." : "Select brand"}</option>
                          {brands.map((brand) => (
                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <select {...register("categoryId")} className="block w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200">
                          <option value="">{categoryLoading ? "Loading categories..." : "Select category"}</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4"><h3 className="font-semibold text-gray-900">Status</h3></div>
                <div className="space-y-4 p-6">
                  <label className="flex cursor-pointer items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`} />
                      <span className="text-sm font-medium text-gray-700">Active Product</span>
                    </div>
                    <input type="checkbox" checked={isActive} {...register("isActive")} className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                  </label>
                  <label className="flex cursor-pointer items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Brush className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Featured Product</span>
                    </div>
                    <input type="checkbox" checked={isFeatured} {...register("isFeatured")} className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4"><h3 className="font-semibold text-gray-900">Requirements</h3></div>
                <div className="space-y-3 p-6">
                  <div className="flex items-center gap-2">
                    {name ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <div className="h-4 w-4 rounded-full border border-gray-300" />}
                    <span className="text-sm text-gray-600">Product Name</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {brandId ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <div className="h-4 w-4 rounded-full border border-gray-300" />}
                    <span className="text-sm text-gray-600">Brand Selection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {categoryId ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <div className="h-4 w-4 rounded-full border border-gray-300" />}
                    <span className="text-sm text-gray-600">Category Selection</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4"><h3 className="font-semibold text-gray-900">Quick Stats</h3></div>
                <div className="grid grid-cols-2 gap-4 p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{oemFields.length}</p>
                    <p className="text-xs text-gray-500">OEM Numbers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{description?.length || 0}</p>
                    <p className="text-xs text-gray-500">Characters</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {!canProceed && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Required fields missing</p>
                  <p className="text-xs text-amber-700">Please fill in Product Name, Brand, and Category to continue.</p>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={nextStep}
              disabled={!canProceed}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Variants <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const StepBasic = memo(StepBasicComponent);
export default StepBasic;