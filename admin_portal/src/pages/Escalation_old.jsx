import { useState, useEffect } from "react";
import { escalationApi } from "../services/api";
export default function EscalationConfig() {
  const [configs, setConfigs] = useState([]);
const [logs, setLogs] = useState([]);
const [tab, setTab] = useState("config");
const [loading, setLoading] = useState(true);

const [editingId, setEditingId] = useState(null);

const [form, setForm] = useState({
  role: "",
  response_window_minutes: "",
  auto_escalate: true,
  is_active: true,
});

  const loadConfigs = async () => {
    try {
      const res = await escalationApi.responseConfigs();
      setConfigs(res.data.results || res.data);
    } catch {
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const res = await escalationApi.escalationLogs();
      setLogs(res.data.results || res.data);
    } catch {
      setLogs([]);
    }
  };

  useEffect(() => {
    if (tab === "config") loadConfigs();
    else loadLogs();
  }, [tab]);
  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (editingId) {
      await escalationApi.updateConfig(editingId, form);
    } else {
      await escalationApi.createConfig(form);
    }

    setEditingId(null);

    setForm({
      role: "",
      response_window_minutes: "",
      auto_escalate: true,
      is_active: true,
    });

    loadConfigs();
  } catch (err) {
    console.error(err);
    alert("Failed to save configuration.");
  }
};

const handleEdit = (config) => {
  setEditingId(config.id);

  setForm({
    role: config.role,
    response_window_minutes: config.response_window_minutes,
    auto_escalate: config.auto_escalate,
    is_active: config.is_active,
  });
};

const handleDelete = async (id) => {
  if (!window.confirm("Delete this configuration?")) return;

  try {
    await escalationApi.deleteConfig(id);
    loadConfigs();
  } catch (err) {
    console.error(err);
    alert("Delete failed.");
  }
};
  return (
      <div className="space-y-6">
        <div className="flex gap-3">
          <button
            onClick={() => setTab("config")}
            className={`btn ${tab === "config" ? "btn-primary" : "btn-secondary"}`}
          >
            Response Configs
          </button>
          <button
            onClick={() => setTab("logs")}
            className={`btn ${tab === "logs" ? "btn-primary" : "btn-secondary"}`}
          >
            Escalation Logs
          </button>
        </div>

        {tab === "config" && (
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
  Response Time Configuration
</h3>

<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

  <div>
    <label className="block text-sm font-medium mb-1">Role</label>
    <select
      value={form.role}
      onChange={(e) => setForm({ ...form, role: e.target.value })}
      className="w-full border rounded-lg px-3 py-2"
      required
    >
      <option value="">Select Role</option>
      <option value="resident">Resident</option>
      <option value="security">Security</option>
      <option value="manager">Manager</option>
      <option value="admin">Admin</option>
      <option value="super_admin">Super Admin</option>
    </select>
  </div>

  <div>
    <label className="block text-sm font-medium mb-1">
      Response Window (Minutes)
    </label>

    <input
      type="number"
      value={form.response_window_minutes}
      onChange={(e) =>
        setForm({
          ...form,
          response_window_minutes: e.target.value,
        })
      }
      className="w-full border rounded-lg px-3 py-2"
      required
    />
  </div>

  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={form.auto_escalate}
      onChange={(e) =>
        setForm({
          ...form,
          auto_escalate: e.target.checked,
        })
      }
    />
    <label>Auto Escalate</label>
  </div>

  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={form.is_active}
      onChange={(e) =>
        setForm({
          ...form,
          is_active: e.target.checked,
        })
      }
    />
    <label>Active</label>
  </div>

  <div className="md:col-span-2 flex gap-2">
    <button
      type="submit"
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
    >
      {editingId ? "Update Configuration" : "Create Configuration"}
    </button>

    {editingId && (
      <button
        type="button"
        onClick={() => {
          setEditingId(null);
          setForm({
            role: "",
            response_window_minutes: "",
            auto_escalate: true,
            is_active: true,
          });
        }}
        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
      >
        Cancel
      </button>
    )}
  </div>

</form>

{loading ? (

        {tab === "logs" && (
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Escalation Logs</h3>
            {logs.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No escalation logs</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">SOS ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">From</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">To</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Triggered At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm text-slate-900 font-medium">#{log.sos}</td>
                        <td className="py-3 px-4 text-sm text-slate-600 capitalize">{log.from_role}</td>
                        <td className="py-3 px-4 text-sm text-slate-600 capitalize">{log.to_role}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {new Date(log.triggered_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
  );
}
