// src/admin/components/steps/StepBasic.tsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchCategories } from "../state-management/categorySlice";
import { fetchBrands } from "../state-management/brandSlice";

import type { AppDispatch, RootState } from "../store/store";
import { useProductBuilder } from "../store/productBuilderStore";

export default function StepBasic() {
  const dispatch = useDispatch<AppDispatch>();

  const { categories, loading: categoryLoading } = useSelector(
    (state: RootState) => state.categories
  );

  const { brands, loading: brandLoading } = useSelector(
    (state: RootState) => state.brands
  );

  const { product, setProduct, nextStep } = useProductBuilder();

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Basic Info</h2>

      <input
        placeholder="Product Name"
        value={product.name}
        onChange={(e) => setProduct("name", e.target.value)}
        className="border p-2 w-full"
      />

      <textarea
        placeholder="Description"
        value={product.description}
        onChange={(e) => setProduct("description", e.target.value)}
        className="border p-2 w-full"
      />

      {/* ✅ OEM NUMBER */}
      <input
        placeholder="OEM Number"
        value={product.oemNumber || ""}
        onChange={(e) => setProduct("oemNumber", e.target.value)}
        className="border p-2 w-full"
      />

      {/* ✅ ACTIVE */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={product.isActive ?? true}
          onChange={(e) => setProduct("isActive", e.target.checked)}
        />
        Active Product
      </label>

      {/* BRAND */}
      <select
        value={product.brandId}
        onChange={(e) => setProduct("brandId", e.target.value)}
        className="border p-2 w-full"
      >
        <option value="">
          {brandLoading ? "Loading brands..." : "Select Brand"}
        </option>
        {brands.map((b: any) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      {/* CATEGORY */}
      <select
        value={product.categoryId}
        onChange={(e) => setProduct("categoryId", e.target.value)}
        className="border p-2 w-full"
      >
        <option value="">
          {categoryLoading ? "Loading categories..." : "Select Category"}
        </option>
        {categories.map((c: any) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <button
        onClick={nextStep}
        disabled={!product.name || !product.brandId || !product.categoryId}
        className="bg-green-600 text-white px-4 py-2 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}