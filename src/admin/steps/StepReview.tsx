// src/admin/components/steps/StepReview.tsx
import { useDispatch } from "react-redux";
import { createProduct } from "../state-management/productSlice";
import { useProductBuilder } from "../store/productBuilderStore";
import { buildProductPayload } from "../payloads/buildProductPayload";

export default function StepReview() {
  const dispatch = useDispatch();
  const state = useProductBuilder();

  const { prevStep, reset } = useProductBuilder();

  const handleSubmit = async () => {
    const fd = buildProductPayload(state);

    try {
      await dispatch(createProduct(fd) as any);
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Review</h2>

      <pre className="bg-gray-100 p-3 text-sm">
        {JSON.stringify(state, null, 2)}
      </pre>

      <div className="flex justify-between">
        <button onClick={prevStep}>Back</button>

        <button
          onClick={handleSubmit}
          className="bg-green-700 text-white px-4 py-2"
        >
          Create Product
        </button>
      </div>
    </div>
  );
}