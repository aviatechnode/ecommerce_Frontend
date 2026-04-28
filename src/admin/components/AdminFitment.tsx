import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { fetchFitments, createFitment, deleteFitment } from '../state-management/fitmentSlice';

interface FitmentFormData {
  trimId: string;
  notes?: string;
}

interface AdminFitmentsProps {
  productId: string; // The product we are managing fitments for
}

const AdminFitments = ({ productId }: AdminFitmentsProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { fitments, loading, error } = useSelector((state: RootState) => state.fitments);

  const [form, setForm] = useState<FitmentFormData>({
    trimId: '',
    notes: '',
  });

  useEffect(() => {
    if (productId) dispatch(fetchFitments(productId));
  }, [dispatch, productId]);

  const resetForm = () => {
    setForm({ trimId: '', notes: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { trimId, notes } = form;
    if (!trimId) return;

    await dispatch(createFitment({ productId, trimId, notes }));
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this fitment?')) {
      await dispatch(deleteFitment(id));
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Fitment Management</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl shadow-sm border space-y-4">
        <h2 className="font-semibold text-gray-700">Create Fitment</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <input
            placeholder="Trim ID"
            value={form.trimId}
            onChange={(e) => setForm({ ...form, trimId: e.target.value })}
            className="border p-2 rounded-lg"
            required
          />
          <input
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="border p-2 rounded-lg"
          />
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full">
            Create
          </button>
        </div>
      </form>

      {/* Fitments Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b font-semibold">Fitments Table</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Trim ID</th>
                <th className="p-3">Notes</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fitments.map((fitment) => (
                <tr key={fitment.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{fitment.trimId}</td>
                  <td className="p-3">{fitment.notes || '-'}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleDelete(fitment.id)}
                        className="p-2 rounded hover:bg-red-50 text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p className="p-3 text-gray-500">Loading...</p>}
          {error && <p className="p-3 text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminFitments;