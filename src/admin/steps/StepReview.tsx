import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store/store";
import { createProduct } from "../state-management/productSlice";
import { useProductBuilder } from "../store/productBuilderStore";
import { buildProductPayload } from "../payloads/buildProductPayload";
import { useState } from "react";

export default function StepReview() {
  const dispatch = useDispatch<AppDispatch>();

  const state = useProductBuilder();
  const { prevStep, reset } = state;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(true);

  const payload = buildProductPayload(state);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!payload.name || !payload.brandId || !payload.categoryId) {
      setError("Please complete required product information before submitting.");
      return;
    }

    try {
      setLoading(true);

      await dispatch(createProduct(payload)).unwrap();

      setSuccess("Product created successfully 🎉");

      reset();

      // optional: auto-clear success after a few seconds
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Review Product
        </h2>
        <p className="text-sm text-gray-500">
          Confirm everything before creating the product
        </p>
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* SUMMARY */}
      <div className="border rounded-lg p-4 bg-gray-50 space-y-2 text-sm">
        <div><b>Name:</b> {payload.name}</div>
        <div><b>Brand:</b> {payload.brandId}</div>
        <div><b>Category:</b> {payload.categoryId}</div>
        <div><b>Variants:</b> {payload.variants?.length || 0}</div>
        <div><b>Images:</b> {payload.medias?.length || 0}</div>
      </div>

      {/* JSON TOGGLE */}
      <button
        onClick={() => setShowJson(!showJson)}
        className="text-sm text-green-700 underline"
      >
        {showJson ? "Hide JSON payload" : "Show JSON payload"}
      </button>

      {showJson && (
        <pre className="bg-gray-100 p-3 text-xs overflow-auto max-h-96 rounded-lg">
          {JSON.stringify(payload, null, 2)}
        </pre>
      )}

      {/* ACTIONS */}
      <div className="flex justify-between pt-2">
        <button
          onClick={prevStep}
          disabled={loading}
          className="px-4 py-2 bg-gray-200 rounded-lg"
        >
          Back
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-green-700 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? "Creating Product..." : "Create Product"}
        </button>
      </div>
    </div>
  );
}