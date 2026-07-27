import { useState, useEffect } from "react";
import { societyApi } from "../services/api";

export default function Societies() {
  const [societies, setSocieties] = useState([]);
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await societyApi.list();
      setSocieties(res.data.results || res.data);
      setError("");
    } catch {
      setError("Failed to load societies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        await societyApi.update(editingId, {
          ...form,
          is_active: true,
        });
      } else {
        await societyApi.create(form);
      }

      setForm({
        name: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
      });

      setEditingId(null);
      await load();
      setError("");
    } catch {
      setError(
        editingId
          ? "Failed to update society"
          : "Failed to create society"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this society?")) return;

    try {
      await societyApi.delete(id);
      await load();
    } catch {
      alert("Failed to delete society");
    }
  };

  const handleEdit = (society) => {
    setEditingId(society.id);

    setForm({
      name: society.name,
      address: society.address,
      city: society.city,
      state: society.state,
      pincode: society.pincode,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {editingId ? "Edit Society" : "Create Society"}
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="label">Address</label>
                <textarea
                  className="input"
                  rows={3}
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">City</label>
                  <input
                    className="input"
                    value={form.city}
                    onChange={(e) =>
                      setForm({ ...form, city: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="label">State</label>
                  <input
                    className="input"
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Pincode</label>
                <input
                  className="input"
                  value={form.pincode}
                  onChange={(e) =>
                    setForm({ ...form, pincode: e.target.value })
                  }
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full"
              >
                {submitting
                  ? editingId
                    ? "Updating..."
                    : "Creating..."
                  : editingId
                  ? "Update Society"
                  : "Create Society"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary w-full"
                  onClick={() => {
                    setEditingId(null);
                    setForm({
                      name: "",
                      address: "",
                      city: "",
                      state: "",
                      pincode: "",
                    });
                  }}
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Table */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Societies List
            </h3>

            {loading ? (
              <div className="text-center py-12 text-slate-500">
                Loading...
              </div>
            ) : societies.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No societies found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">City</th>
                      <th className="text-left py-3 px-4">State</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {societies.map((society) => (
                      <tr
                        key={society.id}
                        className="border-b border-slate-100"
                      >
                        <td className="py-3 px-4">{society.name}</td>
                        <td className="py-3 px-4">{society.city}</td>
                        <td className="py-3 px-4">{society.state}</td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              society.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {society.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              className="btn btn-secondary text-sm"
                              onClick={() => handleEdit(society)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-danger text-sm"
                              onClick={() => handleDelete(society.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}