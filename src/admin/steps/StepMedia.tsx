// src/admin/components/steps/StepMedia.tsx
import { useProductBuilder } from "../store/productBuilderStore";

export default function StepMedia() {
  const { images, setImages, nextStep, prevStep } =
    useProductBuilder();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Media</h2>

      <input
        type="file"
        multiple
        onChange={(e) =>
          setImages(Array.from(e.target.files || []))
        }
      />

      {/* Preview */}
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, i) => (
          <img
            key={i}
            src={URL.createObjectURL(img)}
            className="h-24 object-cover"
          />
        ))}
      </div>

      <div className="flex justify-between">
        <button onClick={prevStep}>Back</button>

        <button
          onClick={nextStep}
          className="bg-green-600 text-white px-4 py-2"
        >
          Next
        </button>
      </div>
    </div>
  );
}