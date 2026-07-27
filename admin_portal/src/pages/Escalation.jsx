import { useEffect, useState } from "react";
import { escalationApi } from "../services/api";

export default function Escalation() {
  const [tab, setTab] = useState("config");
  const [loading, setLoading] = useState(true);

  const [configs, setConfigs] = useState([]);
  const [logs, setLogs] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    role: "",
    response_window_minutes: "",
    auto_escalate: true,
    is_active: true,
  });

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const res = await escalationApi.responseConfigs();
      setConfigs(res.data.results || res.data);
    } catch (err) {
      console.error(err);
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await escalationApi.escalationLogs();
      setLogs(res.data.results || res.data);
    } catch (err) {
      console.error(err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "config") {
      loadConfigs();
    } else {
      loadLogs();
    }
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
      alert("Failed to save configuration");
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
      alert("Delete failed");
    }
  };

  return (
  <div className="space-y-6">

    <div className="flex gap-3">
      <button
        onClick={() => setTab("config")}
        className={`btn ${
          tab === "config" ? "btn-primary" : "btn-secondary"
        }`}
      >
        Response Configs
      </button>

      <button
        onClick={() => setTab("logs")}
        className={`btn ${
          tab === "logs" ? "btn-primary" : "btn-secondary"
        }`}
      >
        Escalation Logs
      </button>
    </div>

    {tab === "config" && (
  <div className="card">

    <h3 className="text-lg font-semibold mb-4">
      Response Time Configuration
    </h3>

    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
    >

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
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
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
        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
      >
        Cancel
      </button>
    )}

  </div>

</form>

{loading ? (
  <div className="text-center py-8">
    Loading...
  </div>
) : (
  <div>
    <div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="border-b border-slate-200">
        <th className="text-left py-3 px-4">Role</th>
        <th className="text-left py-3 px-4">Response Window</th>
        <th className="text-left py-3 px-4">Auto Escalate</th>
        <th className="text-left py-3 px-4">Status</th>
        <th className="text-left py-3 px-4">Actions</th>
      </tr>
    </thead>

    <tbody>
      {configs.length === 0 ? (
        <tr>
          <td
            colSpan="5"
            className="text-center py-6 text-slate-500"
          >
            No configurations found
          </td>
        </tr>
      ) : (
        configs.map((config) => (
          <tr
            key={config.id}
            className="border-b border-slate-100 hover:bg-slate-50"
          >
            <td className="py-3 px-4 capitalize">
              {config.role}
            </td>

            <td className="py-3 px-4">
              {config.response_window_minutes} min
            </td>

            <td className="py-3 px-4">
              {config.auto_escalate ? "Yes" : "No"}
            </td>

            <td className="py-3 px-4">
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  config.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {config.is_active ? "Active" : "Inactive"}
              </span>
            </td>

            <td className="py-3 px-4">
              <div className="flex gap-2">

                <button
                  onClick={() => handleEdit(config)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(config.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>

              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>
  </div>
)}

</div>
)}
{tab === "logs" && (
  <div className="card">
    <h3 className="text-lg font-semibold mb-4">
      Escalation Logs
    </h3>

    {loading ? (
      <div className="text-center py-8">Loading...</div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4">SOS ID</th>
              <th className="text-left py-3 px-4">Current Level</th>
              <th className="text-left py-3 px-4">Escalated To</th>
              <th className="text-left py-3 px-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-slate-500">
                  No escalation logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100">
                  <td className="py-3 px-4">{log.sos}</td>
                  <td className="py-3 px-4">{log.current_level}</td>
                  <td className="py-3 px-4">{log.escalated_to}</td>
                  <td className="py-3 px-4">{log.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}

</div>
);
}