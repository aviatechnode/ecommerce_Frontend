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
  const [showJson, setShowJson] = useState(false);

  const payload = buildProductPayload(state);

  const isValid =
    payload.name &&
    payload.brandId &&
    payload.categoryId;

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!isValid) {
      setError("Missing required fields (name, brand, category)");
      return;
    }

    try {
      setLoading(true);

      await dispatch(createProduct(payload)).unwrap();

      setSuccess("✅ Product created successfully");

      reset();
    } catch (err: any) {
      setError(err?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24"> {/* padding for fixed footer */}

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold">Review Product</h2>
        <p className="text-sm text-gray-500">
          Confirm details before creating
        </p>
      </div>

      {/* ALERTS */}
      {success && (
        <div className="bg-green-50 border text-green-700 p-3 rounded">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      {/* SUMMARY */}
      <div className="bg-gray-50 border rounded p-4 text-sm space-y-1">
        <div><b>Name:</b> {payload.name}</div>
        <div><b>Variants:</b> {payload.variants?.length || 0}</div>
        <div><b>Images:</b> {payload.medias?.length || 0}</div>
      </div>

      {/* JSON */}
      <button
        onClick={() => setShowJson(!showJson)}
        className="text-sm text-green-700 underline"
      >
        {showJson ? "Hide JSON" : "Show JSON"}
      </button>

      {showJson && (
        <pre className="bg-gray-100 p-3 text-xs rounded max-h-80 overflow-auto">
          {JSON.stringify(payload, null, 2)}
        </pre>
      )}

      {/* FIXED ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between">

        <button
          onClick={prevStep}
          disabled={loading}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Back
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading || !isValid}
          className="px-6 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Product"}
        </button>
      </div>
    </div>
  );
}