import { useState, useMemo, useEffect } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";

import {
  useGetMakesQuery,
  useGetMakeByIdQuery,
  useCreateMakeMutation,
  useUpdateMakeMutation,
  useDeleteMakeMutation,
  useGetModelsQuery,
  useGetModelByIdQuery,
  useCreateModelMutation,
  useUpdateModelMutation,
  useDeleteModelMutation,
  useGetGenerationsQuery,
  useGetGenerationByIdQuery,
  useCreateGenerationMutation,
  useUpdateGenerationMutation,
  useDeleteGenerationMutation,
  useGetEnginesQuery,
  useGetEngineByIdQuery,
  useCreateEngineMutation,
  useUpdateEngineMutation,
  useDeleteEngineMutation,
  useGetTrimsQuery,
  useGetTrimByIdQuery,
  useCreateTrimMutation,
  useUpdateTrimMutation,
  useDeleteTrimMutation,
} from "../../services/vehicleApi";

import type {
  VehicleMake,
  VehicleModel,
  VehicleGeneration,
  VehicleEngine,
  VehicleTrim,
  CreateVehicleMakeDto,
  UpdateVehicleMakeDto,
  CreateVehicleModelDto,
  UpdateVehicleModelDto,
  CreateVehicleGenerationDto,
  UpdateVehicleGenerationDto,
  CreateVehicleEngineDto,
  UpdateVehicleEngineDto,
  CreateVehicleTrimDto,
  UpdateVehicleTrimDto,
} from "../../types/vehicle-types";

type TabType = "makes" | "models" | "generations" | "engines" | "trims";

// FORM STATE INTERFACES
interface MakeFormState extends CreateVehicleMakeDto {
  id?: string;
}
interface ModelFormState extends CreateVehicleModelDto {
  id?: string;
}
interface GenerationFormState extends CreateVehicleGenerationDto {
  id?: string;
}
interface EngineFormState extends CreateVehicleEngineDto {
  id?: string;
}
interface TrimFormState extends CreateVehicleTrimDto {
  id?: string;
}

const initialMakeForm: MakeFormState = {
  name: "",
  slug: "",
  isActive: true,
};
const initialModelForm: ModelFormState = {
  makeId: "",
  name: "",
  slug: "",
  isActive: true,
};
const initialGenerationForm: GenerationFormState = {
  modelId: "",
  name: "",
  slug: "",
  chassisCode: "",
  yearStart: new Date().getFullYear(),
  yearEnd: undefined,
  isActive: true,
};
const initialEngineForm: EngineFormState = {
  generationId: "",
  engineCode: "",
  engineName: "",
  fuelType: "PETROL",
  aspiration: "NA",
  cylinders: undefined,
  horsepower: undefined,
  displacementCc: undefined,
  displacementLabel: "",
  drivetrain: "FWD",
  transmissionType: "MANUAL",
  isActive: true,
};
const initialTrimForm: TrimFormState = {
  engineId: "",
  name: "",
  bodyType: "SEDAN",
  doors: 4,
  isActive: true,
};

// UTILITIES
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const getStatusBadgeColor = (isActive: boolean) => {
  return isActive
    ? "bg-green-100 text-green-800"
    : "bg-gray-100 text-gray-600";
};

/* =========================================================
   MAIN COMPONENT
========================================================= */
const AdminVehicles = () => {
  const [activeTab, setActiveTab] = useState<TabType>("makes");

  // Pagination states
  const [makePage, setMakePage] = useState(1);
  const [modelPage, setModelPage] = useState(1);
  const [generationPage, setGenerationPage] = useState(1);
  const [enginePage, setEnginePage] = useState(1);
  const [trimPage, setTrimPage] = useState(1);

  // Filter states
  const [modelMakeFilter, setModelMakeFilter] = useState<string>("");
  const [generationModelFilter, setGenerationModelFilter] = useState<string>("");
  const [engineGenerationFilter, setEngineGenerationFilter] = useState<string>("");
  const [trimEngineFilter, setTrimEngineFilter] = useState<string>("");

  // Modal states (create/edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  // Detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailItemId, setDetailItemId] = useState<string | null>(null);
  const [detailTabType, setDetailTabType] = useState<TabType | null>(null);

  // Form states
  const [makeForm, setMakeForm] = useState<MakeFormState>(initialMakeForm);
  const [modelForm, setModelForm] = useState<ModelFormState>(initialModelForm);
  const [generationForm, setGenerationForm] = useState<GenerationFormState>(initialGenerationForm);
  const [engineForm, setEngineForm] = useState<EngineFormState>(initialEngineForm);
  const [trimForm, setTrimForm] = useState<TrimFormState>(initialTrimForm);

  // Query params
  const makeQueryParams = useMemo(() => ({ page: makePage, limit: 20 }), [makePage]);
  const modelQueryParams = useMemo(
    () => ({ page: modelPage, limit: 20, makeId: modelMakeFilter || undefined }),
    [modelPage, modelMakeFilter]
  );
  const generationQueryParams = useMemo(
    () => ({ page: generationPage, limit: 20, modelId: generationModelFilter || undefined }),
    [generationPage, generationModelFilter]
  );
  const engineQueryParams = useMemo(
    () => ({ page: enginePage, limit: 20, generationId: engineGenerationFilter || undefined }),
    [enginePage, engineGenerationFilter]
  );
  const trimQueryParams = useMemo(
    () => ({ page: trimPage, limit: 20, engineId: trimEngineFilter || undefined }),
    [trimPage, trimEngineFilter]
  );

  // Data queries
  const { data: makesData, isLoading: makesLoading, refetch: refetchMakes } = useGetMakesQuery(makeQueryParams);
  const { data: modelsData, isLoading: modelsLoading, refetch: refetchModels } = useGetModelsQuery(modelQueryParams);
  const { data: generationsData, isLoading: generationsLoading, refetch: refetchGenerations } = useGetGenerationsQuery(generationQueryParams);
  const { data: enginesData, isLoading: enginesLoading, refetch: refetchEngines } = useGetEnginesQuery(engineQueryParams);
  const { data: trimsData, isLoading: trimsLoading, refetch: refetchTrims } = useGetTrimsQuery(trimQueryParams);

  // All data for selects
  const { data: allMakes } = useGetMakesQuery({ page: 1, limit: 100 });
  const { data: allModels } = useGetModelsQuery({ page: 1, limit: 100 });
  const { data: allGenerations } = useGetGenerationsQuery({ page: 1, limit: 100 });
  const { data: allEngines } = useGetEnginesQuery({ page: 1, limit: 100 });

  // By‑ID queries for the detail modal
  const { data: detailMake, isLoading: detailMakeLoading } = useGetMakeByIdQuery(detailItemId!, {
    skip: detailTabType !== "makes" || !detailModalOpen,
  });
  const { data: detailModel, isLoading: detailModelLoading } = useGetModelByIdQuery(detailItemId!, {
    skip: detailTabType !== "models" || !detailModalOpen,
  });
  const { data: detailGeneration, isLoading: detailGenerationLoading } = useGetGenerationByIdQuery(detailItemId!, {
    skip: detailTabType !== "generations" || !detailModalOpen,
  });
  const { data: detailEngine, isLoading: detailEngineLoading } = useGetEngineByIdQuery(detailItemId!, {
    skip: detailTabType !== "engines" || !detailModalOpen,
  });
  const { data: detailTrim, isLoading: detailTrimLoading } = useGetTrimByIdQuery(detailItemId!, {
    skip: detailTabType !== "trims" || !detailModalOpen,
  });

  // Mutation hooks
  const [createMake, { isLoading: creatingMake }] = useCreateMakeMutation();
  const [updateMake, { isLoading: updatingMake }] = useUpdateMakeMutation();
  const [deleteMake, { isLoading: deletingMake }] = useDeleteMakeMutation();
  const [createModel, { isLoading: creatingModel }] = useCreateModelMutation();
  const [updateModel, { isLoading: updatingModel }] = useUpdateModelMutation();
  const [deleteModel] = useDeleteModelMutation();
  const [createGeneration, { isLoading: creatingGeneration }] = useCreateGenerationMutation();
  const [updateGeneration, { isLoading: updatingGeneration }] = useUpdateGenerationMutation();
  const [deleteGeneration] = useDeleteGenerationMutation();
  const [createEngine, { isLoading: creatingEngine }] = useCreateEngineMutation();
  const [updateEngine, { isLoading: updatingEngine }] = useUpdateEngineMutation();
  const [deleteEngine ] = useDeleteEngineMutation();
  const [createTrim, { isLoading: creatingTrim }] = useCreateTrimMutation();
  const [updateTrim, { isLoading: updatingTrim }] = useUpdateTrimMutation();
  const [deleteTrim] = useDeleteTrimMutation();

  // Reset page when tab changes
  useEffect(() => {
    switch (activeTab) {
      case "makes":
        setMakePage(1);
        break;
      case "models":
        setModelPage(1);
        break;
      case "generations":
        setGenerationPage(1);
        break;
      case "engines":
        setEnginePage(1);
        break;
      case "trims":
        setTrimPage(1);
        break;
    }
  }, [activeTab]);

  // Reset pages on filter change
  useEffect(() => setModelPage(1), [modelMakeFilter]);
  useEffect(() => setGenerationPage(1), [generationModelFilter]);
  useEffect(() => setEnginePage(1), [engineGenerationFilter]);
  useEffect(() => setTrimPage(1), [trimEngineFilter]);

  // Modal handlers
  const openCreateModal = (tab: TabType) => {
    setModalMode("create");
    resetFormByTab(tab);
    setModalOpen(true);
  };

  const openEditModal = (tab: TabType, item: any) => {
    setModalMode("edit");
    populateFormByTab(tab, item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const resetFormByTab = (tab: TabType) => {
    switch (tab) {
      case "makes":
        setMakeForm(initialMakeForm);
        break;
      case "models":
        setModelForm({ ...initialModelForm, makeId: modelMakeFilter || "" });
        break;
      case "generations":
        setGenerationForm({ ...initialGenerationForm, modelId: generationModelFilter || "" });
        break;
      case "engines":
        setEngineForm({ ...initialEngineForm, generationId: engineGenerationFilter || "" });
        break;
      case "trims":
        setTrimForm({ ...initialTrimForm, engineId: trimEngineFilter || "" });
        break;
    }
  };

  const populateFormByTab = (tab: TabType, item: any) => {
    switch (tab) {
      case "makes":
        setMakeForm({
          id: item.id,
          name: item.name,
          slug: item.slug,
          isActive: item.isActive,
        });
        break;
      case "models":
        setModelForm({
          id: item.id,
          makeId: item.makeId,
          name: item.name,
          slug: item.slug,
          isActive: item.isActive,
        });
        break;
      case "generations":
        setGenerationForm({
          id: item.id,
          modelId: item.modelId,
          name: item.name,
          slug: item.slug || "",
          chassisCode: item.chassisCode || "",
          yearStart: item.yearStart,
          yearEnd: item.yearEnd || undefined,
          isActive: item.isActive,
        });
        break;
      case "engines":
        setEngineForm({
          id: item.id,
          generationId: item.generationId,
          engineCode: item.engineCode,
          engineName: item.engineName || "",
          fuelType: item.fuelType || "PETROL",
          aspiration: item.aspiration || "NA",
          cylinders: item.cylinders,
          horsepower: item.horsepower,
          displacementCc: item.displacementCc,
          displacementLabel: item.displacementLabel || "",
          drivetrain: item.drivetrain || "FWD",
          transmissionType: item.transmissionType || "MANUAL",
          isActive: item.isActive,
        });
        break;
      case "trims":
        setTrimForm({
          id: item.id,
          engineId: item.engineId,
          name: item.name,
          bodyType: item.bodyType || "SEDAN",
          doors: item.doors || 4,
          isActive: item.isActive,
        });
        break;
    }
  };

  const handleFormInput = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    setForm: Function
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev: any) => ({ ...prev, [name]: checked }));
      return;
    }
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleAutoSlug = (nameValue: string, setForm: Function) => {
    const slug = slugify(nameValue);
    setForm((prev: any) => ({ ...prev, slug }));
  };

  // Submit handlers (changed from FormEvent to SyntheticEvent)
  const handleSubmitMake = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await createMake(makeForm).unwrap();
      } else {
        await updateMake({ id: makeForm.id!, data: makeForm as UpdateVehicleMakeDto }).unwrap();
      }
      closeModal();
      refetchMakes();
    } catch (error) {
      console.error("Failed to save make:", error);
      alert("Failed to save make");
    }
  };

  const handleSubmitModel = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await createModel(modelForm).unwrap();
      } else {
        await updateModel({ id: modelForm.id!, data: modelForm as UpdateVehicleModelDto }).unwrap();
      }
      closeModal();
      refetchModels();
    } catch (error) {
      console.error("Failed to save model:", error);
      alert("Failed to save model");
    }
  };

  const handleSubmitGeneration = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await createGeneration(generationForm).unwrap();
      } else {
        await updateGeneration({ id: generationForm.id!, data: generationForm as UpdateVehicleGenerationDto }).unwrap();
      }
      closeModal();
      refetchGenerations();
    } catch (error) {
      console.error("Failed to save generation:", error);
      alert("Failed to save generation");
    }
  };

  const handleSubmitEngine = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await createEngine(engineForm).unwrap();
      } else {
        await updateEngine({ id: engineForm.id!, data: engineForm as UpdateVehicleEngineDto }).unwrap();
      }
      closeModal();
      refetchEngines();
    } catch (error) {
      console.error("Failed to save engine:", error);
      alert("Failed to save engine");
    }
  };

  const handleSubmitTrim = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await createTrim(trimForm).unwrap();
      } else {
        await updateTrim({ id: trimForm.id!, data: trimForm as UpdateVehicleTrimDto }).unwrap();
      }
      closeModal();
      refetchTrims();
    } catch (error) {
      console.error("Failed to save trim:", error);
      alert("Failed to save trim");
    }
  };

  // Delete handler
  const handleDelete = async (id: string, deleteFn: any, refetchFn: any) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteFn(id).unwrap();
      alert("Deleted successfully");
      refetchFn();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete");
    }
  };

  const openDetailModal = (tab: TabType, id: string) => {
    setDetailTabType(tab);
    setDetailItemId(id);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setDetailItemId(null);
    setDetailTabType(null);
  };

  // Render functions for each tab (unchanged, but note Trims column added for Engines)
  const renderMakesTab = () => (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Vehicle Makes</h2>
          <p className="text-sm text-gray-500">Manage car brands and manufacturers</p>
        </div>
        <button
          onClick={() => openCreateModal("makes")}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
        >
          + Add Make
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Models</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {makesLoading && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">Loading...</td>
              </tr>
            )}
            {!makesLoading && makesData?.data?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No makes found</td>
              </tr>
            )}
            {!makesLoading &&
              makesData?.data?.map((make: VehicleMake) => (
                <tr key={make.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{make.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{make.slug}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{make._count?.models || 0}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeColor(
                        make.isActive
                      )}`}
                    >
                      {make.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openDetailModal("makes", make.id)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openEditModal("makes", make)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(make.id, deleteMake, refetchMakes)}
                      disabled={deletingMake}
                      className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {makesData && (
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setMakePage((p) => Math.max(1, p - 1))}
            disabled={makePage <= 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {makesData.meta?.page || makePage} of {makesData.meta?.totalPages || 1}
          </span>
          <button
            onClick={() => setMakePage((p) => p + 1)}
            disabled={makePage >= (makesData.meta?.totalPages || 1)}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  const renderModelsTab = () => (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-3 items-center">
          <h2 className="text-lg font-semibold text-gray-800">Vehicle Models</h2>
          <select
            value={modelMakeFilter}
            onChange={(e) => setModelMakeFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">All Makes</option>
            {allMakes?.data?.map((make: VehicleMake) => (
              <option key={make.id} value={make.id}>
                {make.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => openCreateModal("models")}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white"
        >
          + Add Model
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Make</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generations</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {modelsLoading && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center">Loading...</td>
              </tr>
            )}
            {!modelsLoading && modelsData?.data?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center">No models found</td>
              </tr>
            )}
            {!modelsLoading &&
              modelsData?.data?.map((model: VehicleModel) => (
                <tr key={model.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{model.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{model.make?.name || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{model.slug}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{model._count?.generations || 0}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeColor(
                        model.isActive
                      )}`}
                    >
                      {model.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openDetailModal("models", model.id)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openEditModal("models", model)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(model.id, deleteModel, refetchModels)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {modelsData && (
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => setModelPage((p) => Math.max(1, p - 1))}
            disabled={modelPage <= 1}
            className="px-4 py-2 border rounded-md"
          >
            Previous
          </button>
          <span>
            Page {modelsData.meta?.page || modelPage} of {modelsData.meta?.totalPages || 1}
          </span>
          <button
            onClick={() => setModelPage((p) => p + 1)}
            disabled={modelPage >= (modelsData.meta?.totalPages || 1)}
            className="px-4 py-2 border rounded-md"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  const renderGenerationsTab = () => (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-3 items-center">
          <h2 className="text-lg font-semibold text-gray-800">Generations</h2>
          <select
            value={generationModelFilter}
            onChange={(e) => setGenerationModelFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">All Models</option>
            {allModels?.data?.map((model: VehicleModel) => (
              <option key={model.id} value={model.id}>
                {model.make?.name} {model.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => openCreateModal("generations")}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white"
        >
          + Add Generation
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chassis Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Years</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engines</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {generationsLoading && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center">Loading...</td>
              </tr>
            )}
            {!generationsLoading &&
              generationsData?.data?.map((gen: VehicleGeneration) => (
                <tr key={gen.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{gen.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{gen.model?.name || "-"}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">{gen.chassisCode || "-"}</td>
                  <td className="px-6 py-4 text-sm">
                    {gen.yearStart}
                    {gen.yearEnd ? ` - ${gen.yearEnd}` : "+"}
                  </td>
                  <td className="px-6 py-4 text-sm">{gen._count?.engines || 0}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeColor(
                        gen.isActive
                      )}`}
                    >
                      {gen.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openDetailModal("generations", gen.id)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openEditModal("generations", gen)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(gen.id, deleteGeneration, refetchGenerations)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {generationsData && (
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => setGenerationPage((p) => Math.max(1, p - 1))}
            disabled={generationPage <= 1}
            className="px-4 py-2 border rounded-md"
          >
            Previous
          </button>
          <span>
            Page {generationsData.meta?.page || generationPage} of {generationsData.meta?.totalPages || 1}
          </span>
          <button
            onClick={() => setGenerationPage((p) => p + 1)}
            disabled={generationPage >= (generationsData.meta?.totalPages || 1)}
            className="px-4 py-2 border rounded-md"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  const renderEnginesTab = () => (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-3 items-center">
          <h2 className="text-lg font-semibold text-gray-800">Engines</h2>
          <select
            value={engineGenerationFilter}
            onChange={(e) => setEngineGenerationFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">All Generations</option>
            {allGenerations?.data?.map((gen: VehicleGeneration) => (
              <option key={gen.id} value={gen.id}>
                {gen.model?.make?.name} {gen.model?.name} - {gen.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => openCreateModal("engines")}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white"
        >
          + Add Engine
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engine Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Drivetrain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transmission</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trims</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enginesLoading && (
              <tr>
                <td colSpan={9} className="px-6 py-10 text-center">Loading...</td>
              </tr>
            )}
            {!enginesLoading &&
              enginesData?.data?.map((engine: VehicleEngine) => (
                <tr key={engine.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono font-medium">{engine.engineCode}</td>
                  <td className="px-6 py-4 text-sm">{engine.engineName || "-"}</td>
                  <td className="px-6 py-4 text-sm">{engine.fuelType || "-"}</td>
                  <td className="px-6 py-4 text-sm">{engine.horsepower ? `${engine.horsepower} hp` : "-"}</td>
                  <td className="px-6 py-4 text-sm">{engine.drivetrain || "-"}</td>
                  <td className="px-6 py-4 text-sm">{engine.transmissionType || "-"}</td>
                  <td className="px-6 py-4 text-sm">{engine._count?.trims || 0}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeColor(
                        engine.isActive
                      )}`}
                    >
                      {engine.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openDetailModal("engines", engine.id)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openEditModal("engines", engine)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(engine.id, deleteEngine, refetchEngines)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {enginesData && (
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => setEnginePage((p) => Math.max(1, p - 1))}
            disabled={enginePage <= 1}
            className="px-4 py-2 border rounded-md"
          >
            Previous
          </button>
          <span>
            Page {enginesData.meta?.page || enginePage} of {enginesData.meta?.totalPages || 1}
          </span>
          <button
            onClick={() => setEnginePage((p) => p + 1)}
            disabled={enginePage >= (enginesData.meta?.totalPages || 1)}
            className="px-4 py-2 border rounded-md"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  const renderTrimsTab = () => (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-3 items-center">
          <h2 className="text-lg font-semibold text-gray-800">Trims</h2>
          <select
            value={trimEngineFilter}
            onChange={(e) => setTrimEngineFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">All Engines</option>
            {allEngines?.data?.map((engine: VehicleEngine) => (
              <option key={engine.id} value={engine.id}>
                {engine.engineCode} - {engine.engineName || engine.engineCode}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => openCreateModal("trims")}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white"
        >
          + Add Trim
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Body Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doors</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engine</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trimsLoading && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center">Loading...</td>
              </tr>
            )}
            {!trimsLoading &&
              trimsData?.data?.map((trim: VehicleTrim) => (
                <tr key={trim.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{trim.name}</td>
                  <td className="px-6 py-4 text-sm">{trim.bodyType || "-"}</td>
                  <td className="px-6 py-4 text-sm">{trim.doors || "-"}</td>
                  <td className="px-6 py-4 text-sm">{trim.engine?.engineCode || "-"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeColor(
                        trim.isActive
                      )}`}
                    >
                      {trim.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openDetailModal("trims", trim.id)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openEditModal("trims", trim)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(trim.id, deleteTrim, refetchTrims)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {trimsData && (
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => setTrimPage((p) => Math.max(1, p - 1))}
            disabled={trimPage <= 1}
            className="px-4 py-2 border rounded-md"
          >
            Previous
          </button>
          <span>
            Page {trimsData.meta?.page || trimPage} of {trimsData.meta?.totalPages || 1}
          </span>
          <button
            onClick={() => setTrimPage((p) => p + 1)}
            disabled={trimPage >= (trimsData.meta?.totalPages || 1)}
            className="px-4 py-2 border rounded-md"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  // Detail modal
  const renderDetailModal = () => {
    if (!detailModalOpen || !detailTabType || !detailItemId) return null;

    let title = "";
    let content = null;
    let isLoading = false;

    switch (detailTabType) {
      case "makes":
        title = "Make Details";
        isLoading = detailMakeLoading;
        if (detailMake) {
          content = (
            <div className="space-y-3">
              <DetailRow label="ID" value={detailMake.id} />
              <DetailRow label="Name" value={detailMake.name} />
              <DetailRow label="Slug" value={detailMake.slug} />
              <DetailRow label="Status" value={detailMake.isActive ? "Active" : "Inactive"} />
              <DetailRow label="Models Count" value={detailMake._count?.models ?? 0} />
              <DetailRow label="Created At" value={new Date(detailMake.createdAt).toLocaleString()} />
              <DetailRow label="Updated At" value={new Date(detailMake.updatedAt).toLocaleString()} />
            </div>
          );
        }
        break;
      case "models":
        title = "Model Details";
        isLoading = detailModelLoading;
        if (detailModel) {
          content = (
            <div className="space-y-3">
              <DetailRow label="ID" value={detailModel.id} />
              <DetailRow label="Name" value={detailModel.name} />
              <DetailRow label="Slug" value={detailModel.slug} />
              <DetailRow label="Make" value={detailModel.make?.name ?? detailModel.makeId} />
              <DetailRow label="Status" value={detailModel.isActive ? "Active" : "Inactive"} />
              <DetailRow label="Generations Count" value={detailModel._count?.generations ?? 0} />
              <DetailRow label="Created At" value={new Date(detailModel.createdAt).toLocaleString()} />
              <DetailRow label="Updated At" value={new Date(detailModel.updatedAt).toLocaleString()} />
            </div>
          );
        }
        break;
      case "generations":
        title = "Generation Details";
        isLoading = detailGenerationLoading;
        if (detailGeneration) {
          content = (
            <div className="space-y-3">
              <DetailRow label="ID" value={detailGeneration.id} />
              <DetailRow label="Name" value={detailGeneration.name} />
              <DetailRow label="Slug" value={detailGeneration.slug || "-"} />
              <DetailRow label="Model" value={detailGeneration.model?.name ?? detailGeneration.modelId} />
              <DetailRow label="Chassis Code" value={detailGeneration.chassisCode || "-"} />
              <DetailRow label="Years" value={`${detailGeneration.yearStart}${detailGeneration.yearEnd ? ` - ${detailGeneration.yearEnd}` : "+"}`} />
              <DetailRow label="Status" value={detailGeneration.isActive ? "Active" : "Inactive"} />
              <DetailRow label="Engines Count" value={detailGeneration._count?.engines ?? 0} />
              <DetailRow label="Created At" value={new Date(detailGeneration.createdAt).toLocaleString()} />
              <DetailRow label="Updated At" value={new Date(detailGeneration.updatedAt).toLocaleString()} />
            </div>
          );
        }
        break;
      case "engines":
        title = "Engine Details";
        isLoading = detailEngineLoading;
        if (detailEngine) {
          content = (
            <div className="space-y-3">
              <DetailRow label="ID" value={detailEngine.id} />
              <DetailRow label="Engine Code" value={detailEngine.engineCode} />
              <DetailRow label="Engine Name" value={detailEngine.engineName || "-"} />
              <DetailRow label="Generation" value={detailEngine.generation?.name ?? detailEngine.generationId} />
              <DetailRow label="Fuel Type" value={detailEngine.fuelType || "-"} />
              <DetailRow label="Aspiration" value={detailEngine.aspiration || "-"} />
              <DetailRow label="Cylinders" value={detailEngine.cylinders ?? "-"} />
              <DetailRow label="Horsepower" value={detailEngine.horsepower ? `${detailEngine.horsepower} hp` : "-"} />
              <DetailRow label="Displacement (cc)" value={detailEngine.displacementCc ?? "-"} />
              <DetailRow label="Displacement Label" value={detailEngine.displacementLabel || "-"} />
              <DetailRow label="Drivetrain" value={detailEngine.drivetrain || "-"} />
              <DetailRow label="Transmission" value={detailEngine.transmissionType || "-"} />
              <DetailRow label="Status" value={detailEngine.isActive ? "Active" : "Inactive"} />
              <DetailRow label="Trims Count" value={detailEngine._count?.trims ?? 0} />
              <DetailRow label="Created At" value={new Date(detailEngine.createdAt).toLocaleString()} />
              <DetailRow label="Updated At" value={new Date(detailEngine.updatedAt).toLocaleString()} />
            </div>
          );
        }
        break;
      case "trims":
        title = "Trim Details";
        isLoading = detailTrimLoading;
        if (detailTrim) {
          content = (
            <div className="space-y-3">
              <DetailRow label="ID" value={detailTrim.id} />
              <DetailRow label="Name" value={detailTrim.name} />
              <DetailRow label="Body Type" value={detailTrim.bodyType || "-"} />
              <DetailRow label="Doors" value={detailTrim.doors ?? "-"} />
              <DetailRow label="Engine" value={detailTrim.engine?.engineCode ?? detailTrim.engineId} />
              <DetailRow label="Status" value={detailTrim.isActive ? "Active" : "Inactive"} />
              <DetailRow label="Created At" value={new Date(detailTrim.createdAt).toLocaleString()} />
              <DetailRow label="Updated At" value={new Date(detailTrim.updatedAt).toLocaleString()} />
            </div>
          );
        }
        break;
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button onClick={closeDetailModal} className="text-gray-500 hover:text-gray-700 text-2xl">
              &times;
            </button>
          </div>
          <div className="p-6">
            {isLoading && <div className="text-center py-8">Loading...</div>}
            {!isLoading && content}
            {!isLoading && !content && <div className="text-center py-8 text-red-500">Failed to load details.</div>}
            <div className="flex justify-end mt-6 pt-4 border-t">
              <button
                onClick={closeDetailModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex border-b border-gray-100 py-2">
      <div className="w-1/3 text-sm font-medium text-gray-600">{label}</div>
      <div className="w-2/3 text-sm text-gray-900">{value ?? "-"}</div>
    </div>
  );

  // Create / Edit Modal
  const renderModal = () => {
    if (!modalOpen) return null;

    let title = "";
    let formContent = null;
    let onSubmit: (e: SyntheticEvent) => void = () => {};
    let isLoading = false;

    switch (activeTab) {
      case "makes":
        title = `${modalMode === "create" ? "Create" : "Edit"} Make`;
        onSubmit = handleSubmitMake;
        isLoading = creatingMake || updatingMake;
        formContent = (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                name="name"
                value={makeForm.name}
                onChange={(e) => handleFormInput(e, setMakeForm)}
                onBlur={(e) => handleAutoSlug(e.target.value, setMakeForm)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input
                name="slug"
                value={makeForm.slug}
                onChange={(e) => handleFormInput(e, setMakeForm)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-generated from name if left empty</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={makeForm.isActive}
                onChange={(e) => handleFormInput(e, setMakeForm)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">Active</label>
            </div>
          </div>
        );
        break;
      case "models":
        title = `${modalMode === "create" ? "Create" : "Edit"} Model`;
        onSubmit = handleSubmitModel;
        isLoading = creatingModel || updatingModel;
        formContent = (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Make *</label>
              <select
                name="makeId"
                value={modelForm.makeId}
                onChange={(e) => handleFormInput(e, setModelForm)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              >
                <option value="">Select Make</option>
                {allMakes?.data?.map((make: VehicleMake) => (
                  <option key={make.id} value={make.id}>
                    {make.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                name="name"
                value={modelForm.name}
                onChange={(e) => handleFormInput(e, setModelForm)}
                onBlur={(e) => handleAutoSlug(e.target.value, setModelForm)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input
                name="slug"
                value={modelForm.slug}
                onChange={(e) => handleFormInput(e, setModelForm)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={modelForm.isActive}
                onChange={(e) => handleFormInput(e, setModelForm)}
              />
              <label className="text-sm text-gray-700">Active</label>
            </div>
          </div>
        );
        break;
      case "generations":
        title = `${modalMode === "create" ? "Create" : "Edit"} Generation`;
        onSubmit = handleSubmitGeneration;
        isLoading = creatingGeneration || updatingGeneration;
        formContent = (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Model *</label>
              <select
                name="modelId"
                value={generationForm.modelId}
                onChange={(e) => handleFormInput(e, setGenerationForm)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              >
                <option value="">Select Model</option>
                {allModels?.data?.map((model: VehicleModel) => (
                  <option key={model.id} value={model.id}>
                    {model.make?.name} {model.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Generation Name *</label>
              <input
                name="name"
                value={generationForm.name}
                onChange={(e) => handleFormInput(e, setGenerationForm)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Year Start *</label>
                <input
                  type="number"
                  name="yearStart"
                  value={generationForm.yearStart}
                  onChange={(e) => handleFormInput(e, setGenerationForm)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Year End</label>
                <input
                  type="number"
                  name="yearEnd"
                  value={generationForm.yearEnd || ""}
                  onChange={(e) => handleFormInput(e, setGenerationForm)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Chassis Code</label>
              <input
                name="chassisCode"
                value={generationForm.chassisCode}
                onChange={(e) => handleFormInput(e, setGenerationForm)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={generationForm.isActive}
                onChange={(e) => handleFormInput(e, setGenerationForm)}
              />
              <label>Active</label>
            </div>
          </div>
        );
        break;
      case "engines":
        title = `${modalMode === "create" ? "Create" : "Edit"} Engine`;
        onSubmit = handleSubmitEngine;
        isLoading = creatingEngine || updatingEngine;
        formContent = (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Generation *</label>
              <select
                name="generationId"
                value={engineForm.generationId}
                onChange={(e) => handleFormInput(e, setEngineForm)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              >
                <option value="">Select Generation</option>
                {allGenerations?.data?.map((gen: VehicleGeneration) => (
                  <option key={gen.id} value={gen.id}>
                    {gen.model?.make?.name} {gen.model?.name} - {gen.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Engine Code *</label>
                <input
                  name="engineCode"
                  value={engineForm.engineCode}
                  onChange={(e) => handleFormInput(e, setEngineForm)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Engine Name</label>
                <input
                  name="engineName"
                  value={engineForm.engineName}
                  onChange={(e) => handleFormInput(e, setEngineForm)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
                <select
                  name="fuelType"
                  value={engineForm.fuelType}
                  onChange={(e) => handleFormInput(e, setEngineForm)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="PETROL">Petrol</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="PLUG_IN_HYBRID">Plug-in Hybrid</option>
                  <option value="ELECTRIC">Electric</option>
                  <option value="LPG">LPG</option>
                  <option value="CNG">CNG</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Aspiration</label>
                <select
                  name="aspiration"
                  value={engineForm.aspiration}
                  onChange={(e) => handleFormInput(e, setEngineForm)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="NA">Naturally Aspirated</option>
                  <option value="TURBO">Turbo</option>
                  <option value="TWIN_TURBO">Twin Turbo</option>
                  <option value="SUPERCHARGED">Supercharged</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Horsepower</label>
                <input
                  type="number"
                  name="horsepower"
                  value={engineForm.horsepower || ""}
                  onChange={(e) => handleFormInput(e, setEngineForm)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Displacement (cc)</label>
                <input
                  type="number"
                  name="displacementCc"
                  value={engineForm.displacementCc || ""}
                  onChange={(e) => handleFormInput(e, setEngineForm)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cylinders</label>
                <input
                  type="number"
                  name="cylinders"
                  value={engineForm.cylinders || ""}
                  onChange={(e) => handleFormInput(e, setEngineForm)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Drivetrain</label>
                <select
                  name="drivetrain"
                  value={engineForm.drivetrain}
                  onChange={(e) => handleFormInput(e, setEngineForm)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="FWD">FWD</option>
                  <option value="RWD">RWD</option>
                  <option value="AWD">AWD</option>
                  <option value="FOUR_WD">4WD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Transmission</label>
                <select
                  name="transmissionType"
                  value={engineForm.transmissionType}
                  onChange={(e) => handleFormInput(e, setEngineForm)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="MANUAL">Manual</option>
                  <option value="AUTOMATIC">Automatic</option>
                  <option value="CVT">CVT</option>
                  <option value="DCT">DCT</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={engineForm.isActive}
                onChange={(e) => handleFormInput(e, setEngineForm)}
              />
              <label>Active</label>
            </div>
          </div>
        );
        break;
      case "trims":
        title = `${modalMode === "create" ? "Create" : "Edit"} Trim`;
        onSubmit = handleSubmitTrim;
        isLoading = creatingTrim || updatingTrim;
        formContent = (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Engine *</label>
              <select
                name="engineId"
                value={trimForm.engineId}
                onChange={(e) => handleFormInput(e, setTrimForm)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              >
                <option value="">Select Engine</option>
                {allEngines?.data?.map((engine: VehicleEngine) => (
                  <option key={engine.id} value={engine.id}>
                    {engine.engineCode} - {engine.engineName || engine.engineCode}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Trim Name *</label>
              <input
                name="name"
                value={trimForm.name}
                onChange={(e) => handleFormInput(e, setTrimForm)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Body Type</label>
                <select
                  name="bodyType"
                  value={trimForm.bodyType}
                  onChange={(e) => handleFormInput(e, setTrimForm)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="SEDAN">Sedan</option>
                  <option value="HATCHBACK">Hatchback</option>
                  <option value="COUPE">Coupe</option>
                  <option value="CONVERTIBLE">Convertible</option>
                  <option value="SUV">SUV</option>
                  <option value="CROSSOVER">Crossover</option>
                  <option value="PICKUP">Pickup</option>
                  <option value="WAGON">Wagon</option>
                  <option value="VAN">Van</option>
                  <option value="MINIVAN">Minivan</option>
                  <option value="MPV">MPV</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Doors</label>
                <input
                  type="number"
                  name="doors"
                  value={trimForm.doors || ""}
                  onChange={(e) => handleFormInput(e, setTrimForm)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={trimForm.isActive}
                onChange={(e) => handleFormInput(e, setTrimForm)}
              />
              <label>Active</label>
            </div>
          </div>
        );
        break;
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl">
              &times;
            </button>
          </div>
          <form onSubmit={onSubmit} className="p-6">
            {formContent}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-lg text-gray-700">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : modalMode === "create" ? "Create" : "Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">🚗 Vehicle Database Admin</h1>
          <p className="mt-1 text-sm text-gray-500">Manage makes, models, generations, engines, and trims.</p>
        </div>

        <div className="border-b border-gray-200 bg-white rounded-t-2xl px-4 pt-2">
          <nav className="-mb-px flex gap-6">
            {(["makes", "models", "generations", "engines", "trims"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition ${
                  activeTab === tab
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white rounded-b-2xl rounded-tr-2xl p-6 shadow-sm">
          {activeTab === "makes" && renderMakesTab()}
          {activeTab === "models" && renderModelsTab()}
          {activeTab === "generations" && renderGenerationsTab()}
          {activeTab === "engines" && renderEnginesTab()}
          {activeTab === "trims" && renderTrimsTab()}
        </div>
      </div>
      {renderModal()}
      {renderDetailModal()}
    </div>
  );
};

export default AdminVehicles;