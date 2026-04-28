import { useProductBuilder } from "../store/productBuilderStore";
import { X } from "lucide-react";

export default function StepSpecifications() {
  const {
    specifications,
    addSpec,
    updateSpec,
    removeSpec,
    nextStep,
    prevStep,
  } = useProductBuilder();

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Product Specifications
          </h2>
          <p className="text-sm text-gray-500">
            Define technical details like size, material, and performance
          </p>
        </div>

        <button
          onClick={addSpec}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
        >
          + Add Spec
        </button>
      </div>

      {/* EMPTY STATE */}
      {specifications.length === 0 && (
        <div className="border rounded-xl p-8 text-center text-gray-500 bg-gray-50">
          <p className="font-medium">No specifications added yet</p>
          <p className="text-sm">Click “Add Spec” to define product details</p>
        </div>
      )}

      {/* SPEC LIST */}
      <div className="space-y-4">
        {specifications.map((s, i) => (
          <div
            key={i}
            className="flex gap-3 items-center border rounded-xl p-4 bg-white shadow-sm"
          >
            {/* NAME */}
            <input
              placeholder="Name (e.g. Material)"
              value={s.name ?? ""}
              onChange={(e) => updateSpec(i, "name", e.target.value)}
              className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-green-500"
            />

            {/* VALUE */}
            <input
              placeholder="Value (e.g. Aluminium)"
              value={s.value ?? ""}
              onChange={(e) => updateSpec(i, "value", e.target.value)}
              className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-green-500"
            />

            {/* REMOVE */}
            <button
              onClick={() => removeSpec(i)}
              className="p-2 rounded-md text-red-500 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* NAVIGATION */}
      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={prevStep}
          className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          Back
        </button>

        <button
          onClick={nextStep}
          className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow"
        >
          Next
        </button>
      </div>
    </div>
  );
}