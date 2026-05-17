import { memo } from "react";

import {
  useFormContext,
  useFieldArray,
} from "react-hook-form";

import {
  useGetWarehousesQuery,
} from "../../services/warehouseApi";

import type {
  CreateProductInput,
} from "../../schemas/product.schema";

import type { ProductVariant } from "../../admin/store/productBuilderStore";
import type { StepProps } from "./util/stepProps";


/* =========================================================
   COMPONENT PROPS
========================================================= */

interface StepInventoryProps extends StepProps {}

/* =========================================================
   COMPONENT
========================================================= */

function StepInventoryComponent({
  nextStep,
  prevStep,
}: StepInventoryProps) {
  /* ---------------------------------------------------------
     REACT HOOK FORM
  --------------------------------------------------------- */

  const {
    control,
    watch,
    register,
    setValue,
  } =
    useFormContext<CreateProductInput>();

  const {
    fields: variants,
  } = useFieldArray<
    CreateProductInput,
    "variants"
  >({
    control,
    name: "variants",
  });

  /* ---------------------------------------------------------
     API
  --------------------------------------------------------- */

  const {
    data: warehouses = [],
    isLoading,
  } =
    useGetWarehousesQuery();

  /* ---------------------------------------------------------
     ADD INVENTORY
  --------------------------------------------------------- */

  const addInventoryRow = (
    variantIndex: number
  ) => {
    const currentInventories =
      watch(
        `variants.${variantIndex}.inventories`
      ) ?? [];

    setValue(
      `variants.${variantIndex}.inventories`,
      [
        ...currentInventories,

        {
          warehouseId: "",
          stock: 0,
          reserved: 0,
          threshold: 0,
        },
      ],
      {
        shouldDirty: true,
      }
    );
  };

  /* ---------------------------------------------------------
     REMOVE INVENTORY
  --------------------------------------------------------- */

  const removeInventoryRow = (
    variantIndex: number,
    inventoryIndex: number
  ) => {
    const currentInventories =
      watch(
        `variants.${variantIndex}.inventories`
      ) ?? [];

    setValue(
      `variants.${variantIndex}.inventories`,
      currentInventories.filter(
        (_, i) =>
          i !== inventoryIndex
      ),
      {
        shouldDirty: true,
      }
    );
  };

  /* ---------------------------------------------------------
     AVAILABLE STOCK
  --------------------------------------------------------- */

  const getAvailableStock = (
    variantIndex: number,
    inventoryIndex: number
  ) => {
    const stock =
      Number(
        watch(
          `variants.${variantIndex}.inventories.${inventoryIndex}.stock`
        ) ?? 0
      );

    const reserved =
      Number(
        watch(
          `variants.${variantIndex}.inventories.${inventoryIndex}.reserved`
        ) ?? 0
      );

    return Math.max(
      0,
      stock - reserved
    );
  };

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* HEADER */}

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            📦 Inventory Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Set stock levels for
            each warehouse per
            variant
          </p>
        </div>

        {/* VARIANTS */}

        <div className="space-y-6">
          {variants.length ===
            0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <p className="text-gray-400">
                No variants created
                yet
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Go back to add
                product variants
                first
              </p>
            </div>
          )}

          {variants.map(
            (
              variant,
              variantIndex
            ) => {
              const inventories =
                watch(
                  `variants.${variantIndex}.inventories`
                ) ?? [];

              const currentVariant =
                watch(
                  `variants.${variantIndex}`
                ) as ProductVariant;

              return (
                <div
                  key={
                    variant.id
                  }
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-all"
                >
                  {/* HEADER */}

                  <div className="border-b border-gray-200 bg-linear-to-r from-gray-50 to-white px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {currentVariant?.name ||
                        "Unnamed Variant"}
                    </h3>

                    <p className="mt-1 font-mono text-sm text-gray-500">
                      SKU:{" "}
                      {currentVariant?.sku ||
                        "N/A"}
                    </p>
                  </div>

                  {/* CONTENT */}

                  <div className="space-y-4 p-6">
                    {/* EMPTY */}

                    {inventories.length ===
                      0 && (
                      <div className="rounded-lg bg-amber-50 p-6 text-center">
                        <p className="text-sm text-amber-700">
                          🏚️ No
                          warehouse
                          stock added
                          yet
                        </p>

                        <p className="mt-1 text-xs text-amber-600">
                          Click the
                          button below
                          to add
                          inventory
                          for this
                          variant
                        </p>
                      </div>
                    )}

                    {/* INVENTORIES */}

                    {inventories.map(
                      (
                        _,
                        inventoryIndex
                      ) => (
                        <div
                          key={
                            inventoryIndex
                          }
                          className="group relative rounded-xl border border-gray-200 bg-gray-50/50 p-5 transition-all hover:border-gray-300 hover:shadow-sm"
                        >
                          {/* REMOVE */}

                          <button
                            type="button"
                            onClick={() =>
                              removeInventoryRow(
                                variantIndex,
                                inventoryIndex
                              )
                            }
                            className="absolute right-3 top-3 rounded-md p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Remove warehouse stock"
                          >
                            ✕
                          </button>

                          <div className="space-y-4">
                            {/* WAREHOUSE */}

                            <div>
                              <label className="mb-1 block text-sm font-medium text-gray-700">
                                Warehouse
                              </label>

                              <select
                                {...register(
                                  `variants.${variantIndex}.inventories.${inventoryIndex}.warehouseId`
                                )}
                                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                              >
                                <option value="">
                                  {isLoading
                                    ? "Loading warehouses..."
                                    : "Select warehouse"}
                                </option>

                                {warehouses.map(
                                  (
                                    warehouse: {
                                      id: string;
                                      name: string;
                                    }
                                  ) => (
                                    <option
                                      key={
                                        warehouse.id
                                      }
                                      value={
                                        warehouse.id
                                      }
                                    >
                                      {
                                        warehouse.name
                                      }
                                    </option>
                                  )
                                )}
                              </select>
                            </div>

                            {/* GRID */}

                            <div className="grid gap-4 sm:grid-cols-3">
                              {/* STOCK */}

                              <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                  Stock
                                  Quantity
                                </label>

                                <input
                                  type="number"
                                  placeholder="0"
                                  {...register(
                                    `variants.${variantIndex}.inventories.${inventoryIndex}.stock`,
                                    {
                                      valueAsNumber:
                                        true,
                                    }
                                  )}
                                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                                />
                              </div>

                              {/* RESERVED */}

                              <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                  Reserved
                                  Stock
                                </label>

                                <input
                                  type="number"
                                  placeholder="0"
                                  {...register(
                                    `variants.${variantIndex}.inventories.${inventoryIndex}.reserved`,
                                    {
                                      valueAsNumber:
                                        true,
                                    }
                                  )}
                                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                                />
                              </div>

                              {/* THRESHOLD */}

                              <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                  Low Stock
                                  Threshold
                                </label>

                                <input
                                  type="number"
                                  placeholder="Alert at"
                                  {...register(
                                    `variants.${variantIndex}.inventories.${inventoryIndex}.threshold`,
                                    {
                                      valueAsNumber:
                                        true,
                                    }
                                  )}
                                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                                />
                              </div>
                            </div>

                            {/* AVAILABLE */}

                            <div className="rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-700">
                              Available
                              for sale:{" "}
                              <span className="font-semibold">
                                {getAvailableStock(
                                  variantIndex,
                                  inventoryIndex
                                )}
                              </span>{" "}
                              units
                            </div>
                          </div>
                        </div>
                      )
                    )}

                    {/* ADD */}

                    <button
                      type="button"
                      onClick={() =>
                        addInventoryRow(
                          variantIndex
                        )
                      }
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-3 font-medium text-gray-600 transition-all hover:border-green-400 hover:bg-green-50 hover:text-green-700"
                    >
                      + Add warehouse
                      stock
                    </button>
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* NAVIGATION */}

        <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={prevStep}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-2.5 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={nextStep}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 px-6 py-2.5 font-semibold text-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

const StepInventory =
  memo(
    StepInventoryComponent
  );

export default StepInventory;