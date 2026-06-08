// steps/StepFitments.tsx
import { memo } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { X, Plus, Car, CheckCircle2, AlertCircle, Globe } from "lucide-react";

import type { CreateProductFormValues } from "./util/formProvider";
import type { StepProps } from "./util/stepProps";

interface StepFitmentsProps extends StepProps {}

// Helper: returns which ID fields to show based on level
function getVisibleIdFields(level: string): string[] {
  switch (level) {
    case "MAKE":
      return ["makeId"];
    case "MODEL":
      return ["makeId", "modelId"];
    case "GENERATION":
      return ["makeId", "modelId", "generationId"];
    case "ENGINE":
      return ["makeId", "modelId", "generationId", "engineId"];
    case "TRIM":
      return ["makeId", "modelId", "generationId", "engineId", "trimId"];
    default:
      return ["makeId"];
  }
}

function StepFitmentsComponent({ nextStep, prevStep }: StepFitmentsProps) {
  const { control, watch, register } = useFormContext<CreateProductFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "productFitments",
  });

  const fitments = watch("productFitments") || [];

  const completedFitments = fitments.filter(
    (f) => f.isUniversal || (f.trimId || f.makeId)
  ).length;

  const completionPercentage =
    fields.length === 0
      ? 0
      : Math.min(100, Math.round((completedFitments / fields.length) * 100));

  const addFitment = () => {
    append({
      level: "MAKE",
      makeId: "",
      modelId: "",
      generationId: "",
      engineId: "",
      trimId: "",
      yearStart: undefined,
      yearEnd: undefined,
      notes: "",
      position: "",
      quantityRequired: 1,
      isUniversal: false,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER with progress */}
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              🔧 Product Fitments
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Define which vehicles, trims, or engines this product fits
            </p>
          </div>
          <div className="w-full lg:w-72">
            <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
              <span>Completion</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* MAIN CONTENT - FITMENT RULES */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              {/* Header with Add button */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Fitment Rules
                  </h2>
                  <p className="text-sm text-gray-500">
                    Add one or more compatibility rules
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addFitment}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:scale-105 hover:shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  Add Fitment
                </button>
              </div>

              {/* Empty state */}
              {fields.length === 0 && (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <Car className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-700">
                    No fitments added yet
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Specify which vehicles this product fits
                  </p>
                  <button
                    type="button"
                    onClick={addFitment}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add your first fitment
                  </button>
                </div>
              )}

              {/* Fitment cards */}
              {fields.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {fields.map((field, idx) => {
                    const isUniversal = watch(`productFitments.${idx}.isUniversal`);
                    const currentLevel = watch(`productFitments.${idx}.level`) || "MAKE";
                    const visibleFields = getVisibleIdFields(currentLevel);

                    return (
                      <div
                        key={field.id}
                        className="p-5 transition hover:bg-gray-50/50"
                      >
                        <div className="space-y-4">
                          {/* Header row: universal + remove */}
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                {...register(`productFitments.${idx}.isUniversal`)}
                                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <Globe className="h-4 w-4 text-gray-500" />
                              <span>Universal fitment</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => remove(idx)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-red-500 transition hover:bg-red-50 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                              Remove
                            </button>
                          </div>

                          {!isUniversal ? (
                            <>
                              {/* Level selector */}
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">
                                  Fitment level
                                </label>
                                <select
                                  {...register(`productFitments.${idx}.level`)}
                                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500 md:w-64"
                                >
                                  <option value="MAKE">Make</option>
                                  <option value="MODEL">Model</option>
                                  <option value="GENERATION">Generation</option>
                                  <option value="ENGINE">Engine</option>
                                  <option value="TRIM">Trim</option>
                                </select>
                              </div>

                              {/* Dynamic ID fields based on level */}
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {visibleFields.includes("makeId") && (
                                  <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">
                                      Make ID
                                    </label>
                                    <input
                                      placeholder="e.g., 123"
                                      {...register(`productFitments.${idx}.makeId`)}
                                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                  </div>
                                )}
                                {visibleFields.includes("modelId") && (
                                  <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">
                                      Model ID
                                    </label>
                                    <input
                                      placeholder="e.g., 456"
                                      {...register(`productFitments.${idx}.modelId`)}
                                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                  </div>
                                )}
                                {visibleFields.includes("generationId") && (
                                  <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">
                                      Generation ID
                                    </label>
                                    <input
                                      placeholder="e.g., 789"
                                      {...register(`productFitments.${idx}.generationId`)}
                                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                  </div>
                                )}
                                {visibleFields.includes("engineId") && (
                                  <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">
                                      Engine ID
                                    </label>
                                    <input
                                      placeholder="e.g., 1011"
                                      {...register(`productFitments.${idx}.engineId`)}
                                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                  </div>
                                )}
                                {visibleFields.includes("trimId") && (
                                  <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">
                                      Trim ID
                                    </label>
                                    <input
                                      placeholder="e.g., 1213"
                                      {...register(`productFitments.${idx}.trimId`)}
                                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Year range */}
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-gray-500">
                                    Year start
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="e.g., 2010"
                                    {...register(`productFitments.${idx}.yearStart`, {
                                      valueAsNumber: true,
                                    })}
                                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-gray-500">
                                    Year end
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="e.g., 2020"
                                    {...register(`productFitments.${idx}.yearEnd`, {
                                      valueAsNumber: true,
                                    })}
                                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                                  />
                                </div>
                              </div>
                            </>
                          ) : (
                            // Universal fitment – simplified fields
                            <div className="rounded-lg bg-gray-50 p-4">
                              <p className="text-sm text-gray-600 mb-3">
                                Universal products fit any vehicle. Add optional notes and quantity.
                              </p>
                            </div>
                          )}

                          {/* Position, Quantity, Notes (always visible) */}
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-500">
                                Position (optional)
                              </label>
                              <input
                                placeholder="e.g., Front Left"
                                {...register(`productFitments.${idx}.position`)}
                                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-500">
                                Quantity required
                              </label>
                              <input
                                type="number"
                                min="1"
                                {...register(`productFitments.${idx}.quantityRequired`, {
                                  valueAsNumber: true,
                                })}
                                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-500">
                                Notes (optional)
                              </label>
                              <input
                                placeholder="Any special instructions"
                                {...register(`productFitments.${idx}.notes`)}
                                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="border-t border-gray-200 bg-gray-50 px-5 py-3 text-xs text-gray-500">
                    {fields.length} fitment rule{fields.length !== 1 ? "s" : ""} added
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR – Status & Tips */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <h3 className="font-semibold text-gray-900">Fitment Status</h3>
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total rules</span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {fields.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    {completedFitments}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-200">
                  <div
                    className="h-1.5 rounded-full bg-green-500 transition-all"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <h3 className="font-semibold text-gray-900">Checklist</h3>
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-center gap-2">
                  {fields.length > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-gray-300" />
                  )}
                  <span className="text-sm text-gray-600">
                    At least one fitment rule
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {completedFitments > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-gray-300" />
                  )}
                  <span className="text-sm text-gray-600">
                    Valid fitment (universal or make/trim ID)
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Pro Tip</p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-700">
                    Use universal fitment for accessories that work on any vehicle.
                    For part‑specific compatibility, select the appropriate level (Make,
                    Model, etc.) and fill the required IDs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION BUTTONS */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={prevStep}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            ← Back to Specifications
          </button>
          <button
            type="button"
            onClick={nextStep}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:shadow-md"
          >
            Continue to Inventory →
          </button>
        </div>
      </div>
    </div>
  );
}

const StepFitments = memo(StepFitmentsComponent);
export default StepFitments;