import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWarehouses } from "../state-management/warehouseSlice";
import type { RootState, AppDispatch } from "../store/store";
import { useProductBuilder } from "../store/productBuilderStore";

export default function StepInventory() {
  const dispatch = useDispatch<AppDispatch>();

  const { warehouses, loading, fetched } = useSelector(
    (state: RootState) => state.warehouses
  );

  const { variants, updateVariant, nextStep, prevStep } =
    useProductBuilder();

  useEffect(() => {
    if (!fetched && !loading) {
      dispatch(fetchWarehouses());
    }
  }, [dispatch, fetched, loading]);

  // convert safe numbers
  const toNumber = (value: string) => {
    if (value === "") return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  };

  const updateInventory = (
    variantId: string,
    index: number,
    field: string,
    value: any
  ) => {
    const variant = variants.find((v) => v.id === variantId);
    if (!variant) return;

    const inventories = [...(variant.inventories || [])];

    inventories[index] = {
      ...(inventories[index] || {
        warehouseId: "",
        stock: 0,
        reserved: 0,
        threshold: 0,
      }),
      [field]: value,
    };

    updateVariant(variantId, "inventories", inventories);
  };

  const addInventoryRow = (variantId: string) => {
    const variant = variants.find((v) => v.id === variantId);
    if (!variant) return;

    updateVariant(variantId, "inventories", [
      ...(variant.inventories || []),
      {
        warehouseId: "",
        stock: 0,
        reserved: 0,
        threshold: 0,
      },
    ]);
  };

  const removeInventoryRow = (variantId: string, index: number) => {
    const variant = variants.find((v) => v.id === variantId);
    if (!variant) return;

    const inventories = [...(variant.inventories || [])];
    inventories.splice(index, 1);

    updateVariant(variantId, "inventories", inventories);
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Inventory
        </h2>
        <p className="text-sm text-gray-500">
          Set stock levels for each warehouse per variant
        </p>
      </div>

      {/* VARIANTS */}
      <div className="space-y-6">
        {variants.map((v) => (
          <div
            key={v.id}
            className="border rounded-xl p-5 bg-white shadow-sm space-y-4"
          >

            {/* VARIANT HEADER */}
            <div>
              <h3 className="font-semibold text-gray-800">
                {v.name || "Unnamed Variant"}
              </h3>
              <p className="text-xs text-gray-400">
                SKU: {v.sku || "N/A"}
              </p>
            </div>

            {/* EMPTY STATE */}
            {(!v.inventories || v.inventories.length === 0) && (
              <div className="text-center text-sm text-gray-500 border rounded-lg p-4 bg-gray-50">
                No warehouse stock added yet
              </div>
            )}

            {/* INVENTORY ROWS */}
            {(v.inventories || []).map((inv, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 bg-gray-50 space-y-4 relative"
              >

                {/* REMOVE */}
                <button
                  onClick={() => removeInventoryRow(v.id, index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>

                {/* WAREHOUSE */}
                <div>
                  <label className="text-xs text-gray-500">
                    Warehouse
                  </label>

                  <select
                    value={inv.warehouseId}
                    onChange={(e) =>
                      updateInventory(
                        v.id,
                        index,
                        "warehouseId",
                        e.target.value
                      )
                    }
                    className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select warehouse</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* NUMBERS */}
                <div className="grid grid-cols-3 gap-3">

                  <div>
                    <label className="text-xs text-gray-500">Stock</label>
                    <input
                      inputMode="numeric"
                      placeholder="0"
                      value={inv.stock ?? ""}
                      onChange={(e) =>
                        updateInventory(
                          v.id,
                          index,
                          "stock",
                          toNumber(e.target.value) ?? 0
                        )
                      }
                      className="border rounded-lg p-2 w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Reserved</label>
                    <input
                      inputMode="numeric"
                      placeholder="0"
                      value={inv.reserved ?? ""}
                      onChange={(e) =>
                        updateInventory(
                          v.id,
                          index,
                          "reserved",
                          toNumber(e.target.value) ?? 0
                        )
                      }
                      className="border rounded-lg p-2 w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">
                      Alert Level
                    </label>
                    <input
                      inputMode="numeric"
                      placeholder="0"
                      value={inv.threshold ?? ""}
                      onChange={(e) =>
                        updateInventory(
                          v.id,
                          index,
                          "threshold",
                          toNumber(e.target.value) ?? 0
                        )
                      }
                      className="border rounded-lg p-2 w-full"
                    />
                  </div>

                </div>
              </div>
            ))}

            {/* ADD BUTTON */}
            <button
              onClick={() => addInventoryRow(v.id)}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              + Add warehouse stock
            </button>
          </div>
        ))}
      </div>

      {/* NAVIGATION */}
      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={prevStep}
          className="px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Back
        </button>

        <button
          onClick={nextStep}
          className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
}