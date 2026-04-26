import { useProductBuilder } from "../store/productBuilderStore";

export default function StepSpecifications() {
  const { specifications, addSpec, updateSpec, removeSpec, nextStep, prevStep } =
    useProductBuilder();

  return (
    <div className="space-y-4">
      <h2>Specifications</h2>

      <button onClick={addSpec}>+ Add Spec</button>

      {specifications.map((s, i) => (
        <div key={i} className="flex gap-2">
          <input
            placeholder="Name"
            value={s.name}
            onChange={(e) => updateSpec(i, "name", e.target.value)}
          />

          <input
            placeholder="Value"
            value={s.value}
            onChange={(e) => updateSpec(i, "value", e.target.value)}
          />

          <button onClick={() => removeSpec(i)}>X</button>
        </div>
      ))}

      <div className="flex justify-between">
        <button onClick={prevStep}>Back</button>
        <button onClick={nextStep}>Next</button>
      </div>
    </div>
  );
}