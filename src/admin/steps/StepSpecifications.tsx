import { memo } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { X, Plus, Settings, Tag, FileText, CheckCircle2, AlertCircle } from "lucide-react";

import type { CreateProductInput } from "../../schemas/product.schema";
import type { StepProps } from "./util/stepProps";

/* =========================================================
   COMPONENT PROPS
========================================================= */
interface StepSpecificationsProps extends StepProps {}

/* =========================================================
   COMPONENT
========================================================= */
function StepSpecificationsComponent({ nextStep, prevStep }: StepSpecificationsProps) {
  /* ---------------------------------------------------------
     React Hook Form
  --------------------------------------------------------- */
  const { control, watch } = useFormContext<CreateProductInput>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "specifications",
  });

  const specifications = watch("specifications") || [];

  /* ---------------------------------------------------------
     Computed stats
  --------------------------------------------------------- */
  const completedSpecs = specifications.filter(
    (s) => s?.name?.trim() && s?.value?.trim()
  ).length;

  const completionPercentage =
    specifications.length === 0
      ? 0
      : Math.min(100, Math.round((completedSpecs / specifications.length) * 100));

  /* ---------------------------------------------------------
     Handlers
  --------------------------------------------------------- */
  const addSpecification = () => {
    append({ name: "", value: "" });
  };

  /* ---------------------------------------------------------
     Render
  --------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              📋 Product Specifications
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Define technical details like size, material, and performance metrics
            </p>
          </div>

          {/* Progress */}
          <div className="w-full lg:w-72">
            <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
              <span>Completion</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-linear-to-r from-green-500 to-green-600 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid gap-6 xl:grid-cols-3">
          {/* MAIN CONTENT */}
          <div className="space-y-6 xl:col-span-2">
            {/* SPECIFICATIONS CARD */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
              {/* HEADER */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Specifications</h2>
                  <p className="text-sm text-gray-500">Add product technical information</p>
                </div>
                <button
                  type="button"
                  onClick={addSpecification}
                  className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Specification
                </button>
              </div>

              {/* EMPTY STATE */}
              {fields.length === 0 && (
                <div className="p-12 text-center">
                  <div className="mb-4 inline-flex rounded-full bg-gray-100 p-4">
                    <Settings className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-700">No specifications added yet</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Add technical details like dimensions, materials, or performance specs
                  </p>
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add your first specification
                  </button>
                </div>
              )}

              {/* TABLE */}
              {fields.length > 0 && (
                <>
                  {/* TABLE HEADER */}
                  <div className="hidden border-b border-gray-200 bg-gray-50 px-6 py-3 sm:grid sm:grid-cols-12">
                    <div className="col-span-5 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Specification Name
                      </span>
                    </div>
                    <div className="col-span-6 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Value
                      </span>
                    </div>
                    <div className="col-span-1 text-right">
                      <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </span>
                    </div>
                  </div>

                  {/* ROWS */}
                  <div className="divide-y divide-gray-100">
                    {fields.map((field, index) => (
                      <div key={field.id} className="group p-4 transition hover:bg-gray-50 sm:p-5">
                        <div className="flex flex-col gap-3 sm:grid sm:grid-cols-12 sm:items-center sm:gap-4">
                          {/* NAME */}
                          <div className="sm:col-span-5">
                            <label className="mb-1 block text-xs font-medium text-gray-500 sm:hidden">
                              Specification Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., Material, Weight, Dimensions"
                              {...control.register(`specifications.${index}.name`)}
                              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                            />
                          </div>

                          {/* VALUE */}
                          <div className="sm:col-span-6">
                            <label className="mb-1 block text-xs font-medium text-gray-500 sm:hidden">
                              Value
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., Aluminum, 2.5kg, 10x20x5cm"
                              {...control.register(`specifications.${index}.value`)}
                              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                            />
                          </div>

                          {/* REMOVE */}
                          <div className="sm:col-span-1 sm:text-right">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="inline-flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 hover:text-red-700 sm:w-auto"
                              title="Remove specification"
                            >
                              <X className="h-4 w-4" />
                              <span className="sm:hidden">Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* FOOTER */}
                  <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
                    <p className="text-xs text-gray-500">
                      {fields.length} specification{fields.length !== 1 ? "s" : ""} added
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* SUGGESTIONS */}
            {fields.length > 0 && fields.length < 5 && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 text-sm font-medium text-blue-900">💡 Suggested Specifications</h4>
                <div className="flex flex-wrap gap-2">
                  {["Material", "Dimensions", "Weight", "Color", "Warranty", "Compatibility"].map(
                    (suggestion) => {
                      const exists = specifications.some((s) => s?.name === suggestion);
                      return (
                        <button
                          key={suggestion}
                          type="button"
                          disabled={exists}
                          onClick={() => {
                            if (!exists) {
                              append({ name: suggestion, value: "" });
                            }
                          }}
                          className="rounded-full bg-white px-3 py-1 text-xs text-blue-700 shadow-sm transition hover:bg-blue-100 disabled:opacity-50"
                        >
                          + {suggestion}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* STATUS CARD */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="font-semibold text-gray-900">Specification Status</h3>
              </div>
              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Specifications</span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                    {fields.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    {completedSpecs}
                  </span>
                </div>
              </div>
            </div>

            {/* REQUIREMENTS */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="font-semibold text-gray-900">Checklist</h3>
              </div>
              <div className="space-y-3 p-6">
                <div className="flex items-center gap-2">
                  {fields.length > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-gray-300" />
                  )}
                  <span className="text-sm text-gray-600">At least one specification</span>
                </div>
                <div className="flex items-center gap-2">
                  {completedSpecs > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-gray-300" />
                  )}
                  <span className="text-sm text-gray-600">Completed specification</span>
                </div>
              </div>
            </div>

            {/* QUICK TIPS */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Pro Tip</p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-700">
                    Products with detailed specifications perform better in search results and
                    improve customer confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={prevStep}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-2.5 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            ← Back to Variants
          </button>
          <button
            type="button"
            onClick={nextStep}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 px-6 py-2.5 font-semibold text-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Continue to Inventory →
          </button>
        </div>
      </div>
    </div>
  );
}

const StepSpecifications = memo(StepSpecificationsComponent);
export default StepSpecifications;