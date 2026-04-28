import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../state-management/categorySlice";
import { fetchBrands } from "../state-management/brandSlice";
import { useProductBuilder } from "../store/productBuilderStore";
import type { AppDispatch, RootState } from "../store/store";


export default function StepBasic() {
  const dispatch = useDispatch<AppDispatch>();

  const { categories, loading: categoryLoading } = useSelector(
    (state: RootState) => state.categories
  );

  const { brands, loading: brandLoading } = useSelector(
    (state: RootState) => state.brands
  );

  const { product, setProduct, nextStep } = useProductBuilder();
  const { oemNumbers, addOEMNumber, updateOEMNumber, removeOEMNumber } =
  useProductBuilder();

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  const canProceed =
    !!product.name && !!product.brandId && !!product.categoryId;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Basic Product Information
        </h2>
        <p className="text-sm text-gray-500">
          Start by adding core product details
        </p>
      </div>

      {/* CARD */}
      <div className="border rounded-xl p-5 bg-white shadow-sm space-y-4">

        {/* PRODUCT NAME */}
        <div>
          <label className="text-sm text-gray-600">Product Name *</label>
          <input
            placeholder="e.g. Asimco Brake Pads"
            value={product.name}
            onChange={(e) => setProduct("name", e.target.value)}
            className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-sm text-gray-600">Description</label>
          <textarea
            placeholder="Describe the product..."
            value={product.description || ""}
            onChange={(e) => setProduct("description", e.target.value)}
            className="border rounded-lg p-2 w-full min-h-25 focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* SEARCH KEYWORDS */}
        <div>
          <label className="text-sm text-gray-600">Search Keywords</label>
          <input
            placeholder="e.g. brake pads toyota camry ceramic"
            value={product.searchKeywords || ""}
            onChange={(e) =>
              setProduct("searchKeywords", e.target.value)
            }
            className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* OEM NUMBERS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">OEM Numbers</label>

            <button
              type="button"
              onClick={addOEMNumber}
              className="text-sm text-green-600"
            >
              + Add
            </button>
          </div>

          {oemNumbers.map((oem, index) => (
            <div key={index} className="flex gap-2">
              <input
                placeholder="e.g. KD2520"
                value={oem.oemNumber}
                onChange={(e) => updateOEMNumber(index, e.target.value)}
                className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-500"
              />

              <button
                type="button"
                onClick={() => removeOEMNumber(index)}
                className="text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        {/* ACTIVE */}
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="accent-green-600"
            checked={product.isActive ?? true}
            onChange={(e) => setProduct("isActive", e.target.checked)}
          />
          Active Product
        </label>

        {/* FEATURED */}
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="accent-green-600"
            checked={product.isFeatured ?? false}
            onChange={(e) => setProduct("isFeatured", e.target.checked)}
          />
          Featured Product
        </label>

        {/* BRAND + CATEGORY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* BRAND */}
          <div>
            <label className="text-sm text-gray-600">Brand *</label>
            <select
              value={product.brandId}
              onChange={(e) => setProduct("brandId", e.target.value)}
              className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-500"
            >
              <option value="">
                {brandLoading ? "Loading brands..." : "Select brand"}
              </option>
              {brands.map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* CATEGORY */}
          <div>
            <label className="text-sm text-gray-600">Category *</label>
            <select
              value={product.categoryId}
              onChange={(e) => setProduct("categoryId", e.target.value)}
              className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-500"
            >
              <option value="">
                {categoryLoading ? "Loading categories..." : "Select category"}
              </option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* WARNING */}
        {!canProceed && (
          <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
            Please fill Product Name, Brand, and Category to continue.
          </div>
        )}

        {/* NEXT */}
        <button
          onClick={nextStep}
          disabled={!canProceed}
          className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Variants
        </button>
      </div>
    </div>
  );
}