// src/admin/components/steps/StepVariants.tsx
import { useProductBuilder } from "../store/productBuilderStore";

export default function StepVariants() {
  const {
    variants,
    addVariant,
    updateVariant,
    removeVariant,
    nextStep,
    prevStep,
  } = useProductBuilder();

  return (
    <div className="space-y-4">
      <h2 className="font-bold">Variants</h2>

      <button onClick={addVariant}>+ Add Variant</button>

      {variants.map((v) => (
        <div key={v.id} className="border p-4 space-y-2">

          <input
            placeholder="Variant Name"
            value={v.name}
            onChange={(e) => updateVariant(v.id, "name", e.target.value)}
          />

          <input
            placeholder="SKU"
            value={v.sku}
            onChange={(e) => updateVariant(v.id, "sku", e.target.value)}
          />

          <input
            placeholder="Price"
            value={v.price}
            onChange={(e) => updateVariant(v.id, "price", e.target.value)}
          />

          {/* ✅ COST PRICE */}
          <input
            placeholder="Cost Price"
            value={v.costPrice || ""}
            onChange={(e) =>
              updateVariant(v.id, "costPrice", e.target.value)
            }
          />

          {/* ✅ DIMENSIONS */}
          <input
            placeholder="Weight"
            value={v.weight || ""}
            onChange={(e) => updateVariant(v.id, "weight", e.target.value)}
          />

          <input
            placeholder="Length"
            value={v.length || ""}
            onChange={(e) => updateVariant(v.id, "length", e.target.value)}
          />

          <input
            placeholder="Width"
            value={v.width || ""}
            onChange={(e) => updateVariant(v.id, "width", e.target.value)}
          />

          <input
            placeholder="Height"
            value={v.height || ""}
            onChange={(e) => updateVariant(v.id, "height", e.target.value)}
          />

          <button onClick={() => removeVariant(v.id)}>Remove</button>
        </div>
      ))}

      <div className="flex justify-between">
        <button onClick={prevStep}>Back</button>
        <button onClick={nextStep} className="bg-green-600 text-white px-4 py-2">
          Next
        </button>
      </div>
    </div>
  );
}