// src/admin/components/steps/StepInventory.tsx
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

  return (
    <div className="space-y-4">
      <h2>Inventory</h2>

      {variants.map((v) => (
        <div key={v.id} className="border p-3 space-y-2">
          <h3>{v.name}</h3>

          <select
            onChange={(e) =>
              updateVariant(v.id, "inventories", [
                {
                  warehouseId: e.target.value,
                  stock: 0,
                  threshold: 0,
                },
              ])
            }
          >
            <option>Select warehouse</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          {/* ✅ STOCK */}
          <input
            placeholder="Stock"
            onChange={(e) =>
              updateVariant(v.id, "inventories", [
                {
                  ...v.inventories?.[0],
                  stock: Number(e.target.value),
                },
              ])
            }
          />

          {/* ✅ THRESHOLD */}
          <input
            placeholder="Threshold"
            onChange={(e) =>
              updateVariant(v.id, "inventories", [
                {
                  ...v.inventories?.[0],
                  threshold: Number(e.target.value),
                },
              ])
            }
          />
        </div>
      ))}

      <div className="flex justify-between">
        <button onClick={prevStep}>Back</button>
        <button onClick={nextStep}>Next</button>
      </div>
    </div>
  );
}