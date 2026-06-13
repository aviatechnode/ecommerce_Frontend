import React, { useState, useEffect } from 'react';

import { useGetProductsQuery } from '../../services/productApi';
import {
  useGetConfigsQuery,
  useCreateConfigMutation,
  useUpdateConfigMutation,
  useDeleteConfigMutation,
  useGetRulesQuery,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
  useGetProductFitmentsQuery,
  useCreateProductFitmentMutation,
  useUpdateProductFitmentMutation,
  useDeleteProductFitmentMutation,
  useGetProductIndexQuery,
  useGetLogsQuery,
} from '../../services/fitmentApi';

import {
  useGetMakesQuery,
  useGetModelsQuery,
  useGetGenerationsQuery,
  useGetEnginesQuery,
  useGetTrimsQuery,
} from '../../services/vehicleApi';

// Types (adjust paths to your actual types)
type FitmentLevel = 'EXACT' | 'UPSELL' | 'CROSSSELL';
type FitmentType = 'EXACT' | 'ALTERNATIVE' | 'UNIVERSAL';

interface FitmentConfig {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  allowUniversalFallback: boolean;
  allowCrossGenerationMatch: boolean;
  allowEngineFallback: boolean;
  weightMake: number;
  weightModel: number;
  weightGeneration: number;
  weightEngine: number;
  weightTrim: number;
  weightYear: number;
  enableFitmentIndexing: boolean;
  enableTextSearchFallback: boolean;
}

interface FitmentRule {
  id: string;
  type: FitmentType;
  level: FitmentLevel;
  requiresMake: boolean;
  requiresModel: boolean;
  requiresGeneration: boolean;
  requiresEngine: boolean;
  requiresTrim: boolean;
  requiresYear: boolean;
  allowYearRange: boolean;
  strictMatching: boolean;
  priority: number;
}

interface ProductFitment {
  id: string;
  productId: string;
  level: FitmentLevel;
  type: FitmentType;
  makeId?: string;
  modelId?: string;
  generationId?: string;
  engineId?: string;
  trimId?: string;
  yearStart?: number;
  yearEnd?: number;
  notes?: string;
  position?: string;
  quantityRequired?: number;
  isUniversal: boolean;
  isVerified: boolean;
  confidenceScore?: number;
  // joined relations
  make?: { id: string; name: string };
  model?: { id: string; name: string };
  generation?: { id: string; name: string };
  engine?: { id: string; name: string };
  trim?: { id: string; name: string };
}

// ----------------------------------------------------------------------
// Helper components (Cascading vehicle selects)
// ----------------------------------------------------------------------
interface VehicleSelectorProps {
  selectedMakeId: string;
  onMakeChange: (makeId: string) => void;
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  selectedGenerationId: string;
  onGenerationChange: (generationId: string) => void;
  selectedEngineId: string;
  onEngineChange: (engineId: string) => void;
  selectedTrimId: string;
  onTrimChange: (trimId: string) => void;
  required?: boolean;
  className?: string;
}

const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  selectedMakeId,
  onMakeChange,
  selectedModelId,
  onModelChange,
  selectedGenerationId,
  onGenerationChange,
  selectedEngineId,
  onEngineChange,
  selectedTrimId,
  onTrimChange,
  required = false,
  className = '',
}) => {
  const { data: makes = [] } = useGetMakesQuery();
  const { data: models = [] } = useGetModelsQuery(selectedMakeId || undefined);
  const { data: generations = [] } = useGetGenerationsQuery(selectedModelId || undefined);
  const { data: engines = [] } = useGetEnginesQuery(selectedGenerationId || undefined);
  const { data: trims = [] } = useGetTrimsQuery(selectedEngineId || undefined);

  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-5 ${className}`}>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Make {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={selectedMakeId || ''}
          onChange={(e) => onMakeChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring-green-200"
        >
          <option value="">Select Make</option>
          {makes.map((make: any) => (
            <option key={make.id} value={make.id}>{make.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Model</label>
        <select
          value={selectedModelId || ''}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={!selectedMakeId}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm disabled:bg-gray-100"
        >
          <option value="">Select Model</option>
          {models.map((model: any) => (
            <option key={model.id} value={model.id}>{model.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Generation</label>
        <select
          value={selectedGenerationId || ''}
          onChange={(e) => onGenerationChange(e.target.value)}
          disabled={!selectedModelId}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm disabled:bg-gray-100"
        >
          <option value="">Select Generation</option>
          {generations.map((gen: any) => (
            <option key={gen.id} value={gen.id}>{gen.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Engine</label>
        <select
          value={selectedEngineId || ''}
          onChange={(e) => onEngineChange(e.target.value)}
          disabled={!selectedGenerationId}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm disabled:bg-gray-100"
        >
          <option value="">Select Engine</option>
          {engines.map((eng: any) => (
            <option key={eng.id} value={eng.id}>{eng.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Trim</label>
        <select
          value={selectedTrimId || ''}
          onChange={(e) => onTrimChange(e.target.value)}
          disabled={!selectedEngineId}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm disabled:bg-gray-100"
        >
          <option value="">Select Trim</option>
          {trims.map((trim: any) => (
            <option key={trim.id} value={trim.id}>{trim.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Main Admin Component
// ----------------------------------------------------------------------
const AdminFitmentSystem: React.FC = () => {
  // Active tab
  const [activeTab, setActiveTab] = useState<'configs' | 'rules' | 'fitments' | 'index' | 'logs'>('configs');

  // Product selector (for fitments, index, logs)
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const { data: products = [] } = useGetProductsQuery();

  // --------------------------------------------------------------------
  // CONFIGS
  // --------------------------------------------------------------------
  const { data: configs = [], refetch: refetchConfigs } = useGetConfigsQuery();
  const [createConfig, { isLoading: creatingConfig }] = useCreateConfigMutation();
  const [updateConfig] = useUpdateConfigMutation();
  const [deleteConfig] = useDeleteConfigMutation();
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<FitmentConfig | null>(null);

  const emptyConfig = (): FitmentConfig => ({
    id: '',
    name: '',
    description: '',
    isActive: true,
    allowUniversalFallback: true,
    allowCrossGenerationMatch: false,
    allowEngineFallback: false,
    weightMake: 100,
    weightModel: 200,
    weightGeneration: 300,
    weightEngine: 400,
    weightTrim: 500,
    weightYear: 250,
    enableFitmentIndexing: true,
    enableTextSearchFallback: true,
  });

  const [configForm, setConfigForm] = useState<FitmentConfig>(emptyConfig());

  const handleConfigSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      if (editingConfig) {
        await updateConfig({ id: editingConfig.id, data: configForm }).unwrap();
      } else {
        await createConfig(configForm).unwrap();
      }
      refetchConfigs();
      setShowConfigForm(false);
      setEditingConfig(null);
      setConfigForm(emptyConfig());
    } catch (err) {
      console.error(err);
      alert('Failed to save config');
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (!confirm('Delete this configuration?')) return;
    try {
      await deleteConfig(id).unwrap();
      refetchConfigs();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  // --------------------------------------------------------------------
  // RULES
  // --------------------------------------------------------------------
  const { data: rules = [], refetch: refetchRules } = useGetRulesQuery();
  const [createRule, { isLoading: creatingRule }] = useCreateRuleMutation();
  const [updateRule] = useUpdateRuleMutation();
  const [deleteRule] = useDeleteRuleMutation();
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<FitmentRule | null>(null);

  const emptyRule = (): FitmentRule => ({
    id: '',
    type: 'EXACT',
    level: 'EXACT',
    requiresMake: false,
    requiresModel: false,
    requiresGeneration: false,
    requiresEngine: false,
    requiresTrim: false,
    requiresYear: false,
    allowYearRange: true,
    strictMatching: false,
    priority: 0,
  });

  const [ruleForm, setRuleForm] = useState<FitmentRule>(emptyRule());

  const handleRuleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      if (editingRule) {
        await updateRule({ id: editingRule.id, data: ruleForm }).unwrap();
      } else {
        await createRule(ruleForm).unwrap();
      }
      refetchRules();
      setShowRuleForm(false);
      setEditingRule(null);
      setRuleForm(emptyRule());
    } catch (err) {
      console.error(err);
      alert('Failed to save rule');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Delete this rule?')) return;
    try {
      await deleteRule(id).unwrap();
      refetchRules();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  // --------------------------------------------------------------------
  // PRODUCT FITMENTS
  // --------------------------------------------------------------------
  const {
    data: fitments = [],
    refetch: refetchFitments,
  } = useGetProductFitmentsQuery(selectedProductId, { skip: !selectedProductId });
  const [createFitment] = useCreateProductFitmentMutation();
  const [updateFitment] = useUpdateProductFitmentMutation();
  const [deleteFitment] = useDeleteProductFitmentMutation();
  const [showFitmentForm, setShowFitmentForm] = useState(false);
  const [editingFitment, setEditingFitment] = useState<ProductFitment | null>(null);

  const emptyFitment = (): Partial<ProductFitment> => ({
    level: 'EXACT',
    type: 'EXACT',
    isUniversal: false,
    isVerified: false,
    quantityRequired: 1,
  });

  const [fitmentForm, setFitmentForm] = useState<Partial<ProductFitment>>(emptyFitment());

  const handleFitmentSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      alert('Please select a product first');
      return;
    }
    const payload = {
      ...fitmentForm,
      productId: selectedProductId,
    };
    try {
      if (editingFitment) {
        await updateFitment({ id: editingFitment.id, data: payload }).unwrap();
      } else {
        await createFitment(payload).unwrap();
      }
      refetchFitments();
      setShowFitmentForm(false);
      setEditingFitment(null);
      setFitmentForm(emptyFitment());
    } catch (err) {
      console.error(err);
      alert('Failed to save fitment');
    }
  };

  const handleDeleteFitment = async (id: string) => {
    if (!confirm('Remove this fitment?')) return;
    try {
      await deleteFitment(id).unwrap();
      refetchFitments();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  // Reset fitment form when editing changes
  useEffect(() => {
    if (editingFitment) {
      setFitmentForm(editingFitment);
    } else {
      setFitmentForm(emptyFitment());
    }
  }, [editingFitment]);

  // --------------------------------------------------------------------
  // INDEX & LOGS (readonly)
  // --------------------------------------------------------------------
  const { data: indexEntries = [] } = useGetProductIndexQuery(selectedProductId, { skip: !selectedProductId });
  const { data: logs = [] } = useGetLogsQuery(selectedProductId || undefined);

  // --------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">🔧 Fitment System</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage configurations, rules, product fitments, indexes, and resolution logs.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 bg-white px-4 pt-2 shadow-sm">
          {(['configs', 'rules', 'fitments', 'index', 'logs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-t-lg px-5 py-2.5 text-sm font-medium transition ${
                activeTab === tab
                  ? 'border-b-2 border-green-600 text-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Product selector (visible for fitments, index, logs) */}
        {(activeTab === 'fitments' || activeTab === 'index' || activeTab === 'logs') && (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <label className="mb-1 block text-sm font-medium text-gray-700">Select Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm"
            >
              <option value="">-- Choose a product --</option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} (SKU: {p.sku || p.id})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ============================ CONFIGS ============================ */}
        {activeTab === 'configs' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setEditingConfig(null);
                  setConfigForm(emptyConfig());
                  setShowConfigForm(!showConfigForm);
                }}
                className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
              >
                {showConfigForm ? '✖ Cancel' : '+ New Config'}
              </button>
            </div>

            {showConfigForm && (
              <form onSubmit={handleConfigSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                <h2 className="text-xl font-semibold">{editingConfig ? 'Edit Config' : 'Create Config'}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Name *"
                    value={configForm.name}
                    onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })}
                    className="rounded-lg border border-gray-300 px-4 py-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={configForm.description || ''}
                    onChange={(e) => setConfigForm({ ...configForm, description: e.target.value })}
                    className="rounded-lg border border-gray-300 px-4 py-2"
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={configForm.isActive}
                      onChange={(e) => setConfigForm({ ...configForm, isActive: e.target.checked })}
                    /> Active
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={configForm.allowUniversalFallback}
                      onChange={(e) => setConfigForm({ ...configForm, allowUniversalFallback: e.target.checked })}
                    /> Universal Fallback
                  </label>
                  {/* Add other checkboxes and weight fields as needed – concise for brevity */}
                </div>
                <div className="mt-6 flex gap-3">
                  <button type="submit" disabled={creatingConfig} className="rounded-lg bg-green-600 px-6 py-2 text-white">
                    Save
                  </button>
                  <button type="button" onClick={() => setShowConfigForm(false)} className="rounded-lg border px-6 py-2">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Active</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Universal Fallback</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((cfg: FitmentConfig) => (
                    <tr key={cfg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{cfg.name}</td>
                      <td className="px-6 py-4 text-sm">{cfg.isActive ? '✅' : '❌'}</td>
                      <td className="px-6 py-4 text-sm">{cfg.allowUniversalFallback ? 'Yes' : 'No'}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingConfig(cfg);
                            setConfigForm(cfg);
                            setShowConfigForm(true);
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeleteConfig(cfg.id)} className="text-red-600 hover:underline">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================ RULES ============================ */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setEditingRule(null);
                  setRuleForm(emptyRule());
                  setShowRuleForm(!showRuleForm);
                }}
                className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                {showRuleForm ? '✖ Cancel' : '+ New Rule'}
              </button>
            </div>

            {showRuleForm && (
              <form onSubmit={handleRuleSubmit} className="rounded-2xl border bg-white p-6 shadow-lg">
                <h2 className="text-xl font-semibold">{editingRule ? 'Edit Rule' : 'Create Rule'}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <select
                    value={ruleForm.type}
                    onChange={(e) => setRuleForm({ ...ruleForm, type: e.target.value as FitmentType })}
                    className="rounded-lg border p-2"
                  >
                    <option value="EXACT">EXACT</option>
                    <option value="ALTERNATIVE">ALTERNATIVE</option>
                    <option value="UNIVERSAL">UNIVERSAL</option>
                  </select>
                  <select
                    value={ruleForm.level}
                    onChange={(e) => setRuleForm({ ...ruleForm, level: e.target.value as FitmentLevel })}
                    className="rounded-lg border p-2"
                  >
                    <option value="EXACT">EXACT</option>
                    <option value="UPSELL">UPSELL</option>
                    <option value="CROSSSELL">CROSSSELL</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Priority"
                    value={ruleForm.priority}
                    onChange={(e) => setRuleForm({ ...ruleForm, priority: parseInt(e.target.value) || 0 })}
                    className="rounded-lg border p-2"
                  />
                  {/* Add checkbox fields for requiresMake, etc. */}
                </div>
                <div className="mt-6 flex gap-3">
                  <button type="submit" disabled={creatingRule} className="rounded-lg bg-green-600 px-6 py-2 text-white">
                    Save
                  </button>
                  <button type="button" onClick={() => setShowRuleForm(false)} className="rounded-lg border px-6 py-2">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-hidden rounded-2xl border bg-white">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium">Priority</th>
                    <th className="px-6 py-3 text-right text-xs font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule: FitmentRule) => (
                    <tr key={rule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{rule.type}</td>
                      <td className="px-6 py-4 text-sm">{rule.level}</td>
                      <td className="px-6 py-4 text-sm">{rule.priority}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingRule(rule);
                            setRuleForm(rule);
                            setShowRuleForm(true);
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeleteRule(rule.id)} className="text-red-600 hover:underline">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================ PRODUCT FITMENTS ============================ */}
        {activeTab === 'fitments' && (
          <div className="space-y-4">
            {!selectedProductId ? (
              <div className="rounded-xl bg-yellow-50 p-4 text-yellow-800">Please select a product above.</div>
            ) : (
              <>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setEditingFitment(null);
                      setFitmentForm(emptyFitment());
                      setShowFitmentForm(!showFitmentForm);
                    }}
                    className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    {showFitmentForm ? '✖ Cancel' : '+ Add Fitment'}
                  </button>
                </div>

                {showFitmentForm && (
                  <form onSubmit={handleFitmentSubmit} className="rounded-2xl border bg-white p-6 shadow-lg">
                    <h2 className="text-xl font-semibold">{editingFitment ? 'Edit Fitment' : 'New Fitment'}</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <select
                        value={fitmentForm.level}
                        onChange={(e) => setFitmentForm({ ...fitmentForm, level: e.target.value as FitmentLevel })}
                        className="rounded-lg border p-2"
                      >
                        <option value="EXACT">EXACT</option>
                        <option value="UPSELL">UPSELL</option>
                        <option value="CROSSSELL">CROSSSELL</option>
                      </select>
                      <select
                        value={fitmentForm.type}
                        onChange={(e) => setFitmentForm({ ...fitmentForm, type: e.target.value as FitmentType })}
                        className="rounded-lg border p-2"
                      >
                        <option value="EXACT">EXACT</option>
                        <option value="ALTERNATIVE">ALTERNATIVE</option>
                        <option value="UNIVERSAL">UNIVERSAL</option>
                      </select>
                      <div className="col-span-2">
                        <VehicleSelector
                          selectedMakeId={fitmentForm.makeId || ''}
                          onMakeChange={(makeId) => setFitmentForm({ ...fitmentForm, makeId })}
                          selectedModelId={fitmentForm.modelId || ''}
                          onModelChange={(modelId) => setFitmentForm({ ...fitmentForm, modelId })}
                          selectedGenerationId={fitmentForm.generationId || ''}
                          onGenerationChange={(genId) => setFitmentForm({ ...fitmentForm, generationId: genId })}
                          selectedEngineId={fitmentForm.engineId || ''}
                          onEngineChange={(engId) => setFitmentForm({ ...fitmentForm, engineId: engId })}
                          selectedTrimId={fitmentForm.trimId || ''}
                          onTrimChange={(trimId) => setFitmentForm({ ...fitmentForm, trimId })}
                        />
                      </div>
                      <div className="flex gap-4">
                        <input
                          type="number"
                          placeholder="Year Start"
                          value={fitmentForm.yearStart || ''}
                          onChange={(e) => setFitmentForm({ ...fitmentForm, yearStart: parseInt(e.target.value) || undefined })}
                          className="rounded-lg border p-2"
                        />
                        <input
                          type="number"
                          placeholder="Year End"
                          value={fitmentForm.yearEnd || ''}
                          onChange={(e) => setFitmentForm({ ...fitmentForm, yearEnd: parseInt(e.target.value) || undefined })}
                          className="rounded-lg border p-2"
                        />
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={fitmentForm.isUniversal || false}
                          onChange={(e) => setFitmentForm({ ...fitmentForm, isUniversal: e.target.checked })}
                        /> Universal
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={fitmentForm.isVerified || false}
                          onChange={(e) => setFitmentForm({ ...fitmentForm, isVerified: e.target.checked })}
                        /> Verified
                      </label>
                      <textarea
                        placeholder="Notes"
                        value={fitmentForm.notes || ''}
                        onChange={(e) => setFitmentForm({ ...fitmentForm, notes: e.target.value })}
                        className="col-span-2 rounded-lg border p-2"
                        rows={2}
                      />
                    </div>
                    <div className="mt-6 flex gap-3">
                      <button type="submit" className="rounded-lg bg-green-600 px-6 py-2 text-white">
                        Save
                      </button>
                      <button type="button" onClick={() => setShowFitmentForm(false)} className="rounded-lg border px-6 py-2">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="overflow-hidden rounded-2xl border bg-white">
                  <table className="min-w-full divide-y">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium">Level/Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium">Vehicle</th>
                        <th className="px-6 py-3 text-left text-xs font-medium">Years</th>
                        <th className="px-6 py-3 text-left text-xs font-medium">Universal</th>
                        <th className="px-6 py-3 text-right text-xs font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fitments.map((f: ProductFitment) => (
                        <tr key={f.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm">{f.level}/{f.type}</td>
                          <td className="px-6 py-4 text-sm">
                            {f.make?.name} {f.model?.name} {f.generation?.name} {f.engine?.name} {f.trim?.name}
                          </td>
                          <td className="px-6 py-4 text-sm">{f.yearStart}{f.yearEnd ? `-${f.yearEnd}` : ''}</td>
                          <td className="px-6 py-4 text-sm">{f.isUniversal ? 'Yes' : 'No'}</td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button onClick={() => { setEditingFitment(f); setShowFitmentForm(true); }} className="text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => handleDeleteFitment(f.id)} className="text-red-600 hover:underline">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================ INDEX ============================ */}
        {activeTab === 'index' && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            {!selectedProductId ? (
              <div className="text-yellow-800">Select a product to see its fitment index.</div>
            ) : indexEntries.length === 0 ? (
              <div className="text-gray-500">No index entries for this product.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Make</th>
                      <th className="px-4 py-2 text-left">Model</th>
                      <th className="px-4 py-2 text-left">Generation</th>
                      <th className="px-4 py-2 text-left">Engine</th>
                      <th className="px-4 py-2 text-left">Trim</th>
                      <th className="px-4 py-2 text-left">Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indexEntries.map((entry: any) => (
                      <tr key={entry.id}>
                        <td className="px-4 py-2">{entry.make}</td>
                        <td className="px-4 py-2">{entry.model}</td>
                        <td className="px-4 py-2">{entry.generation}</td>
                        <td className="px-4 py-2">{entry.engineCode}</td>
                        <td className="px-4 py-2">{entry.trim}</td>
                        <td className="px-4 py-2">{entry.year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============================ LOGS ============================ */}
        {activeTab === 'logs' && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            {!selectedProductId ? (
              <div className="text-yellow-800">Select a product to view its resolution logs.</div>
            ) : logs.length === 0 ? (
              <div className="text-gray-500">No logs found.</div>
            ) : (
              <div className="space-y-3">
                {logs.map((log: any) => (
                  <div key={log.id} className="rounded-lg border-l-4 border-gray-200 bg-gray-50 p-4">
                    <div className="flex justify-between">
                      <span className="font-mono text-sm">{new Date(log.createdAt).toLocaleString()}</span>
                      <span className={`text-xs font-semibold ${log.matched ? 'text-green-700' : 'text-red-600'}`}>
                        {log.matched ? 'Matched' : 'No match'}
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <div><strong>Input:</strong> {log.inputMake} {log.inputModel} {log.inputGeneration} {log.inputEngine} {log.inputTrim} ({log.inputYear})</div>
                      <div><strong>Result:</strong> Level {log.matchedLevel}, Type {log.matchedType}, Score {log.score}</div>
                      {log.resolutionPath && <div><strong>Path:</strong> {log.resolutionPath}</div>}
                      {log.notes && <div className="text-gray-500">{log.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFitmentSystem;