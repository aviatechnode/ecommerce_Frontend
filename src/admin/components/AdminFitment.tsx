import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { fetchFitments, createFitment, updateFitment, deleteFitment } from '../state-management/fitmentSlice';

const AdminFitments = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { fitments, loading, error } = useSelector((state: RootState) => state.fitments);

  const [form, setForm] = useState({
    make: '',
    model: '',
    year: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchFitments());
  }, [dispatch]);

  const resetForm = () => {
    setForm({ make: '', model: '', year: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { make, model, year } = form;
    if (!make || !model || !year) return;

    const payload = { make, model, year: Number(year) };

    if (editingId) {
      await dispatch(updateFitment({ id: editingId, data: payload }));
    } else {
      await dispatch(createFitment(payload));
    }

    resetForm();
  };

  const handleEdit = (fitment: any) => {
    setEditingId(fitment.id);
    setForm({
      make: fitment.make,
      model: fitment.model,
      year: fitment.year.toString(),
    });
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
        <h2 className="font-semibold text-gray-700">{editingId ? 'Edit Fitment' : 'Create Fitment'}</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            placeholder="Make"
            value={form.make}
            onChange={(e) => setForm({ ...form, make: e.target.value })}
            className="border p-2 rounded-lg"
            required
          />
          <input
            placeholder="Model"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            className="border p-2 rounded-lg"
            required
          />
          <input
            placeholder="Year"
            type="number"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            className="border p-2 rounded-lg"
            required
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full">
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="border px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Fitments Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b font-semibold">Fitments Table</div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Make</th>
                <th className="p-3">Model</th>
                <th className="p-3">Year</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fitments.map((fitment) => (
                <tr key={fitment.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{fitment.make}</td>
                  <td className="p-3">{fitment.model}</td>
                  <td className="p-3">{fitment.year}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(fitment)} className="p-2 rounded hover:bg-gray-100">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(fitment.id)} className="p-2 rounded hover:bg-red-50 text-red-600">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFitments;