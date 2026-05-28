import { useState, useMemo, useEffect } from "react";
import {
  useCreateMakeMutation,
  useCreateModelMutation,
  useCreateGenerationMutation,
  useCreateEngineMutation,
  useCreateTrimMutation,
  useAssignProductFitmentMutation,
  useBulkAssignProductFitmentMutation,
  useGetProductsByFitmentQuery,
  useGetVehicleTreeQuery,
  useDeleteMakeMutation,
  useDeleteModelMutation,
  useDeleteGenerationMutation,
  useDeleteEngineMutation,
  useDeleteTrimMutation,
  useUpdateMakeMutation,
  useUpdateModelMutation,
  useUpdateGenerationMutation,
  useUpdateEngineMutation,
  useUpdateTrimMutation,
} from "../../services/fitmentApi";

import type {
  FitmentLevel,
  VehicleMake,
} from "../../types/fitment.types";

/** Small loading spinner */
const Spinner = () => (
  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
);

/** Modal base component */
const Modal = ({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

// ============================================================
// Main Component
// ============================================================
const AdminFitments = () => {
  // --------------------- Queries ---------------------------
  const {
    data: vehicleTree,
    isLoading: treeLoading,
    refetch: refetchTree,
  } = useGetVehicleTreeQuery();

  // --------------------- Mutations (Create) -----------------
  const [createMake, { isLoading: creatingMake }] = useCreateMakeMutation();
  const [createModel, { isLoading: creatingModel }] = useCreateModelMutation();
  const [createGeneration, { isLoading: creatingGeneration }] =
    useCreateGenerationMutation();
  const [createEngine, { isLoading: creatingEngine }] = useCreateEngineMutation();
  const [createTrim, { isLoading: creatingTrim }] = useCreateTrimMutation();
  const [assignFitment, { isLoading: assigningSingle }] =
    useAssignProductFitmentMutation();
  const [bulkAssignFitment, { isLoading: assigningBulk }] =
    useBulkAssignProductFitmentMutation();

  // --------------------- Mutations (Delete) -----------------
  const [deleteMake] = useDeleteMakeMutation();
  const [deleteModel] = useDeleteModelMutation();
  const [deleteGeneration] = useDeleteGenerationMutation();
  const [deleteEngine] = useDeleteEngineMutation();
  const [deleteTrim] = useDeleteTrimMutation();

  // --------------------- Mutations (Update) -----------------
  const [updateMake] = useUpdateMakeMutation();
  const [updateModel] = useUpdateModelMutation();
  const [updateGeneration] = useUpdateGenerationMutation();
  const [updateEngine] = useUpdateEngineMutation();
  const [updateTrim] = useUpdateTrimMutation();

  // --------------------- UI State --------------------------
  const [activeModal, setActiveModal] = useState<
    | "make"
    | "model"
    | "generation"
    | "engine"
    | "trim"
    | "assignSingle"
    | "assignBulk"
    | null
  >(null);

  // State for editing (when user clicks ✏️)
  const [editingItem, setEditingItem] = useState<{
    type: "make" | "model" | "generation" | "engine" | "trim";
    id: string;
    data: any;
  } | null>(null);

  // Form state for creation modals
  const [makeForm, setMakeForm] = useState({ name: "", slug: "", isActive: true });
  const [modelForm, setModelForm] = useState({
    makeId: "",
    name: "",
    slug: "",
    isActive: true,
  });
  const [genForm, setGenForm] = useState({
    modelId: "",
    name: "",
    slug: "",
    chassisCode: "",
    yearStart: new Date().getFullYear(),
    yearEnd: "",
    isActive: true,
  });
  const [engineForm, setEngineForm] = useState({
    generationId: "",
    engineCode: "",
    engineName: "",
    fuelType: "",
    aspiration: "",
    cylinders: "",
    horsepower: "",
    displacementCc: "",
    displacementLabel: "",
    drivetrain: "",
    transmissionType: "",
    isActive: true,
  });
  const [trimForm, setTrimForm] = useState({
    engineId: "",
    name: "",
    bodyType: "",
    doors: "",
    isActive: true,
  });

  // Form state for single assignment
  const [singleAssign, setSingleAssign] = useState({
    productId: "",
    level: "TRIM" as FitmentLevel,
    makeId: "",
    modelId: "",
    generationId: "",
    engineId: "",
    trimId: "",
    yearStart: "",
    yearEnd: "",
    notes: "",
    position: "",
    quantityRequired: "",
    isUniversal: false,
  });

  // Form state for bulk assignment
  const [bulkAssign, setBulkAssign] = useState({
    productId: "",
    trimIds: "",
    notes: "",
    position: "",
    quantityRequired: "",
  });

  // Search with actual values instead of IDs
  const [searchTerms, setSearchTerms] = useState({
    makeName: "",
    modelName: "",
    generationName: "",
    engineCode: "",
    trimName: "",
    year: "",
  });

  // Populate edit forms when editingItem changes
  useEffect(() => {
    if (!editingItem) return;
    const { type, data } = editingItem;
    switch (type) {
      case "make":
        setMakeForm({ name: data.name, slug: data.slug || "", isActive: data.isActive });
        break;
      case "model":
        setModelForm({
          makeId: data.makeId,
          name: data.name,
          slug: data.slug || "",
          isActive: data.isActive,
        });
        break;
      case "generation":
        setGenForm({
          modelId: data.modelId,
          name: data.name,
          slug: data.slug || "",
          chassisCode: data.chassisCode || "",
          yearStart: data.yearStart,
          yearEnd: data.yearEnd?.toString() || "",
          isActive: data.isActive,
        });
        break;
      case "engine":
        setEngineForm({
          generationId: data.generationId,
          engineCode: data.engineCode,
          engineName: data.engineName || "",
          fuelType: data.fuelType || "",
          aspiration: data.aspiration || "",
          cylinders: data.cylinders?.toString() || "",
          horsepower: data.horsepower?.toString() || "",
          displacementCc: data.displacementCc?.toString() || "",
          displacementLabel: data.displacementLabel || "",
          drivetrain: data.drivetrain || "",
          transmissionType: data.transmissionType || "",
          isActive: data.isActive,
        });
        break;
      case "trim":
        setTrimForm({
          engineId: data.engineId,
          name: data.name,
          bodyType: data.bodyType || "",
          doors: data.doors?.toString() || "",
          isActive: data.isActive,
        });
        break;
    }
  }, [editingItem]);

  // Helper functions to find IDs from names (unchanged)
  const findMakeIdByName = (makeName: string): string | undefined => {
    const make = vehicleTree?.find(m =>
      m.name.toLowerCase().includes(makeName.toLowerCase())
    );
    return make?.id;
  };

  const findModelIdByName = (makeName: string, modelName: string): string | undefined => {
    const make = vehicleTree?.find(m =>
      m.name.toLowerCase().includes(makeName.toLowerCase())
    );
    const model = make?.models?.find(m =>
      m.name.toLowerCase().includes(modelName.toLowerCase())
    );
    return model?.id;
  };

  const findGenerationIdByName = (makeName: string, modelName: string, generationName: string): string | undefined => {
    const make = vehicleTree?.find(m =>
      m.name.toLowerCase().includes(makeName.toLowerCase())
    );
    const model = make?.models?.find(m =>
      m.name.toLowerCase().includes(modelName.toLowerCase())
    );
    const generation = model?.generations?.find(g =>
      g.name.toLowerCase().includes(generationName.toLowerCase())
    );
    return generation?.id;
  };

  const findEngineIdByCode = (makeName: string, modelName: string, generationName: string, engineCode: string): string | undefined => {
    const make = vehicleTree?.find(m =>
      m.name.toLowerCase().includes(makeName.toLowerCase())
    );
    const model = make?.models?.find(m =>
      m.name.toLowerCase().includes(modelName.toLowerCase())
    );
    const generation = model?.generations?.find(g =>
      g.name.toLowerCase().includes(generationName.toLowerCase())
    );
    const engine = generation?.engines?.find(e =>
      e.engineCode.toLowerCase().includes(engineCode.toLowerCase())
    );
    return engine?.id;
  };

  const findTrimIdByName = (makeName: string, modelName: string, generationName: string, engineCode: string, trimName: string): string | undefined => {
    const make = vehicleTree?.find(m =>
      m.name.toLowerCase().includes(makeName.toLowerCase())
    );
    const model = make?.models?.find(m =>
      m.name.toLowerCase().includes(modelName.toLowerCase())
    );
    const generation = model?.generations?.find(g =>
      g.name.toLowerCase().includes(generationName.toLowerCase())
    );
    const engine = generation?.engines?.find(e =>
      e.engineCode.toLowerCase().includes(engineCode.toLowerCase())
    );
    const trim = engine?.trims?.find(t =>
      t.name.toLowerCase().includes(trimName.toLowerCase())
    );
    return trim?.id;
  };

  // Convert search terms to IDs for the API query
  const searchParams = useMemo(() => {
    let makeId, modelId, generationId, engineId, trimId;

    if (searchTerms.makeName) {
      makeId = findMakeIdByName(searchTerms.makeName);

      if (searchTerms.modelName && makeId) {
        modelId = findModelIdByName(searchTerms.makeName, searchTerms.modelName);

        if (searchTerms.generationName && modelId) {
          generationId = findGenerationIdByName(searchTerms.makeName, searchTerms.modelName, searchTerms.generationName);

          if (searchTerms.engineCode && generationId) {
            engineId = findEngineIdByCode(searchTerms.makeName, searchTerms.modelName, searchTerms.generationName, searchTerms.engineCode);

            if (searchTerms.trimName && engineId) {
              trimId = findTrimIdByName(searchTerms.makeName, searchTerms.modelName, searchTerms.generationName, searchTerms.engineCode, searchTerms.trimName);
            }
          }
        }
      }
    }

    return {
      makeId,
      modelId,
      generationId,
      engineId,
      trimId,
      year: searchTerms.year ? parseInt(searchTerms.year, 10) : undefined,
    };
  }, [searchTerms, vehicleTree]);

  const shouldSkipSearch = !searchTerms.makeName &&
    !searchTerms.modelName &&
    !searchTerms.generationName &&
    !searchTerms.engineCode &&
    !searchTerms.trimName &&
    !searchTerms.year;

  const {
    data: searchedProducts,
    isFetching: searchingProducts,
    refetch: searchProducts,
  } = useGetProductsByFitmentQuery(
    {
      makeId: searchParams.makeId,
      modelId: searchParams.modelId,
      generationId: searchParams.generationId,
      engineId: searchParams.engineId,
      trimId: searchParams.trimId,
      year: searchParams.year,
    },
    { skip: shouldSkipSearch }
  );

  // --------------------- Handlers --------------------------
  const closeModal = () => setActiveModal(null);
  const closeEditModal = () => setEditingItem(null);

  // Delete handler with confirmation
  const handleDelete = async (type: string, id: string, name: string) => {
    if (!confirm(`Delete ${type} "${name}"? This will also delete all children items.`)) return;
    try {
      switch (type) {
        case "make":
          await deleteMake(id).unwrap();
          break;
        case "model":
          await deleteModel(id).unwrap();
          break;
        case "generation":
          await deleteGeneration(id).unwrap();
          break;
        case "engine":
          await deleteEngine(id).unwrap();
          break;
        case "trim":
          await deleteTrim(id).unwrap();
          break;
      }
      refetchTree();
    } catch (err) {
      console.error(err);
      alert(`Failed to delete ${type}`);
    }
  };

  // Open edit modal with current data
  const handleEdit = (type: string, id: string, data: any) => {
    setEditingItem({ type: type as any, id, data });
  };

  // Update submission
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      switch (editingItem.type) {
        case "make":
          await updateMake({
            id: editingItem.id,
            data: {
              name: makeForm.name,
              slug: makeForm.slug || undefined,
              isActive: makeForm.isActive,
            },
          }).unwrap();
          break;
        case "model":
          await updateModel({
            id: editingItem.id,
            data: {
              makeId: modelForm.makeId,
              name: modelForm.name,
              slug: modelForm.slug || undefined,
              isActive: modelForm.isActive,
            },
          }).unwrap();
          break;
        case "generation":
          await updateGeneration({
            id: editingItem.id,
            data: {
              modelId: genForm.modelId,
              name: genForm.name,
              slug: genForm.slug || undefined,
              chassisCode: genForm.chassisCode || undefined,
              yearStart: genForm.yearStart,
              yearEnd: genForm.yearEnd ? parseInt(genForm.yearEnd) : undefined,
              isActive: genForm.isActive,
            },
          }).unwrap();
          break;
        case "engine":
          await updateEngine({
            id: editingItem.id,
            data: {
              generationId: engineForm.generationId,
              engineCode: engineForm.engineCode,
              engineName: engineForm.engineName || undefined,
              fuelType: engineForm.fuelType || undefined,
              aspiration: engineForm.aspiration || undefined,
              cylinders: engineForm.cylinders ? parseInt(engineForm.cylinders) : undefined,
              horsepower: engineForm.horsepower ? parseInt(engineForm.horsepower) : undefined,
              displacementCc: engineForm.displacementCc ? parseInt(engineForm.displacementCc) : undefined,
              displacementLabel: engineForm.displacementLabel || undefined,
              drivetrain: engineForm.drivetrain || undefined,
              transmissionType: engineForm.transmissionType || undefined,
              isActive: engineForm.isActive,
            },
          }).unwrap();
          break;
        case "trim":
          await updateTrim({
            id: editingItem.id,
            data: {
              engineId: trimForm.engineId,
              name: trimForm.name,
              bodyType: trimForm.bodyType || undefined,
              doors: trimForm.doors ? parseInt(trimForm.doors) : undefined,
              isActive: trimForm.isActive,
            },
          }).unwrap();
          break;
      }
      refetchTree();
      closeEditModal();
      // Reset forms to defaults (optional)
      setMakeForm({ name: "", slug: "", isActive: true });
      setModelForm({ makeId: "", name: "", slug: "", isActive: true });
      setGenForm({
        modelId: "",
        name: "",
        slug: "",
        chassisCode: "",
        yearStart: new Date().getFullYear(),
        yearEnd: "",
        isActive: true,
      });
      setEngineForm({
        generationId: "",
        engineCode: "",
        engineName: "",
        fuelType: "",
        aspiration: "",
        cylinders: "",
        horsepower: "",
        displacementCc: "",
        displacementLabel: "",
        drivetrain: "",
        transmissionType: "",
        isActive: true,
      });
      setTrimForm({
        engineId: "",
        name: "",
        bodyType: "",
        doors: "",
        isActive: true,
      });
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  // Create handlers (unchanged)
  const handleCreateMake = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMake(makeForm).unwrap();
      refetchTree();
      closeModal();
      setMakeForm({ name: "", slug: "", isActive: true });
    } catch (err) {
      console.error(err);
      alert("Failed to create make");
    }
  };

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createModel(modelForm).unwrap();
      refetchTree();
      closeModal();
      setModelForm({ makeId: "", name: "", slug: "", isActive: true });
    } catch (err) {
      console.error(err);
      alert("Failed to create model");
    }
  };

  const handleCreateGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGeneration({
        ...genForm,
        yearEnd: genForm.yearEnd ? parseInt(genForm.yearEnd) : undefined,
      }).unwrap();
      refetchTree();
      closeModal();
      setGenForm({
        modelId: "",
        name: "",
        slug: "",
        chassisCode: "",
        yearStart: new Date().getFullYear(),
        yearEnd: "",
        isActive: true,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create generation");
    }
  };

  const handleCreateEngine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEngine({
        ...engineForm,
        cylinders: engineForm.cylinders ? parseInt(engineForm.cylinders) : undefined,
        horsepower: engineForm.horsepower ? parseInt(engineForm.horsepower) : undefined,
        displacementCc: engineForm.displacementCc
          ? parseInt(engineForm.displacementCc)
          : undefined,
      }).unwrap();
      refetchTree();
      closeModal();
      setEngineForm({
        generationId: "",
        engineCode: "",
        engineName: "",
        fuelType: "",
        aspiration: "",
        cylinders: "",
        horsepower: "",
        displacementCc: "",
        displacementLabel: "",
        drivetrain: "",
        transmissionType: "",
        isActive: true,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create engine");
    }
  };

  const handleCreateTrim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTrim({
        ...trimForm,
        doors: trimForm.doors ? parseInt(trimForm.doors) : undefined,
      }).unwrap();
      refetchTree();
      closeModal();
      setTrimForm({
        engineId: "",
        name: "",
        bodyType: "",
        doors: "",
        isActive: true,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create trim");
    }
  };

  const handleSingleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assignFitment({
        productId: singleAssign.productId,
        level: singleAssign.level,
        makeId: singleAssign.makeId || undefined,
        modelId: singleAssign.modelId || undefined,
        generationId: singleAssign.generationId || undefined,
        engineId: singleAssign.engineId || undefined,
        trimId: singleAssign.trimId || undefined,
        yearStart: singleAssign.yearStart ? parseInt(singleAssign.yearStart) : undefined,
        yearEnd: singleAssign.yearEnd ? parseInt(singleAssign.yearEnd) : undefined,
        notes: singleAssign.notes || undefined,
        position: singleAssign.position || undefined,
        quantityRequired: singleAssign.quantityRequired
          ? parseInt(singleAssign.quantityRequired)
          : undefined,
        isUniversal: singleAssign.isUniversal,
      }).unwrap();
      alert("Fitment assigned successfully");
      closeModal();
      setSingleAssign({
        productId: "",
        level: "TRIM",
        makeId: "",
        modelId: "",
        generationId: "",
        engineId: "",
        trimId: "",
        yearStart: "",
        yearEnd: "",
        notes: "",
        position: "",
        quantityRequired: "",
        isUniversal: false,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to assign fitment");
    }
  };

  const handleBulkAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimIdsArray = bulkAssign.trimIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    if (trimIdsArray.length === 0) {
      alert("Please enter at least one Trim ID");
      return;
    }
    try {
      await bulkAssignFitment({
        productId: bulkAssign.productId,
        trimIds: trimIdsArray,
        notes: bulkAssign.notes || undefined,
        position: bulkAssign.position || undefined,
        quantityRequired: bulkAssign.quantityRequired
          ? parseInt(bulkAssign.quantityRequired)
          : undefined,
      }).unwrap();
      alert("Bulk fitments assigned successfully");
      closeModal();
      setBulkAssign({ productId: "", trimIds: "", notes: "", position: "", quantityRequired: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to assign bulk fitments");
    }
  };

  // --------------------- Render Tree (with edit/delete) -----------------
  const renderTree = (makes: VehicleMake[]) => (
    <div className="space-y-4">
      {makes.map((make) => (
        <div key={make.id} className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">{make.name}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit("make", make.id, make)}
                className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-700 hover:bg-yellow-200"
                title="Edit Make"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete("make", make.id, make.name)}
                className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
                title="Delete Make"
              >
                🗑️
              </button>
              <button
                onClick={() => {
                  setModelForm({ ...modelForm, makeId: make.id });
                  setActiveModal("model");
                }}
                className="rounded bg-green-100 px-3 py-1 text-sm text-green-700 hover:bg-green-200"
              >
                + Model
              </button>
            </div>
          </div>
          <div className="ml-4 mt-3 space-y-3">
            {make.models?.map((model) => (
              <div key={model.id} className="border-l-2 border-gray-200 pl-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-700">{model.name}</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit("model", model.id, model)}
                      className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700"
                      title="Edit Model"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete("model", model.id, model.name)}
                      className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700"
                      title="Delete Model"
                    >
                      🗑️
                    </button>
                    <button
                      onClick={() => {
                        setGenForm({ ...genForm, modelId: model.id });
                        setActiveModal("generation");
                      }}
                      className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
                    >
                      + Generation
                    </button>
                  </div>
                </div>
                <div className="ml-4 mt-2 space-y-2">
                  {model.generations?.map((gen) => (
                    <div key={gen.id} className="text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>
                          {gen.name} ({gen.yearStart}
                          {gen.yearEnd ? `-${gen.yearEnd}` : ""})
                          {gen.chassisCode && ` [${gen.chassisCode}]`}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit("generation", gen.id, gen)}
                            className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700"
                            title="Edit Generation"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete("generation", gen.id, gen.name)}
                            className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700"
                            title="Delete Generation"
                          >
                            🗑️
                          </button>
                          <button
                            onClick={() => {
                              setEngineForm({ ...engineForm, generationId: gen.id });
                              setActiveModal("engine");
                            }}
                            className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700"
                          >
                            + Engine
                          </button>
                        </div>
                      </div>
                      <div className="ml-4 mt-1 space-y-1">
                        {gen.engines?.map((eng) => (
                          <div key={eng.id} className="text-xs text-gray-500">
                            <div className="flex items-center justify-between">
                              <span>
                                {eng.engineCode} {eng.engineName && `- ${eng.engineName}`}
                                {eng.displacementLabel && ` (${eng.displacementLabel})`}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit("engine", eng.id, eng)}
                                  className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700"
                                  title="Edit Engine"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDelete("engine", eng.id, eng.engineCode)}
                                  className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700"
                                  title="Delete Engine"
                                >
                                  🗑️
                                </button>
                                <button
                                  onClick={() => {
                                    setTrimForm({ ...trimForm, engineId: eng.id });
                                    setActiveModal("trim");
                                  }}
                                  className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700"
                                >
                                  + Trim
                                </button>
                              </div>
                            </div>
                            <div className="ml-4">
                              {eng.trims?.map((trim) => (
                                <div key={trim.id} className="flex items-center justify-between text-gray-400">
                                  <span>
                                    {trim.name} {trim.bodyType && `(${trim.bodyType})`}
                                  </span>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleEdit("trim", trim.id, trim)}
                                      className="rounded bg-yellow-100 px-1 py-0.5 text-xs text-yellow-700"
                                      title="Edit Trim"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDelete("trim", trim.id, trim.name)}
                                      className="rounded bg-red-100 px-1 py-0.5 text-xs text-red-700"
                                      title="Delete Trim"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // --------------------- JSX -------------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🚗 Fitment Manager
            </h1>
            <p className="text-sm text-gray-500">
              Manage vehicle makes, models, generations, engines, trims and product fitments.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveModal("make")}
              className="rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-green-700"
            >
              + New Make
            </button>
            <button
              onClick={() => setActiveModal("assignSingle")}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
            >
              🔗 Single Assign
            </button>
            <button
              onClick={() => setActiveModal("assignBulk")}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
            >
              📦 Bulk Assign
            </button>
          </div>
        </div>

        {/* Vehicle Tree */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Vehicle Hierarchy</h2>
            <button
              onClick={() => refetchTree()}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              🔄 Refresh
            </button>
          </div>
          {treeLoading ? (
            <div className="flex justify-center py-12">
              <Spinner /> <span className="ml-2">Loading vehicle tree...</span>
            </div>
          ) : vehicleTree && vehicleTree.length > 0 ? (
            renderTree(vehicleTree)
          ) : (
            <div className="py-12 text-center text-gray-500">
              No vehicles found. Click "New Make" to start.
            </div>
          )}
        </div>

        {/* Search Products by Fitment */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">🔍 Find Products by Vehicle</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <input
                type="text"
                placeholder="Make name (e.g., Toyota)"
                value={searchTerms.makeName}
                onChange={(e) =>
                  setSearchTerms((p) => ({ ...p, makeName: e.target.value, modelName: "", generationName: "", engineCode: "", trimName: "" }))
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                list="make-suggestions"
              />
              <datalist id="make-suggestions">
                {vehicleTree?.map(make => (
                  <option key={make.id} value={make.name} />
                ))}
              </datalist>

              <input
                type="text"
                placeholder="Model name"
                value={searchTerms.modelName}
                disabled={!searchTerms.makeName}
                onChange={(e) =>
                  setSearchTerms((p) => ({ ...p, modelName: e.target.value, generationName: "", engineCode: "", trimName: "" }))
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
                list="model-suggestions"
              />
              <datalist id="model-suggestions">
                {searchTerms.makeName && vehicleTree
                  ?.find(m => m.name.toLowerCase().includes(searchTerms.makeName.toLowerCase()))
                  ?.models?.map(model => (
                    <option key={model.id} value={model.name} />
                  ))}
              </datalist>

              <input
                type="text"
                placeholder="Generation name"
                value={searchTerms.generationName}
                disabled={!searchTerms.modelName}
                onChange={(e) =>
                  setSearchTerms((p) => ({ ...p, generationName: e.target.value, engineCode: "", trimName: "" }))
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
                list="generation-suggestions"
              />
              <datalist id="generation-suggestions">
                {searchTerms.makeName && searchTerms.modelName && vehicleTree
                  ?.find(m => m.name.toLowerCase().includes(searchTerms.makeName.toLowerCase()))
                  ?.models?.find(m => m.name.toLowerCase().includes(searchTerms.modelName.toLowerCase()))
                  ?.generations?.map(gen => (
                    <option key={gen.id} value={gen.name} />
                  ))}
              </datalist>

              <input
                type="text"
                placeholder="Engine code (e.g., 2JZ-GTE)"
                value={searchTerms.engineCode}
                disabled={!searchTerms.generationName}
                onChange={(e) =>
                  setSearchTerms((p) => ({ ...p, engineCode: e.target.value, trimName: "" }))
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
                list="engine-suggestions"
              />
              <datalist id="engine-suggestions">
                {searchTerms.makeName && searchTerms.modelName && searchTerms.generationName && vehicleTree
                  ?.find(m => m.name.toLowerCase().includes(searchTerms.makeName.toLowerCase()))
                  ?.models?.find(m => m.name.toLowerCase().includes(searchTerms.modelName.toLowerCase()))
                  ?.generations?.find(g => g.name.toLowerCase().includes(searchTerms.generationName.toLowerCase()))
                  ?.engines?.map(engine => (
                    <option key={engine.id} value={engine.engineCode} />
                  ))}
              </datalist>

              <input
                type="text"
                placeholder="Trim name"
                value={searchTerms.trimName}
                disabled={!searchTerms.engineCode}
                onChange={(e) =>
                  setSearchTerms((p) => ({ ...p, trimName: e.target.value }))
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
                list="trim-suggestions"
              />
              <datalist id="trim-suggestions">
                {searchTerms.makeName && searchTerms.modelName && searchTerms.generationName && searchTerms.engineCode && vehicleTree
                  ?.find(m => m.name.toLowerCase().includes(searchTerms.makeName.toLowerCase()))
                  ?.models?.find(m => m.name.toLowerCase().includes(searchTerms.modelName.toLowerCase()))
                  ?.generations?.find(g => g.name.toLowerCase().includes(searchTerms.generationName.toLowerCase()))
                  ?.engines?.find(e => e.engineCode.toLowerCase().includes(searchTerms.engineCode.toLowerCase()))
                  ?.trims?.map(trim => (
                    <option key={trim.id} value={trim.name} />
                  ))}
              </datalist>

              <input
                type="number"
                placeholder="Year"
                value={searchTerms.year}
                onChange={(e) =>
                  setSearchTerms((p) => ({ ...p, year: e.target.value }))
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            {(searchTerms.makeName || searchTerms.modelName || searchTerms.generationName ||
              searchTerms.engineCode || searchTerms.trimName) && (
              <div className="rounded-lg bg-blue-50 p-3 text-sm">
                <p className="font-semibold text-blue-900">Selected Vehicle:</p>
                <p className="text-blue-800">
                  {searchTerms.makeName && <span>Make: {searchTerms.makeName}</span>}
                  {searchTerms.modelName && <span> → Model: {searchTerms.modelName}</span>}
                  {searchTerms.generationName && <span> → Generation: {searchTerms.generationName}</span>}
                  {searchTerms.engineCode && <span> → Engine: {searchTerms.engineCode}</span>}
                  {searchTerms.trimName && <span> → Trim: {searchTerms.trimName}</span>}
                  {searchTerms.year && <span> → Year: {searchTerms.year}</span>}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={searchProducts}
                disabled={shouldSkipSearch}
                className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50"
              >
                Search Products
              </button>
              <button
                onClick={() => setSearchTerms({ makeName: "", modelName: "", generationName: "", engineCode: "", trimName: "", year: "" })}
                className="rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="mt-4">
            {searchingProducts && <Spinner />}
            {searchedProducts && searchedProducts.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Found {searchedProducts.length} product(s):
                </p>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {searchedProducts.map((p: any) => (
                    <div key={p.id} className="rounded bg-gray-50 p-2 text-sm">
                      <span className="font-mono text-xs">{p.id}</span> –{" "}
                      {p.name || "Unnamed product"}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {searchedProducts && searchedProducts.length === 0 && !shouldSkipSearch && (
              <div className="mt-3 text-sm text-gray-500">
                No products match this fitment.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- CREATE MODALS (unchanged) ---------- */}
      {/* Create Make */}
      {activeModal === "make" && (
        <Modal title="Create New Make" onClose={closeModal}>
          <form onSubmit={handleCreateMake} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Name *</label>
              <input
                type="text"
                required
                value={makeForm.name}
                onChange={(e) => setMakeForm({ ...makeForm, name: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Slug</label>
              <input
                type="text"
                value={makeForm.slug}
                onChange={(e) => setMakeForm({ ...makeForm, slug: e.target.value })}
                className="mt-1 w-full rounded border p-2"
                placeholder="auto-generated if empty"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={makeForm.isActive}
                onChange={(e) => setMakeForm({ ...makeForm, isActive: e.target.checked })}
              />
              <label>Active</label>
            </div>
            <button
              type="submit"
              disabled={creatingMake}
              className="w-full rounded bg-green-600 py-2 text-white disabled:opacity-50"
            >
              {creatingMake ? <Spinner /> : "Create Make"}
            </button>
          </form>
        </Modal>
      )}

      {/* Create Model */}
      {activeModal === "model" && (
        <Modal title="Create New Model" onClose={closeModal}>
          <form onSubmit={handleCreateModel} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Make ID *</label>
              <input
                type="text"
                required
                value={modelForm.makeId}
                onChange={(e) => setModelForm({ ...modelForm, makeId: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Name *</label>
              <input
                type="text"
                required
                value={modelForm.name}
                onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Slug</label>
              <input
                type="text"
                value={modelForm.slug}
                onChange={(e) => setModelForm({ ...modelForm, slug: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={modelForm.isActive}
                onChange={(e) => setModelForm({ ...modelForm, isActive: e.target.checked })}
              />
              <label>Active</label>
            </div>
            <button
              type="submit"
              disabled={creatingModel}
              className="w-full rounded bg-green-600 py-2 text-white disabled:opacity-50"
            >
              {creatingModel ? <Spinner /> : "Create Model"}
            </button>
          </form>
        </Modal>
      )}

      {/* Create Generation */}
      {activeModal === "generation" && (
        <Modal title="Create Generation" onClose={closeModal}>
          <form onSubmit={handleCreateGeneration} className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium">Model ID *</label>
              <input
                type="text"
                required
                value={genForm.modelId}
                onChange={(e) => setGenForm({ ...genForm, modelId: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Name *</label>
              <input
                type="text"
                required
                value={genForm.name}
                onChange={(e) => setGenForm({ ...genForm, name: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Slug</label>
              <input
                type="text"
                value={genForm.slug}
                onChange={(e) => setGenForm({ ...genForm, slug: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Chassis Code</label>
              <input
                type="text"
                value={genForm.chassisCode}
                onChange={(e) => setGenForm({ ...genForm, chassisCode: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Year Start *</label>
              <input
                type="number"
                required
                value={genForm.yearStart}
                onChange={(e) => setGenForm({ ...genForm, yearStart: parseInt(e.target.value) })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Year End</label>
              <input
                type="number"
                value={genForm.yearEnd}
                onChange={(e) => setGenForm({ ...genForm, yearEnd: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={genForm.isActive}
                onChange={(e) => setGenForm({ ...genForm, isActive: e.target.checked })}
              />
              <label>Active</label>
            </div>
            <button
              type="submit"
              disabled={creatingGeneration}
              className="w-full rounded bg-green-600 py-2 text-white disabled:opacity-50"
            >
              {creatingGeneration ? <Spinner /> : "Create Generation"}
            </button>
          </form>
        </Modal>
      )}

      {/* Create Engine */}
      {activeModal === "engine" && (
        <Modal title="Create Engine" onClose={closeModal}>
          <form onSubmit={handleCreateEngine} className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium">Generation ID *</label>
              <input
                type="text"
                required
                value={engineForm.generationId}
                onChange={(e) => setEngineForm({ ...engineForm, generationId: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Engine Code *</label>
              <input
                type="text"
                required
                value={engineForm.engineCode}
                onChange={(e) => setEngineForm({ ...engineForm, engineCode: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Engine Name</label>
              <input
                type="text"
                value={engineForm.engineName}
                onChange={(e) => setEngineForm({ ...engineForm, engineName: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Fuel Type</label>
              <input
                type="text"
                value={engineForm.fuelType}
                onChange={(e) => setEngineForm({ ...engineForm, fuelType: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Aspiration</label>
              <input
                type="text"
                value={engineForm.aspiration}
                onChange={(e) => setEngineForm({ ...engineForm, aspiration: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Cylinders</label>
              <input
                type="number"
                value={engineForm.cylinders}
                onChange={(e) => setEngineForm({ ...engineForm, cylinders: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Horsepower</label>
              <input
                type="number"
                value={engineForm.horsepower}
                onChange={(e) => setEngineForm({ ...engineForm, horsepower: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Displacement (cc)</label>
              <input
                type="number"
                value={engineForm.displacementCc}
                onChange={(e) => setEngineForm({ ...engineForm, displacementCc: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Displacement Label</label>
              <input
                type="text"
                value={engineForm.displacementLabel}
                onChange={(e) =>
                  setEngineForm({ ...engineForm, displacementLabel: e.target.value })
                }
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Drivetrain</label>
              <input
                type="text"
                value={engineForm.drivetrain}
                onChange={(e) => setEngineForm({ ...engineForm, drivetrain: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Transmission Type</label>
              <input
                type="text"
                value={engineForm.transmissionType}
                onChange={(e) =>
                  setEngineForm({ ...engineForm, transmissionType: e.target.value })
                }
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={engineForm.isActive}
                onChange={(e) => setEngineForm({ ...engineForm, isActive: e.target.checked })}
              />
              <label>Active</label>
            </div>
            <button
              type="submit"
              disabled={creatingEngine}
              className="w-full rounded bg-green-600 py-2 text-white disabled:opacity-50"
            >
              {creatingEngine ? <Spinner /> : "Create Engine"}
            </button>
          </form>
        </Modal>
      )}

      {/* Create Trim */}
      {activeModal === "trim" && (
        <Modal title="Create Trim" onClose={closeModal}>
          <form onSubmit={handleCreateTrim} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Engine ID *</label>
              <input
                type="text"
                required
                value={trimForm.engineId}
                onChange={(e) => setTrimForm({ ...trimForm, engineId: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Name *</label>
              <input
                type="text"
                required
                value={trimForm.name}
                onChange={(e) => setTrimForm({ ...trimForm, name: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Body Type</label>
              <input
                type="text"
                value={trimForm.bodyType}
                onChange={(e) => setTrimForm({ ...trimForm, bodyType: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Doors</label>
              <input
                type="number"
                value={trimForm.doors}
                onChange={(e) => setTrimForm({ ...trimForm, doors: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={trimForm.isActive}
                onChange={(e) => setTrimForm({ ...trimForm, isActive: e.target.checked })}
              />
              <label>Active</label>
            </div>
            <button
              type="submit"
              disabled={creatingTrim}
              className="w-full rounded bg-green-600 py-2 text-white disabled:opacity-50"
            >
              {creatingTrim ? <Spinner /> : "Create Trim"}
            </button>
          </form>
        </Modal>
      )}

      {/* Single Assignment Modal */}
      {activeModal === "assignSingle" && (
        <Modal title="Assign Single Product Fitment" onClose={closeModal}>
          <form onSubmit={handleSingleAssign} className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium">Product ID *</label>
              <input
                type="text"
                required
                value={singleAssign.productId}
                onChange={(e) => setSingleAssign({ ...singleAssign, productId: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Fitment Level *</label>
              <select
                value={singleAssign.level}
                onChange={(e) =>
                  setSingleAssign({ ...singleAssign, level: e.target.value as FitmentLevel })
                }
                className="mt-1 w-full rounded border p-2"
              >
                <option value="MAKE">Make</option>
                <option value="MODEL">Model</option>
                <option value="GENERATION">Generation</option>
                <option value="ENGINE">Engine</option>
                <option value="TRIM">Trim</option>
              </select>
            </div>
            {(singleAssign.level === "MAKE" || singleAssign.level === "MODEL") && (
              <div>
                <label className="block text-sm font-medium">Make ID</label>
                <input
                  type="text"
                  value={singleAssign.makeId}
                  onChange={(e) => setSingleAssign({ ...singleAssign, makeId: e.target.value })}
                  className="mt-1 w-full rounded border p-2"
                />
              </div>
            )}
            {singleAssign.level === "MODEL" && (
              <div>
                <label className="block text-sm font-medium">Model ID</label>
                <input
                  type="text"
                  value={singleAssign.modelId}
                  onChange={(e) => setSingleAssign({ ...singleAssign, modelId: e.target.value })}
                  className="mt-1 w-full rounded border p-2"
                />
              </div>
            )}
            {(singleAssign.level === "GENERATION" ||
              singleAssign.level === "ENGINE" ||
              singleAssign.level === "TRIM") && (
              <>
                <div>
                  <label className="block text-sm font-medium">Generation ID</label>
                  <input
                    type="text"
                    value={singleAssign.generationId}
                    onChange={(e) =>
                      setSingleAssign({ ...singleAssign, generationId: e.target.value })
                    }
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
              </>
            )}
            {(singleAssign.level === "ENGINE" || singleAssign.level === "TRIM") && (
              <div>
                <label className="block text-sm font-medium">Engine ID</label>
                <input
                  type="text"
                  value={singleAssign.engineId}
                  onChange={(e) => setSingleAssign({ ...singleAssign, engineId: e.target.value })}
                  className="mt-1 w-full rounded border p-2"
                />
              </div>
            )}
            {singleAssign.level === "TRIM" && (
              <div>
                <label className="block text-sm font-medium">Trim ID</label>
                <input
                  type="text"
                  value={singleAssign.trimId}
                  onChange={(e) => setSingleAssign({ ...singleAssign, trimId: e.target.value })}
                  className="mt-1 w-full rounded border p-2"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium">Year Start</label>
              <input
                type="number"
                value={singleAssign.yearStart}
                onChange={(e) => setSingleAssign({ ...singleAssign, yearStart: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Year End</label>
              <input
                type="number"
                value={singleAssign.yearEnd}
                onChange={(e) => setSingleAssign({ ...singleAssign, yearEnd: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Notes</label>
              <textarea
                value={singleAssign.notes}
                onChange={(e) => setSingleAssign({ ...singleAssign, notes: e.target.value })}
                className="mt-1 w-full rounded border p-2"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Position</label>
              <input
                type="text"
                value={singleAssign.position}
                onChange={(e) => setSingleAssign({ ...singleAssign, position: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Quantity Required</label>
              <input
                type="number"
                value={singleAssign.quantityRequired}
                onChange={(e) =>
                  setSingleAssign({ ...singleAssign, quantityRequired: e.target.value })
                }
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={singleAssign.isUniversal}
                onChange={(e) =>
                  setSingleAssign({ ...singleAssign, isUniversal: e.target.checked })
                }
              />
              <label>Universal fitment</label>
            </div>
            <button
              type="submit"
              disabled={assigningSingle}
              className="w-full rounded bg-blue-600 py-2 text-white disabled:opacity-50"
            >
              {assigningSingle ? <Spinner /> : "Assign Fitment"}
            </button>
          </form>
        </Modal>
      )}

      {/* Bulk Assignment Modal */}
      {activeModal === "assignBulk" && (
        <Modal title="Bulk Assign Fitments (by Trim IDs)" onClose={closeModal}>
          <form onSubmit={handleBulkAssign} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Product ID *</label>
              <input
                type="text"
                required
                value={bulkAssign.productId}
                onChange={(e) => setBulkAssign({ ...bulkAssign, productId: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Trim IDs (comma separated) *
              </label>
              <textarea
                required
                value={bulkAssign.trimIds}
                onChange={(e) => setBulkAssign({ ...bulkAssign, trimIds: e.target.value })}
                placeholder="trim_123, trim_456, trim_789"
                className="mt-1 w-full rounded border p-2"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Notes</label>
              <input
                type="text"
                value={bulkAssign.notes}
                onChange={(e) => setBulkAssign({ ...bulkAssign, notes: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Position</label>
              <input
                type="text"
                value={bulkAssign.position}
                onChange={(e) => setBulkAssign({ ...bulkAssign, position: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Quantity Required</label>
              <input
                type="number"
                value={bulkAssign.quantityRequired}
                onChange={(e) => setBulkAssign({ ...bulkAssign, quantityRequired: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <button
              type="submit"
              disabled={assigningBulk}
              className="w-full rounded bg-indigo-600 py-2 text-white disabled:opacity-50"
            >
              {assigningBulk ? <Spinner /> : "Bulk Assign"}
            </button>
          </form>
        </Modal>
      )}

      {/* ---------- EDIT MODAL (reuses same forms) ---------- */}
      {editingItem && (
        <Modal title={`Edit ${editingItem.type.charAt(0).toUpperCase() + editingItem.type.slice(1)}`} onClose={closeEditModal}>
          <form onSubmit={handleUpdate} className="space-y-4 max-h-[70vh] overflow-y-auto">
            {editingItem.type === "make" && (
              <>
                <div>
                  <label className="block text-sm font-medium">Name *</label>
                  <input
                    type="text"
                    required
                    value={makeForm.name}
                    onChange={(e) => setMakeForm({ ...makeForm, name: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Slug</label>
                  <input
                    type="text"
                    value={makeForm.slug}
                    onChange={(e) => setMakeForm({ ...makeForm, slug: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={makeForm.isActive}
                    onChange={(e) => setMakeForm({ ...makeForm, isActive: e.target.checked })}
                  />
                  <label>Active</label>
                </div>
              </>
            )}

            {editingItem.type === "model" && (
              <>
                <div>
                  <label className="block text-sm font-medium">Make ID *</label>
                  <input
                    type="text"
                    required
                    value={modelForm.makeId}
                    onChange={(e) => setModelForm({ ...modelForm, makeId: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Name *</label>
                  <input
                    type="text"
                    required
                    value={modelForm.name}
                    onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Slug</label>
                  <input
                    type="text"
                    value={modelForm.slug}
                    onChange={(e) => setModelForm({ ...modelForm, slug: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={modelForm.isActive}
                    onChange={(e) => setModelForm({ ...modelForm, isActive: e.target.checked })}
                  />
                  <label>Active</label>
                </div>
              </>
            )}

            {editingItem.type === "generation" && (
              <>
                <div>
                  <label className="block text-sm font-medium">Model ID *</label>
                  <input
                    type="text"
                    required
                    value={genForm.modelId}
                    onChange={(e) => setGenForm({ ...genForm, modelId: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Name *</label>
                  <input
                    type="text"
                    required
                    value={genForm.name}
                    onChange={(e) => setGenForm({ ...genForm, name: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Slug</label>
                  <input
                    type="text"
                    value={genForm.slug}
                    onChange={(e) => setGenForm({ ...genForm, slug: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Chassis Code</label>
                  <input
                    type="text"
                    value={genForm.chassisCode}
                    onChange={(e) => setGenForm({ ...genForm, chassisCode: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Year Start *</label>
                  <input
                    type="number"
                    required
                    value={genForm.yearStart}
                    onChange={(e) => setGenForm({ ...genForm, yearStart: parseInt(e.target.value) })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Year End</label>
                  <input
                    type="number"
                    value={genForm.yearEnd}
                    onChange={(e) => setGenForm({ ...genForm, yearEnd: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={genForm.isActive}
                    onChange={(e) => setGenForm({ ...genForm, isActive: e.target.checked })}
                  />
                  <label>Active</label>
                </div>
              </>
            )}

            {editingItem.type === "engine" && (
              <>
                <div>
                  <label className="block text-sm font-medium">Generation ID *</label>
                  <input
                    type="text"
                    required
                    value={engineForm.generationId}
                    onChange={(e) => setEngineForm({ ...engineForm, generationId: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Engine Code *</label>
                  <input
                    type="text"
                    required
                    value={engineForm.engineCode}
                    onChange={(e) => setEngineForm({ ...engineForm, engineCode: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Engine Name</label>
                  <input
                    type="text"
                    value={engineForm.engineName}
                    onChange={(e) => setEngineForm({ ...engineForm, engineName: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Fuel Type</label>
                  <input
                    type="text"
                    value={engineForm.fuelType}
                    onChange={(e) => setEngineForm({ ...engineForm, fuelType: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Aspiration</label>
                  <input
                    type="text"
                    value={engineForm.aspiration}
                    onChange={(e) => setEngineForm({ ...engineForm, aspiration: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Cylinders</label>
                  <input
                    type="number"
                    value={engineForm.cylinders}
                    onChange={(e) => setEngineForm({ ...engineForm, cylinders: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Horsepower</label>
                  <input
                    type="number"
                    value={engineForm.horsepower}
                    onChange={(e) => setEngineForm({ ...engineForm, horsepower: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Displacement (cc)</label>
                  <input
                    type="number"
                    value={engineForm.displacementCc}
                    onChange={(e) => setEngineForm({ ...engineForm, displacementCc: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Displacement Label</label>
                  <input
                    type="text"
                    value={engineForm.displacementLabel}
                    onChange={(e) => setEngineForm({ ...engineForm, displacementLabel: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Drivetrain</label>
                  <input
                    type="text"
                    value={engineForm.drivetrain}
                    onChange={(e) => setEngineForm({ ...engineForm, drivetrain: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Transmission Type</label>
                  <input
                    type="text"
                    value={engineForm.transmissionType}
                    onChange={(e) => setEngineForm({ ...engineForm, transmissionType: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={engineForm.isActive}
                    onChange={(e) => setEngineForm({ ...engineForm, isActive: e.target.checked })}
                  />
                  <label>Active</label>
                </div>
              </>
            )}

            {editingItem.type === "trim" && (
              <>
                <div>
                  <label className="block text-sm font-medium">Engine ID *</label>
                  <input
                    type="text"
                    required
                    value={trimForm.engineId}
                    onChange={(e) => setTrimForm({ ...trimForm, engineId: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Name *</label>
                  <input
                    type="text"
                    required
                    value={trimForm.name}
                    onChange={(e) => setTrimForm({ ...trimForm, name: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Body Type</label>
                  <input
                    type="text"
                    value={trimForm.bodyType}
                    onChange={(e) => setTrimForm({ ...trimForm, bodyType: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Doors</label>
                  <input
                    type="number"
                    value={trimForm.doors}
                    onChange={(e) => setTrimForm({ ...trimForm, doors: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={trimForm.isActive}
                    onChange={(e) => setTrimForm({ ...trimForm, isActive: e.target.checked })}
                  />
                  <label>Active</label>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
            >
              Update {editingItem.type}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminFitments;