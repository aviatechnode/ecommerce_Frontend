import { memo } from "react";
import { X, Plus, RefreshCw } from "lucide-react";
import { useFormContext, useFieldArray } from "react-hook-form";

import type { ProductFormValues } from "../../types/product.form.types";
import { useGetBrandsQuery } from "../../services/brandApi";
import { useGetCategoriesQuery } from "../../services/categoryApi";
import { generateSKU } from "../../client/helpers/skuGenerator";
import type { StepProps } from "./util/stepProps";
import type { productVariantSchema } from "../../schemas/product.schema";

/* =========================================================
   COMPONENT PROPS
========================================================= */
interface StepVariantsProps extends StepProps {}

/* =========================================================
   COMPONENT
========================================================= */
function StepVariantsComponent({ nextStep, prevStep }: StepVariantsProps) {
  /* ---------------------------------------------------------
     React Hook Form
  --------------------------------------------------------- */
  const {
    watch,
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  const {
    fields: variantList,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "variants",
  });

  const formValues = watch();

  /* ---------------------------------------------------------
     API data
  --------------------------------------------------------- */
  const { data: brands = [] } = useGetBrandsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();

  /* ---------------------------------------------------------
     Derived state
  --------------------------------------------------------- */
  const selectedBrand = brands.find((b) => b.id === formValues.brandId);
  const selectedCategory = categories.find((c) => c.id === formValues.categoryId);

  /* ---------------------------------------------------------
     Variant operations
  --------------------------------------------------------- */
  const addVariant = () => {
    const index = variantList.length;

    const newVariant: productVariantSchema = {
      name: "",
      sku: generateSKU({
        brand: selectedBrand?.name,
        category: selectedCategory?.name,
        product: formValues.name,
        variant: "",
        index,
        allowFallback: true,
      }),
      price: 0,
      costPrice: undefined,
      compareAtPrice: undefined,
      weight: undefined,
      length: undefined,
      width: undefined,
      height: undefined,
      barcode: undefined,
      isActive: true,
      attributes: [],
      inventories: [],
    };

    append(newVariant);
  };

  const regenerateSKU = (index: number) => {
    const variantName = watch(`variants.${index}.name`) || "";
    const newSKU = generateSKU({
      brand: selectedBrand?.name,
      category: selectedCategory?.name,
      product: formValues.name,
      variant: variantName,
      index,
      allowFallback: true,
    });
    setValue(`variants.${index}.sku`, newSKU, { shouldDirty: true });
  };

  /* ---------------------------------------------------------
     Handle variant name change with SKU regeneration
  --------------------------------------------------------- */
  const handleVariantNameChange = (index: number, name: string) => {
    setValue(`variants.${index}.name`, name, { shouldDirty: true });

    // Auto-regenerate SKU when name changes
    const newSKU = generateSKU({
      brand: selectedBrand?.name,
      category: selectedCategory?.name,
      product: formValues.name,
      variant: name,
      index,
      allowFallback: true,
    });
    setValue(`variants.${index}.sku`, newSKU, { shouldDirty: true });
  };

  /* ---------------------------------------------------------
     Helper: convert empty string to undefined for number fields
  --------------------------------------------------------- */
  const toNumberOrUndefined = (value: string) => {
    if (value === "" || value === undefined || value === null) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  };

  /* ---------------------------------------------------------
     Render
  --------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              🎨 Product Variants
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              SKUs are generated automatically from your product context
            </p>
          </div>

          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            Add Variant
          </button>
        </div>

        {/* EMPTY STATE */}
        {variantList.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm transition-all">
            <div className="mb-3 text-5xl">🛒</div>
            <p className="text-lg font-medium text-gray-700">No variants yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Click "Add Variant" to create product options like size, color, or style
            </p>
          </div>
        )}

        {/* VARIANTS GRID */}
        <div className="space-y-6">
          {variantList.map((variant, index) => (
            <div
              key={variant.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-all hover:shadow-xl"
            >
              {/* VARIANT HEADER */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-linear-to-r from-gray-50 to-white px-6 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Variant {index + 1}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Configure pricing, dimensions, and inventory
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                  title="Remove variant"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* VARIANT CONTENT */}
              <div className="p-6 space-y-5">
                {/* VARIANT NAME */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Variant Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Small / Red / 128GB"
                    {...register(`variants.${index}.name`)}
                    onChange={(e) => handleVariantNameChange(index, e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    A descriptive name to identify this variant
                  </p>
                </div>

                {/* SKU WITH REGENERATE */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    SKU (Stock Keeping Unit)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Auto-generated SKU"
                      {...register(`variants.${index}.sku`)}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-sm shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                    />
                    <button
                      type="button"
                      onClick={() => regenerateSKU(index)}
                      className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                      title="Regenerate SKU"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Regenerate
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Unique identifier for inventory tracking
                  </p>
                </div>

                {/* PRICING SECTION */}
                <div className="rounded-xl bg-gray-50 p-5">
                  <h4 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
                    💰 Pricing
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Selling Price *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          inputMode="decimal"
                          placeholder="0.00"
                          {...register(`variants.${index}.price`, {
                            required: "Selling price is required",
                            setValueAs: toNumberOrUndefined,
                            min: { value: 0, message: "Price cannot be negative" },
                          })}
                          className="block w-full rounded-lg border border-gray-300 pl-7 pr-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      {errors?.variants?.[index]?.price && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.variants[index].price.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Cost Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          inputMode="decimal"
                          placeholder="0.00"
                          {...register(`variants.${index}.costPrice`, {
                            setValueAs: toNumberOrUndefined,
                            min: { value: 0, message: "Cost price cannot be negative" },
                          })}
                          className="block w-full rounded-lg border border-gray-300 pl-7 pr-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* DIMENSIONS SECTION */}
                <div>
                  <h4 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
                    📦 Dimensions & Weight
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.001"
                        inputMode="decimal"
                        placeholder="0.000"
                        {...register(`variants.${index}.weight`, {
                          setValueAs: toNumberOrUndefined,
                          min: { value: 0, message: "Weight cannot be negative" },
                        })}
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-gray-500">Length (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        inputMode="decimal"
                        placeholder="0.0"
                        {...register(`variants.${index}.length`, {
                          setValueAs: toNumberOrUndefined,
                          min: { value: 0, message: "Length cannot be negative" },
                        })}
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-gray-500">Width (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        inputMode="decimal"
                        placeholder="0.0"
                        {...register(`variants.${index}.width`, {
                          setValueAs: toNumberOrUndefined,
                          min: { value: 0, message: "Width cannot be negative" },
                        })}
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-gray-500">Height (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        inputMode="decimal"
                        placeholder="0.0"
                        {...register(`variants.${index}.height`, {
                          setValueAs: toNumberOrUndefined,
                          min: { value: 0, message: "Height cannot be negative" },
                        })}
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                </div>

                {/* OPTIONAL BARCODE */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Barcode (UPC / EAN)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Optional barcode"
                    {...register(`variants.${index}.barcode`)}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* NAVIGATION BUTTONS */}
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={prevStep}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-2.5 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            ← Back to Basic Info
          </button>

          <button
            type="button"
            onClick={nextStep}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 px-6 py-2.5 font-semibold text-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Continue to Inventory →
          </button>
        </div>
      </div>
    </div>
  );
}

const StepVariants = memo(StepVariantsComponent);
export default StepVariants;