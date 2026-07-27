import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usersApi } from "../services/api";

export default function Residents() {
  const [pending, setPending] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [societyFilter, setSocietyFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [pendRes, dirRes] = await Promise.all([
  usersApi.pendingResidents(),
  usersApi.residentDirectory(
    societyFilter
      ? { society_id: societyFilter }
      : {}
  ),
]);
      setPending(pendRes.data.results || pendRes.data);
      setDirectory(dirRes.data.results || dirRes.data);
    } catch {
      setPending([]);
      setDirectory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id, action) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
        await usersApi.approveResident(id, action, "");
        await load();
    } catch {
        alert("Action failed");
    } finally {
        setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
};


  return (
      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Pending Approvals</h3>
            <button onClick={load} className="btn btn-secondary text-sm">Refresh</button>
          </div>
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : pending.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No pending approvals</div>
          ) : (
            <div className="space-y-3">
              {pending.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{p.user?.email}</p>
                    <p className="text-sm text-slate-500">Status: {p.approval_status}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(p.id, "approve")}
                      disabled={actionLoading[p.id]}
                      className="btn btn-primary text-sm"
                    >
                      {actionLoading[p.id] ? "Processing..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleApprove(p.id, "reject")}
                      disabled={actionLoading[p.id]}
                      className="btn btn-danger text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Resident Directory</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Filter by society ID"
                value={societyFilter}
                onChange={(e) => setSocietyFilter(e.target.value)}
                className="input text-sm"
              />
              <button onClick={load} className="btn btn-primary text-sm">Search</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Phone</th>
                </tr>
              </thead>
              <tbody>
                {directory.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-900">{r.email}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 capitalize">{r.role}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{r.phone_number || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}
