// ProductBuilder.tsx
import { useProductBuilder } from "../store/productBuilderStore";
import StepBasic from "../steps/StepBasic";
import StepVariants from "../steps/StepVariants";
import StepInventory from "../steps/StepInventory";
import StepMedia from "../steps/StepMedia";
import StepReview from "../steps/StepReview";

export default function ProductBuilder() {
  const step = useProductBuilder((s) => s.step);

  return (
    <div className="space-y-6">
      {step === 1 && <StepBasic />}
      {step === 2 && <StepVariants />}
      {step === 3 && <StepInventory />}
      {step === 4 && <StepMedia />}
      {step === 5 && <StepReview />}
    </div>
  );
}