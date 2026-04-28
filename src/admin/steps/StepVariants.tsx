import { useEffect } from "react";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { useProductBuilder } from "../store/productBuilderStore";
import { generateSKU } from "../../client/helpers/skuGenerator";

import { fetchBrands } from "../state-management/brandSlice";
import { fetchCategories } from "../state-management/categorySlice";

import type { AppDispatch, RootState } from "../store/store";

export default function StepVariants() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    variants,
    addVariant,
    updateVariant,
    removeVariant,
    nextStep,
    prevStep,
    product,
  } = useProductBuilder();

  /* =========================================================
     REDUX DATA
  ========================================================= */

  const brands = useSelector(
    (state: RootState) => state.brands.brands
  );

  const categories = useSelector(
    (state: RootState) => state.categories.categories
  );

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    dispatch(fetchBrands());
    dispatch(fetchCategories());
  }, [dispatch]);

  /* =========================================================
     HELPERS
  ========================================================= */

  const toNumber = (value: string) => {
    if (value === "") return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  };

  /* =========================================================
     RESOLVE BRAND + CATEGORY FROM IDS
     (IMPORTANT: product should store IDs, not objects)
  ========================================================= */

  const selectedBrand = brands.find(
    (b) => b.id === product?.brandId
  );

  const selectedCategory = categories.find(
    (c) => c.id === product?.categoryId
  );

  /* =========================================================
     SKU BUILDER
  ========================================================= */

  const buildSKU = (variantName: string, index: number, allowFallback = false) => {
    return generateSKU({
      brand: selectedBrand?.name,
      category: selectedCategory?.name,
      product: product?.name,
      variant: variantName,
      index,
      allowFallback,
    });
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Product Variants
          </h2>
          <p className="text-sm text-gray-500">
            SKUs are generated from real product context
          </p>
        </div>

        {/* ADD VARIANT */}
        <button
          onClick={() => {
            const index = variants.length;

            const sku = buildSKU("", index, true);

            addVariant({ sku });
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
        >
          + Add Variant
        </button>
      </div>

      {/* EMPTY STATE */}
      {variants.length === 0 && (
        <div className="border rounded-xl p-8 text-center text-gray-500 bg-gray-50">
          <p className="font-medium">No variants yet</p>
          <p className="text-sm">Click “Add Variant” to start</p>
        </div>
      )}

      {/* VARIANTS */}
      <div className="space-y-6">
        {variants.map((v, index) => (
          <div
            key={v.id}
            className="border rounded-xl p-5 bg-white shadow-sm space-y-5"
          >

            {/* TOP BAR */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-700">
                  Variant {index + 1}
                </h3>
                <p className="text-xs text-gray-400">
                  Fill in product details
                </p>
              </div>

              <button
                onClick={() => removeVariant(v.id)}
                className="p-1 rounded-md hover:bg-red-50 text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* IDENTITY */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-600">
                Identity
              </h4>

              <input
                placeholder="Variant name"
                value={v.name || ""}
                onChange={(e) => {
                  const name = e.target.value;

                  updateVariant(v.id, "name", name);

                  const sku = buildSKU(name, index, true);
                  updateVariant(v.id, "sku", sku);
                }}
                className="border rounded-lg p-2 w-full"
              />

              {/* SKU */}
              <div className="flex gap-2">
                <input
                  value={v.sku || ""}
                  onChange={(e) =>
                    updateVariant(v.id, "sku", e.target.value)
                  }
                  className="border rounded-lg p-2 w-full"
                />

                <button
                  type="button"
                  onClick={() => {
                    const sku = buildSKU(v.name || "", index, true);
                    updateVariant(v.id, "sku", sku);
                  }}
                  className="px-3 text-xs bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Regenerate
                </button>
              </div>
            </div>

            {/* PRICING */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-600">
                Pricing
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <input
                  inputMode="decimal"
                  placeholder="Selling price"
                  value={v.price ?? ""}
                  onChange={(e) =>
                    updateVariant(v.id, "price", toNumber(e.target.value))
                  }
                  className="border rounded-lg p-2"
                />

                <input
                  inputMode="decimal"
                  placeholder="Cost price"
                  value={v.costPrice ?? ""}
                  onChange={(e) =>
                    updateVariant(v.id, "costPrice", toNumber(e.target.value))
                  }
                  className="border rounded-lg p-2"
                />
              </div>
            </div>

            {/* SPECIFICATIONS */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-600">
                Specifications
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                <input
                  placeholder="Weight"
                  value={v.weight ?? ""}
                  onChange={(e) =>
                    updateVariant(v.id, "weight", toNumber(e.target.value))
                  }
                  className="border rounded-lg p-2"
                />

                <input
                  placeholder="Length"
                  value={v.length ?? ""}
                  onChange={(e) =>
                    updateVariant(v.id, "length", toNumber(e.target.value))
                  }
                  className="border rounded-lg p-2"
                />

                <input
                  placeholder="Width"
                  value={v.width ?? ""}
                  onChange={(e) =>
                    updateVariant(v.id, "width", toNumber(e.target.value))
                  }
                  className="border rounded-lg p-2"
                />

                <input
                  placeholder="Height"
                  value={v.height ?? ""}
                  onChange={(e) =>
                    updateVariant(v.id, "height", toNumber(e.target.value))
                  }
                  className="border rounded-lg p-2"
                />
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* NAVIGATION */}
      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={prevStep}
          className="px-5 py-2 rounded-lg bg-gray-100"
        >
          Back
        </button>

        <button
          onClick={nextStep}
          className="px-5 py-2 rounded-lg bg-green-600 text-white"
        >
          Continue
        </button>
      </div>
    </div>
  );
}