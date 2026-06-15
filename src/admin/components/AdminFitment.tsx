import { useState, useMemo, useEffect, type ChangeEvent, type SyntheticEvent } from "react";

// Fitment API
import {
  useGetConfigQuery,
  useUpdateConfigMutation,
  useGetRulesQuery,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
  useGetOEMReferencesQuery,
  useCreateOEMReferenceMutation,
  useUpdateOEMReferenceMutation,
  useDeleteOEMReferenceMutation,
  useGetCrossReferencesQuery,
  useCreateCrossReferenceMutation,
  useUpdateCrossReferenceMutation,
  useDeleteCrossReferenceMutation,
  useGetFitmentsQuery,
  useCreateFitmentMutation,
  useUpdateFitmentMutation,
  useDeleteFitmentMutation,
} from "../../services/fitmentApi";

// Vehicle API (for dropdowns)
import {
  useGetMakesQuery,
  useGetModelsQuery,
  useGetGenerationsQuery,
  useGetEnginesQuery,
  useGetTrimsQuery,
} from "../../services/vehicleApi";

// Types
import type {
  FitmentServiceConfig,
  UpdateFitmentServiceConfigDto,
  FitmentTypeRule,
  CreateFitmentTypeRuleDto,
  UpdateFitmentTypeRuleDto,
  OEMReference,
  CreateOEMReferenceDto,
  UpdateOEMReferenceDto,
  CrossReference,
  CreateCrossReferenceDto,
  UpdateCrossReferenceDto,
  ProductFitment,
  CreateProductFitmentDto,
  UpdateProductFitmentDto,
} from "../../types/fitment.types";

import type { VehicleMake, VehicleModel, VehicleGeneration } from "../../types/vehicle-types";

type TabType = "config" | "rules" | "oem" | "cross" | "fitments";

const getStatusBadgeColor = (isActive: boolean) =>
  isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600";

// Detail row component
const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex border-b border-gray-100 py-2">
    <div className="w-1/3 text-sm font-medium text-gray-600">{label}</div>
    <div className="w-2/3 text-sm text-gray-900">{value ?? "-"}</div>
  </div>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */
const AdminFitment = () => {
  const [activeTab, setActiveTab] = useState<TabType>("config");

  // Pagination states (only fitments are paginated)
  const [fitmentPage, setFitmentPage] = useState(1);
  const [fitmentLimit] = useState(20);

  // Filter states for fitments
  const [fitmentProductFilter, setFitmentProductFilter] = useState("");
  const [fitmentMakeFilter, setFitmentMakeFilter] = useState("");
  const [fitmentModelFilter, setFitmentModelFilter] = useState("");
  const [fitmentGenFilter, setFitmentGenFilter] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailItemId, setDetailItemId] = useState<string | null>(null);
  const [detailTabType, setDetailTabType] = useState<TabType | null>(null);

  // Form states
  const [configForm, setConfigForm] = useState<Partial<FitmentServiceConfig>>({});
  const [ruleForm, setRuleForm] = useState<Partial<CreateFitmentTypeRuleDto> & { id?: string }>({
    type: "EXACT",
    level: "EXACT_MATCH",
    priority: 0,
    requiresMake: false,
    requiresModel: false,
    requiresGeneration: false,
    requiresEngine: false,
    requiresTrim: false,
    requiresYear: false,
    allowYearRange: true,
    strictMatching: false,
  });
  const [oemForm, setOemForm] = useState<Partial<CreateOEMReferenceDto> & { id?: string }>({
    manufacturer: "",
    partNumber: "",
    description: "",
  });
  const [crossForm, setCrossForm] = useState<Partial<CreateCrossReferenceDto> & { id?: string }>({
    brand: "",
    partNumber: "",
    description: "",
  });
  const [fitmentForm, setFitmentForm] = useState<Partial<CreateProductFitmentDto> & { id?: string }>({
    productId: "",
    level: "EXACT_MATCH",
    type: "EXACT",
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
    isVerified: false,
    confidenceScore: undefined,
    oemReferenceIds: [],
    crossReferenceIds: [],
  });

  // Queries
  const { data: configData, refetch: refetchConfig } = useGetConfigQuery();
  const { data: rulesData, isLoading: rulesLoading, refetch: refetchRules } = useGetRulesQuery();
  const { data: oemData, isLoading: oemLoading, refetch: refetchOem } = useGetOEMReferencesQuery();
  const { data: crossData, isLoading: crossLoading, refetch: refetchCross } = useGetCrossReferencesQuery();

  const fitmentParams = useMemo(() => {
    const params: Record<string, unknown> = { page: fitmentPage, limit: fitmentLimit };
    if (fitmentProductFilter) params.productId = fitmentProductFilter;
    if (fitmentMakeFilter) params.makeId = fitmentMakeFilter;
    if (fitmentModelFilter) params.modelId = fitmentModelFilter;
    if (fitmentGenFilter) params.generationId = fitmentGenFilter;
    return params;
  }, [fitmentPage, fitmentLimit, fitmentProductFilter, fitmentMakeFilter, fitmentModelFilter, fitmentGenFilter]);

  const { data: fitmentsData, isLoading: fitmentsLoading, refetch: refetchFitments } = useGetFitmentsQuery(fitmentParams);

  // Vehicle data for dropdowns
  const { data: allMakes } = useGetMakesQuery({ page: 1, limit: 100 });
  const { data: allModels } = useGetModelsQuery({ page: 1, limit: 100 });
  const { data: allGenerations } = useGetGenerationsQuery({ page: 1, limit: 100 });
  const { data: allEngines } = useGetEnginesQuery({ page: 1, limit: 100 });
  const { data: allTrims } = useGetTrimsQuery({ page: 1, limit: 100 });

  // Mutations
  const [updateConfig, { isLoading: updatingConfig }] = useUpdateConfigMutation();
  const [createRule, { isLoading: creatingRule }] = useCreateRuleMutation();
  const [updateRule, { isLoading: updatingRule }] = useUpdateRuleMutation();
  const [deleteRule] = useDeleteRuleMutation();
  const [createOem, { isLoading: creatingOem }] = useCreateOEMReferenceMutation();
  const [updateOem, { isLoading: updatingOem }] = useUpdateOEMReferenceMutation();
  const [deleteOem] = useDeleteOEMReferenceMutation();
  const [createCross, { isLoading: creatingCross }] = useCreateCrossReferenceMutation();
  const [updateCross, { isLoading: updatingCross }] = useUpdateCrossReferenceMutation();
  const [deleteCross] = useDeleteCrossReferenceMutation();
  const [createFitment, { isLoading: creatingFitment }] = useCreateFitmentMutation();
  const [updateFitment, { isLoading: updatingFitment }] = useUpdateFitmentMutation();
  const [deleteFitment] = useDeleteFitmentMutation();

  // Reset fitment page when filters change
  useEffect(() => setFitmentPage(1), [fitmentProductFilter, fitmentMakeFilter, fitmentModelFilter, fitmentGenFilter]);

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

  const closeModal = () => setModalOpen(false);

  const resetFormByTab = (tab: TabType) => {
    switch (tab) {
      case "config":
        setConfigForm(configData || {});
        break;
      case "rules":
        setRuleForm({
          type: "EXACT",
          level: "EXACT_MATCH",
          priority: 0,
          requiresMake: false,
          requiresModel: false,
          requiresGeneration: false,
          requiresEngine: false,
          requiresTrim: false,
          requiresYear: false,
          allowYearRange: true,
          strictMatching: false,
        });
        break;
      case "oem":
        setOemForm({ manufacturer: "", partNumber: "", description: "" });
        break;
      case "cross":
        setCrossForm({ brand: "", partNumber: "", description: "" });
        break;
      case "fitments":
        setFitmentForm({
          productId: "",
          level: "EXACT_MATCH",
          type: "EXACT",
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
          isVerified: false,
          confidenceScore: undefined,
          oemReferenceIds: [],
          crossReferenceIds: [],
        });
        break;
    }
  };

  const populateFormByTab = (tab: TabType, item: any) => {
    switch (tab) {
      case "config":
        setConfigForm(item);
        break;
      case "rules":
        setRuleForm({
          id: item.id,
          type: item.type,
          level: item.level,
          priority: item.priority,
          requiresMake: item.requiresMake,
          requiresModel: item.requiresModel,
          requiresGeneration: item.requiresGeneration,
          requiresEngine: item.requiresEngine,
          requiresTrim: item.requiresTrim,
          requiresYear: item.requiresYear,
          allowYearRange: item.allowYearRange,
          strictMatching: item.strictMatching,
        });
        break;
      case "oem":
        setOemForm({
          id: item.id,
          manufacturer: item.manufacturer,
          partNumber: item.partNumber,
          description: item.description || "",
        });
        break;
      case "cross":
        setCrossForm({
          id: item.id,
          brand: item.brand,
          partNumber: item.partNumber,
          description: item.description || "",
        });
        break;
      case "fitments":
        setFitmentForm({
          id: item.id,
          productId: item.productId,
          level: item.level,
          type: item.type,
          makeId: item.makeId || "",
          modelId: item.modelId || "",
          generationId: item.generationId || "",
          engineId: item.engineId || "",
          trimId: item.trimId || "",
          yearStart: item.yearStart,
          yearEnd: item.yearEnd,
          notes: item.notes || "",
          position: item.position || "",
          quantityRequired: item.quantityRequired || 1,
          isUniversal: item.isUniversal || false,
          isVerified: item.isVerified || false,
          confidenceScore: item.confidenceScore,
          oemReferenceIds: item.oemReferences?.map((r: any) => r.oemReference?.id || r.oemReferenceId) || [],
          crossReferenceIds: item.crossReferences?.map((r: any) => r.crossReference?.id || r.crossReferenceId) || [],
        });
        break;
    }
  };

  const handleFormInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, setForm: Function) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev: any) => ({ ...prev, [name]: checked }));
      return;
    }
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  // Submit handlers
  const handleSubmitConfig = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      await updateConfig(configForm as UpdateFitmentServiceConfigDto).unwrap();
      closeModal();
      refetchConfig();
    } catch (err) {
      console.error(err);
      alert("Failed to update config");
    }
  };

  const handleSubmitRule = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await createRule(ruleForm as CreateFitmentTypeRuleDto).unwrap();
      } else {
        await updateRule({ id: ruleForm.id!, data: ruleForm as UpdateFitmentTypeRuleDto }).unwrap();
      }
      closeModal();
      refetchRules();
    } catch (err) {
      console.error(err);
      alert("Failed to save rule");
    }
  };

  const handleSubmitOem = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await createOem(oemForm as CreateOEMReferenceDto).unwrap();
      } else {
        await updateOem({ id: oemForm.id!, data: oemForm as UpdateOEMReferenceDto }).unwrap();
      }
      closeModal();
      refetchOem();
    } catch (err) {
      console.error(err);
      alert("Failed to save OEM reference");
    }
  };

  const handleSubmitCross = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await createCross(crossForm as CreateCrossReferenceDto).unwrap();
      } else {
        await updateCross({ id: crossForm.id!, data: crossForm as UpdateCrossReferenceDto }).unwrap();
      }
      closeModal();
      refetchCross();
    } catch (err) {
      console.error(err);
      alert("Failed to save cross reference");
    }
  };

  const handleSubmitFitment = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      const payload = { ...fitmentForm };
      payload.oemReferenceIds = payload.oemReferenceIds || [];
      payload.crossReferenceIds = payload.crossReferenceIds || [];

      if (modalMode === "create") {
        await createFitment(payload as CreateProductFitmentDto).unwrap();
      } else {
        await updateFitment({ id: fitmentForm.id!, data: payload as UpdateProductFitmentDto }).unwrap();
      }
      closeModal();
      refetchFitments();
    } catch (err) {
      console.error(err);
      alert("Failed to save fitment");
    }
  };

  const handleDelete = async (id: string, deleteFn: any, refetchFn: any) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteFn(id).unwrap();
      alert("Deleted successfully");
      refetchFn();
    } catch (err) {
      console.error(err);
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

  // Render tab content
  const renderConfigTab = () => (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Fitment Service Configuration</h2>
        <button
          onClick={() => openEditModal("config", configData)}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Edit Config
        </button>
      </div>
      {configData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4 bg-gray-50">
          <DetailRow label="Name" value={configData.name} />
          <DetailRow label="Description" value={configData.description} />
          <DetailRow label="Active" value={configData.isActive ? "Yes" : "No"} />
          <DetailRow label="Allow Universal Fallback" value={configData.allowUniversalFallback ? "Yes" : "No"} />
          <DetailRow label="Allow Cross Generation Match" value={configData.allowCrossGenerationMatch ? "Yes" : "No"} />
          <DetailRow label="Allow Engine Fallback" value={configData.allowEngineFallback ? "Yes" : "No"} />
          <DetailRow label="Weights: Make/Model/Gen/Engine/Trim/Year" value={`${configData.weightMake} / ${configData.weightModel} / ${configData.weightGeneration} / ${configData.weightEngine} / ${configData.weightTrim} / ${configData.weightYear}`} />
          <DetailRow label="Enable Indexing" value={configData.enableFitmentIndexing ? "Yes" : "No"} />
          <DetailRow label="Enable Text Search Fallback" value={configData.enableTextSearchFallback ? "Yes" : "No"} />
          <DetailRow label="Created At" value={configData.createdAt ? new Date(configData.createdAt).toLocaleString() : "-"} />
          <DetailRow label="Updated At" value={configData.updatedAt ? new Date(configData.updatedAt).toLocaleString() : "-"} />
        </div>
      ) : (
        <div className="text-center py-10">Loading config...</div>
      )}
    </div>
  );

  const renderRulesTab = () => (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Fitment Type Rules</h2>
        <button onClick={() => openCreateModal("rules")} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white">
          + Add Rule
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requires</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Strict</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rulesLoading && <tr><td colSpan={6} className="px-6 py-10 text-center">Loading...</td></tr>}
            {!rulesLoading && rulesData?.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center">No rules found</td></tr>}
            {!rulesLoading && rulesData?.map((rule: FitmentTypeRule) => (
              <tr key={rule.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{rule.type}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{rule.level}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{rule.priority}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {[
                    rule.requiresMake && "Make",
                    rule.requiresModel && "Model",
                    rule.requiresGeneration && "Generation",
                    rule.requiresEngine && "Engine",
                    rule.requiresTrim && "Trim",
                    rule.requiresYear && "Year",
                  ].filter(Boolean).join(", ") || "None"}
                </td>
                <td className="px-6 py-4 text-sm">{rule.strictMatching ? "Yes" : "No"}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openDetailModal("rules", rule.id)} className="text-indigo-600 hover:text-indigo-800 text-sm">View</button>
                  <button onClick={() => openEditModal("rules", rule)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                  <button onClick={() => handleDelete(rule.id, deleteRule, refetchRules)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOEMTab = () => (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">OEM References</h2>
        <button onClick={() => openCreateModal("oem")} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white">
          + Add OEM
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manufacturer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {oemLoading && <tr><td colSpan={4} className="px-6 py-10 text-center">Loading...</td></tr>}
            {!oemLoading && oemData?.length === 0 && <tr><td colSpan={4} className="px-6 py-10 text-center">No OEM references found</td></tr>}
            {!oemLoading && oemData?.map((oem: OEMReference) => (
              <tr key={oem.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{oem.manufacturer}</td>
                <td className="px-6 py-4 text-sm font-mono text-gray-600">{oem.partNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{oem.description || "-"}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openDetailModal("oem", oem.id)} className="text-indigo-600 hover:text-indigo-800 text-sm">View</button>
                  <button onClick={() => openEditModal("oem", oem)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                  <button onClick={() => handleDelete(oem.id, deleteOem, refetchOem)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCrossTab = () => (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Cross References</h2>
        <button onClick={() => openCreateModal("cross")} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white">
          + Add Cross Reference
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {crossLoading && <tr><td colSpan={4} className="px-6 py-10 text-center">Loading...</td></tr>}
            {!crossLoading && crossData?.length === 0 && <tr><td colSpan={4} className="px-6 py-10 text-center">No cross references found</td></tr>}
            {!crossLoading && crossData?.map((cross: CrossReference) => (
              <tr key={cross.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{cross.brand}</td>
                <td className="px-6 py-4 text-sm font-mono text-gray-600">{cross.partNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{cross.description || "-"}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openDetailModal("cross", cross.id)} className="text-indigo-600 hover:text-indigo-800 text-sm">View</button>
                  <button onClick={() => openEditModal("cross", cross)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                  <button onClick={() => handleDelete(cross.id, deleteCross, refetchCross)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFitmentsTab = () => (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-3 items-center">
          <h2 className="text-lg font-semibold text-gray-800">Product Fitments</h2>
          <input
            type="text"
            placeholder="Product ID"
            value={fitmentProductFilter}
            onChange={(e) => setFitmentProductFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          />
          <select value={fitmentMakeFilter} onChange={(e) => setFitmentMakeFilter(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm">
            <option value="">All Makes</option>
            {allMakes?.data?.map((make: VehicleMake) => <option key={make.id} value={make.id}>{make.name}</option>)}
          </select>
          <select value={fitmentModelFilter} onChange={(e) => setFitmentModelFilter(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm">
            <option value="">All Models</option>
            {allModels?.data?.map((model: VehicleModel) => <option key={model.id} value={model.id}>{model.name}</option>)}
          </select>
          <select value={fitmentGenFilter} onChange={(e) => setFitmentGenFilter(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm">
            <option value="">All Generations</option>
            {allGenerations?.data?.map((gen: VehicleGeneration) => <option key={gen.id} value={gen.id}>{gen.name}</option>)}
          </select>
        </div>
        <button onClick={() => openCreateModal("fitments")} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white">
          + Add Fitment
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Make/Model</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generation/Engine</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Years</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fitmentsLoading && <tr><td colSpan={8} className="px-6 py-10 text-center">Loading...</td></tr>}
            {!fitmentsLoading && fitmentsData?.items?.length === 0 && <tr><td colSpan={8} className="px-6 py-10 text-center">No fitments found</td></tr>}
            {!fitmentsLoading && fitmentsData?.items?.map((fitment: ProductFitment) => (
              <tr key={fitment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono text-gray-900">{fitment.productId}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{fitment.level}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{fitment.type}</td>
                <td className="px-6 py-4 text-sm">{fitment.make?.name || fitment.makeId || "-"} / {fitment.model?.name || fitment.modelId || "-"}</td>
                <td className="px-6 py-4 text-sm">{fitment.generation?.name || fitment.generationId || "-"} / {fitment.engine?.engineCode || fitment.engineId || "-"}</td>
                <td className="px-6 py-4 text-sm">{fitment.yearStart ?? "-"}{fitment.yearEnd ? ` - ${fitment.yearEnd}` : ""}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeColor(fitment.isVerified ?? true)}`}>
                    {fitment.isVerified ? "Verified" : "Unverified"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openDetailModal("fitments", fitment.id)} className="text-indigo-600 hover:text-indigo-800 text-sm">View</button>
                  <button onClick={() => openEditModal("fitments", fitment)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                  <button onClick={() => handleDelete(fitment.id, deleteFitment, refetchFitments)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {fitmentsData && (
        <div className="mt-4 flex justify-between items-center">
          <button onClick={() => setFitmentPage(p => Math.max(1, p-1))} disabled={fitmentPage <= 1} className="px-4 py-2 border rounded-md disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-600">Page {fitmentsData.page || fitmentPage} of {Math.ceil((fitmentsData.total || 0) / fitmentLimit) || 1}</span>
          <button onClick={() => setFitmentPage(p => p+1)} disabled={fitmentPage >= Math.ceil((fitmentsData.total || 0) / fitmentLimit)} className="px-4 py-2 border rounded-md disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );

  // Detail Modal
  const renderDetailModal = () => {
    if (!detailModalOpen || !detailTabType || !detailItemId) return null;

    let title = "";
    let content = null;

    switch (detailTabType) {
      case "rules": {
        const rule = rulesData?.find(r => r.id === detailItemId);
        title = "Rule Details";
        content = rule ? (
          <div className="space-y-3">
            <DetailRow label="ID" value={rule.id} />
            <DetailRow label="Type" value={rule.type} />
            <DetailRow label="Level" value={rule.level} />
            <DetailRow label="Priority" value={rule.priority} />
            <DetailRow label="Requires Make" value={rule.requiresMake ? "Yes" : "No"} />
            <DetailRow label="Requires Model" value={rule.requiresModel ? "Yes" : "No"} />
            <DetailRow label="Requires Generation" value={rule.requiresGeneration ? "Yes" : "No"} />
            <DetailRow label="Requires Engine" value={rule.requiresEngine ? "Yes" : "No"} />
            <DetailRow label="Requires Trim" value={rule.requiresTrim ? "Yes" : "No"} />
            <DetailRow label="Requires Year" value={rule.requiresYear ? "Yes" : "No"} />
            <DetailRow label="Allow Year Range" value={rule.allowYearRange ? "Yes" : "No"} />
            <DetailRow label="Strict Matching" value={rule.strictMatching ? "Yes" : "No"} />
            <DetailRow label="Created At" value={rule.createdAt ? new Date(rule.createdAt).toLocaleString() : "-"} />
          </div>
        ) : <div>Loading...</div>;
        break;
      }
      case "oem": {
        const oem = oemData?.find(o => o.id === detailItemId);
        title = "OEM Reference Details";
        content = oem ? (
          <div className="space-y-3">
            <DetailRow label="ID" value={oem.id} />
            <DetailRow label="Manufacturer" value={oem.manufacturer} />
            <DetailRow label="Part Number" value={oem.partNumber} />
            <DetailRow label="Description" value={oem.description} />
            <DetailRow label="Created At" value={oem.createdAt ? new Date(oem.createdAt).toLocaleString() : "-"} />
            <DetailRow label="Updated At" value={oem.updatedAt ? new Date(oem.updatedAt).toLocaleString() : "-"} />
          </div>
        ) : <div>Loading...</div>;
        break;
      }
      case "cross": {
        const cross = crossData?.find(c => c.id === detailItemId);
        title = "Cross Reference Details";
        content = cross ? (
          <div className="space-y-3">
            <DetailRow label="ID" value={cross.id} />
            <DetailRow label="Brand" value={cross.brand} />
            <DetailRow label="Part Number" value={cross.partNumber} />
            <DetailRow label="Description" value={cross.description} />
            <DetailRow label="Created At" value={cross.createdAt ? new Date(cross.createdAt).toLocaleString() : "-"} />
            <DetailRow label="Updated At" value={cross.updatedAt ? new Date(cross.updatedAt).toLocaleString() : "-"} />
          </div>
        ) : <div>Loading...</div>;
        break;
      }
      case "fitments": {
        const fitment = fitmentsData?.items?.find(f => f.id === detailItemId);
        title = "Product Fitment Details";
        content = fitment ? (
          <div className="space-y-3">
            <DetailRow label="ID" value={fitment.id} />
            <DetailRow label="Product ID" value={fitment.productId} />
            <DetailRow label="Level" value={fitment.level} />
            <DetailRow label="Type" value={fitment.type} />
            <DetailRow label="Make" value={fitment.make?.name || fitment.makeId || "-"} />
            <DetailRow label="Model" value={fitment.model?.name || fitment.modelId || "-"} />
            <DetailRow label="Generation" value={fitment.generation?.name || fitment.generationId || "-"} />
            <DetailRow label="Engine" value={fitment.engine?.engineCode || fitment.engineId || "-"} />
            <DetailRow label="Trim" value={fitment.trim?.name || fitment.trimId || "-"} />
            <DetailRow label="Year Range" value={fitment.yearStart ? `${fitment.yearStart}${fitment.yearEnd ? ` - ${fitment.yearEnd}` : "+"}` : "-"} />
            <DetailRow label="Notes" value={fitment.notes} />
            <DetailRow label="Position" value={fitment.position} />
            <DetailRow label="Quantity Required" value={fitment.quantityRequired} />
            <DetailRow label="Universal" value={fitment.isUniversal ? "Yes" : "No"} />
            <DetailRow label="Verified" value={fitment.isVerified ? "Yes" : "No"} />
            <DetailRow label="Confidence Score" value={fitment.confidenceScore} />
            <DetailRow label="OEM References" value={fitment.oemReferences?.map(r => `${r.oemReference?.manufacturer} ${r.oemReference?.partNumber}`).join(", ") || "-"} />
            <DetailRow label="Cross References" value={fitment.crossReferences?.map(r => `${r.crossReference?.brand} ${r.crossReference?.partNumber}`).join(", ") || "-"} />
            <DetailRow label="Created At" value={fitment.createdAt ? new Date(fitment.createdAt).toLocaleString() : "-"} />
            <DetailRow label="Updated At" value={fitment.updatedAt ? new Date(fitment.updatedAt).toLocaleString() : "-"} />
          </div>
        ) : <div>Loading...</div>;
        break;
      }
      default:
        return null;
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button onClick={closeDetailModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
          </div>
          <div className="p-6">{content}</div>
          <div className="flex justify-end p-6 pt-0">
            <button onClick={closeDetailModal} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Close</button>
          </div>
        </div>
      </div>
    );
  };

  // Create/Edit Modal
  const renderModal = () => {
    if (!modalOpen) return null;

    let title = "";
    let formContent = null;
    let onSubmit: (e: SyntheticEvent) => void = () => {};
    let isLoading = false;

    switch (activeTab) {
      case "config":
        title = "Edit Fitment Configuration";
        onSubmit = handleSubmitConfig;
        isLoading = updatingConfig;
        formContent = (
          <div className="space-y-4">
            <div><label className="block text-sm font-medium">Name</label><input name="name" value={configForm.name || ""} onChange={e => handleFormInput(e, setConfigForm)} className="mt-1 block w-full rounded-lg border px-3 py-2" /></div>
            <div><label className="block text-sm font-medium">Description</label><textarea name="description" value={configForm.description || ""} onChange={e => handleFormInput(e, setConfigForm)} className="mt-1 block w-full rounded-lg border px-3 py-2" /></div>
            <div className="flex items-center gap-2"><input type="checkbox" name="isActive" checked={configForm.isActive || false} onChange={e => handleFormInput(e, setConfigForm)} /><label>Active</label></div>
            <div className="flex items-center gap-2"><input type="checkbox" name="allowUniversalFallback" checked={configForm.allowUniversalFallback || false} onChange={e => handleFormInput(e, setConfigForm)} /><label>Allow Universal Fallback</label></div>
            <div className="flex items-center gap-2"><input type="checkbox" name="allowCrossGenerationMatch" checked={configForm.allowCrossGenerationMatch || false} onChange={e => handleFormInput(e, setConfigForm)} /><label>Allow Cross Generation Match</label></div>
            <div className="flex items-center gap-2"><input type="checkbox" name="allowEngineFallback" checked={configForm.allowEngineFallback || false} onChange={e => handleFormInput(e, setConfigForm)} /><label>Allow Engine Fallback</label></div>
            <div className="grid grid-cols-3 gap-2"><label className="col-span-1">Weight Make</label><input type="number" name="weightMake" value={configForm.weightMake || 100} onChange={e => handleFormInput(e, setConfigForm)} className="col-span-2 rounded border px-2 py-1" /></div>
            <div className="grid grid-cols-3 gap-2"><label className="col-span-1">Weight Model</label><input type="number" name="weightModel" value={configForm.weightModel || 200} onChange={e => handleFormInput(e, setConfigForm)} className="col-span-2 rounded border px-2 py-1" /></div>
            <div className="grid grid-cols-3 gap-2"><label className="col-span-1">Weight Generation</label><input type="number" name="weightGeneration" value={configForm.weightGeneration || 300} onChange={e => handleFormInput(e, setConfigForm)} className="col-span-2 rounded border px-2 py-1" /></div>
            <div className="grid grid-cols-3 gap-2"><label className="col-span-1">Weight Engine</label><input type="number" name="weightEngine" value={configForm.weightEngine || 400} onChange={e => handleFormInput(e, setConfigForm)} className="col-span-2 rounded border px-2 py-1" /></div>
            <div className="grid grid-cols-3 gap-2"><label className="col-span-1">Weight Trim</label><input type="number" name="weightTrim" value={configForm.weightTrim || 500} onChange={e => handleFormInput(e, setConfigForm)} className="col-span-2 rounded border px-2 py-1" /></div>
            <div className="grid grid-cols-3 gap-2"><label className="col-span-1">Weight Year</label><input type="number" name="weightYear" value={configForm.weightYear || 250} onChange={e => handleFormInput(e, setConfigForm)} className="col-span-2 rounded border px-2 py-1" /></div>
          </div>
        );
        break;
      case "rules":
        title = `${modalMode === "create" ? "Create" : "Edit"} Rule`;
        onSubmit = handleSubmitRule;
        isLoading = creatingRule || updatingRule;
        formContent = (
          <div className="space-y-4">
            <div><label className="block text-sm font-medium">Type</label><select name="type" value={ruleForm.type} onChange={e => handleFormInput(e, setRuleForm)} className="mt-1 block w-full rounded border px-3 py-2"><option value="UNIVERSAL">Universal</option><option value="EXACT">Exact</option><option value="RANGE">Range</option><option value="ENGINE_SPECIFIC">Engine Specific</option><option value="TRIM_SPECIFIC">Trim Specific</option><option value="OEM_MATCH">OEM Match</option><option value="CROSS_REFERENCE">Cross Reference</option><option value="GENERATION_ONLY">Generation Only</option></select></div>
            <div><label className="block text-sm font-medium">Level</label><select name="level" value={ruleForm.level} onChange={e => handleFormInput(e, setRuleForm)} className="mt-1 block w-full rounded border px-3 py-2"><option value="GLOBAL">Global</option><option value="MAKE">Make</option><option value="MODEL">Model</option><option value="GENERATION">Generation</option><option value="ENGINE">Engine</option><option value="TRIM">Trim</option><option value="EXACT_MATCH">Exact Match</option></select></div>
            <div><label className="block text-sm font-medium">Priority</label><input type="number" name="priority" value={ruleForm.priority || 0} onChange={e => handleFormInput(e, setRuleForm)} className="mt-1 block w-full rounded border px-3 py-2" /></div>
            <div className="flex flex-wrap gap-4"><label className="flex items-center gap-1"><input type="checkbox" name="requiresMake" checked={ruleForm.requiresMake} onChange={e => handleFormInput(e, setRuleForm)} /> Requires Make</label><label className="flex items-center gap-1"><input type="checkbox" name="requiresModel" checked={ruleForm.requiresModel} onChange={e => handleFormInput(e, setRuleForm)} /> Requires Model</label><label className="flex items-center gap-1"><input type="checkbox" name="requiresGeneration" checked={ruleForm.requiresGeneration} onChange={e => handleFormInput(e, setRuleForm)} /> Requires Generation</label><label className="flex items-center gap-1"><input type="checkbox" name="requiresEngine" checked={ruleForm.requiresEngine} onChange={e => handleFormInput(e, setRuleForm)} /> Requires Engine</label><label className="flex items-center gap-1"><input type="checkbox" name="requiresTrim" checked={ruleForm.requiresTrim} onChange={e => handleFormInput(e, setRuleForm)} /> Requires Trim</label><label className="flex items-center gap-1"><input type="checkbox" name="requiresYear" checked={ruleForm.requiresYear} onChange={e => handleFormInput(e, setRuleForm)} /> Requires Year</label></div>
            <div className="flex items-center gap-4"><label className="flex items-center gap-1"><input type="checkbox" name="allowYearRange" checked={ruleForm.allowYearRange} onChange={e => handleFormInput(e, setRuleForm)} /> Allow Year Range</label><label className="flex items-center gap-1"><input type="checkbox" name="strictMatching" checked={ruleForm.strictMatching} onChange={e => handleFormInput(e, setRuleForm)} /> Strict Matching</label></div>
          </div>
        );
        break;
      case "oem":
        title = `${modalMode === "create" ? "Create" : "Edit"} OEM Reference`;
        onSubmit = handleSubmitOem;
        isLoading = creatingOem || updatingOem;
        formContent = (
          <div className="space-y-4">
            <div><label className="block text-sm font-medium">Manufacturer *</label><input name="manufacturer" value={oemForm.manufacturer} onChange={e => handleFormInput(e, setOemForm)} className="mt-1 block w-full rounded border px-3 py-2" required /></div>
            <div><label className="block text-sm font-medium">Part Number *</label><input name="partNumber" value={oemForm.partNumber} onChange={e => handleFormInput(e, setOemForm)} className="mt-1 block w-full rounded border px-3 py-2" required /></div>
            <div><label className="block text-sm font-medium">Description</label><textarea name="description" value={oemForm.description} onChange={e => handleFormInput(e, setOemForm)} className="mt-1 block w-full rounded border px-3 py-2" /></div>
          </div>
        );
        break;
      case "cross":
        title = `${modalMode === "create" ? "Create" : "Edit"} Cross Reference`;
        onSubmit = handleSubmitCross;
        isLoading = creatingCross || updatingCross;
        formContent = (
          <div className="space-y-4">
            <div><label className="block text-sm font-medium">Brand *</label><input name="brand" value={crossForm.brand} onChange={e => handleFormInput(e, setCrossForm)} className="mt-1 block w-full rounded border px-3 py-2" required /></div>
            <div><label className="block text-sm font-medium">Part Number *</label><input name="partNumber" value={crossForm.partNumber} onChange={e => handleFormInput(e, setCrossForm)} className="mt-1 block w-full rounded border px-3 py-2" required /></div>
            <div><label className="block text-sm font-medium">Description</label><textarea name="description" value={crossForm.description} onChange={e => handleFormInput(e, setCrossForm)} className="mt-1 block w-full rounded border px-3 py-2" /></div>
          </div>
        );
        break;
      case "fitments":
        title = `${modalMode === "create" ? "Create" : "Edit"} Product Fitment`;
        onSubmit = handleSubmitFitment;
        isLoading = creatingFitment || updatingFitment;
        formContent = (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div><label className="block text-sm font-medium">Product ID *</label><input name="productId" value={fitmentForm.productId} onChange={e => handleFormInput(e, setFitmentForm)} className="mt-1 block w-full rounded border px-3 py-2" required /></div>
            <div className="grid grid-cols-2 gap-4"><div><label>Level</label><select name="level" value={fitmentForm.level} onChange={e => handleFormInput(e, setFitmentForm)} className="mt-1 block w-full rounded border px-3 py-2"><option value="GLOBAL">Global</option><option value="MAKE">Make</option><option value="MODEL">Model</option><option value="GENERATION">Generation</option><option value="ENGINE">Engine</option><option value="TRIM">Trim</option><option value="EXACT_MATCH">Exact Match</option></select></div><div><label>Type</label><select name="type" value={fitmentForm.type} onChange={e => handleFormInput(e, setFitmentForm)} className="mt-1 block w-full rounded border px-3 py-2"><option value="UNIVERSAL">Universal</option><option value="EXACT">Exact</option><option value="RANGE">Range</option><option value="ENGINE_SPECIFIC">Engine Specific</option><option value="TRIM_SPECIFIC">Trim Specific</option><option value="OEM_MATCH">OEM Match</option><option value="CROSS_REFERENCE">Cross Reference</option><option value="GENERATION_ONLY">Generation Only</option></select></div></div>
            <div className="grid grid-cols-2 gap-4"><div><label>Make</label><select name="makeId" value={fitmentForm.makeId} onChange={e => handleFormInput(e, setFitmentForm)} className="mt-1 block w-full rounded border px-3 py-2"><option value="">Select</option>{allMakes?.data?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div><div><label>Model</label><select name="modelId" value={fitmentForm.modelId} onChange={e => handleFormInput(e, setFitmentForm)} className="mt-1 block w-full rounded border px-3 py-2"><option value="">Select</option>{allModels?.data?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div></div>
            <div className="grid grid-cols-2 gap-4"><div><label>Generation</label><select name="generationId" value={fitmentForm.generationId} onChange={e => handleFormInput(e, setFitmentForm)} className="mt-1 block w-full rounded border px-3 py-2"><option value="">Select</option>{allGenerations?.data?.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div><div><label>Engine</label><select name="engineId" value={fitmentForm.engineId} onChange={e => handleFormInput(e, setFitmentForm)} className="mt-1 block w-full rounded border px-3 py-2"><option value="">Select</option>{allEngines?.data?.map(e => <option key={e.id} value={e.id}>{e.engineCode}</option>)}</select></div></div>
            <div><label>Trim</label><select name="trimId" value={fitmentForm.trimId} onChange={e => handleFormInput(e, setFitmentForm)} className="mt-1 block w-full rounded border px-3 py-2"><option value="">Select</option>{allTrims?.data?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-4"><div><label>Year Start</label><input type="number" name="yearStart" value={fitmentForm.yearStart || ""} onChange={e => handleFormInput(e, setFitmentForm)} className="rounded border px-3 py-2 w-full" /></div><div><label>Year End</label><input type="number" name="yearEnd" value={fitmentForm.yearEnd || ""} onChange={e => handleFormInput(e, setFitmentForm)} className="rounded border px-3 py-2 w-full" /></div></div>
            <div><label>Notes</label><textarea name="notes" value={fitmentForm.notes} onChange={e => handleFormInput(e, setFitmentForm)} className="mt-1 block w-full rounded border px-3 py-2" /></div>
            <div><label>Position</label><input name="position" value={fitmentForm.position} onChange={e => handleFormInput(e, setFitmentForm)} className="mt-1 block w-full rounded border px-3 py-2" /></div>
            <div><label>Quantity Required</label><input type="number" name="quantityRequired" value={fitmentForm.quantityRequired || 1} onChange={e => handleFormInput(e, setFitmentForm)} className="mt-1 block w-full rounded border px-3 py-2" /></div>
            <div className="flex gap-4"><label className="flex items-center gap-1"><input type="checkbox" name="isUniversal" checked={fitmentForm.isUniversal} onChange={e => handleFormInput(e, setFitmentForm)} /> Universal</label><label className="flex items-center gap-1"><input type="checkbox" name="isVerified" checked={fitmentForm.isVerified} onChange={e => handleFormInput(e, setFitmentForm)} /> Verified</label></div>
            <div><label>Confidence Score (0-100)</label><input type="number" name="confidenceScore" value={fitmentForm.confidenceScore || ""} onChange={e => handleFormInput(e, setFitmentForm)} className="mt-1 block w-full rounded border px-3 py-2" /></div>
            <div><label>OEM References (multi-select)</label><select multiple name="oemReferenceIds" value={fitmentForm.oemReferenceIds} onChange={e => { const values = Array.from(e.target.selectedOptions, opt => opt.value); setFitmentForm(prev => ({ ...prev, oemReferenceIds: values })); }} className="mt-1 block w-full rounded border px-3 py-2 h-24">{oemData?.map(o => <option key={o.id} value={o.id}>{o.manufacturer} {o.partNumber}</option>)}</select></div>
            <div><label>Cross References (multi-select)</label><select multiple name="crossReferenceIds" value={fitmentForm.crossReferenceIds} onChange={e => { const values = Array.from(e.target.selectedOptions, opt => opt.value); setFitmentForm(prev => ({ ...prev, crossReferenceIds: values })); }} className="mt-1 block w-full rounded border px-3 py-2 h-24">{crossData?.map(c => <option key={c.id} value={c.id}>{c.brand} {c.partNumber}</option>)}</select></div>
          </div>
        );
        break;
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
          </div>
          <form onSubmit={onSubmit} className="p-6">
            {formContent}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-lg text-gray-700">Cancel</button>
              <button type="submit" disabled={isLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">{isLoading ? "Saving..." : (modalMode === "create" ? "Create" : "Update")}</button>
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">🔧 Fitment System Admin</h1>
          <p className="mt-1 text-sm text-gray-500">Manage fitment configuration, rules, OEM/cross references, and product fitments.</p>
        </div>

        <div className="border-b border-gray-200 bg-white rounded-t-2xl px-4 pt-2">
          <nav className="-mb-px flex gap-6">
            {(["config", "rules", "oem", "cross", "fitments"] as TabType[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`py-3 px-1 text-sm font-medium border-b-2 transition ${activeTab === tab ? "border-green-500 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                {tab === "config" ? "Configuration" : tab === "rules" ? "Rules" : tab === "oem" ? "OEM References" : tab === "cross" ? "Cross References" : "Product Fitments"}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white rounded-b-2xl rounded-tr-2xl p-6 shadow-sm">
          {activeTab === "config" && renderConfigTab()}
          {activeTab === "rules" && renderRulesTab()}
          {activeTab === "oem" && renderOEMTab()}
          {activeTab === "cross" && renderCrossTab()}
          {activeTab === "fitments" && renderFitmentsTab()}
        </div>
      </div>
      {renderModal()}
      {renderDetailModal()}
    </div>
  );
};

export default AdminFitment;