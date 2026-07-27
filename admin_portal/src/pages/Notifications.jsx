import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { notificationsApi } from "../services/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
const [templates, setTemplates] = useState([]);
const [tab, setTab] = useState("inbox");

const [editingId, setEditingId] = useState(null);

const [form, setForm] = useState({
  name: "",
  channel: "email",
  subject: "",
  body_template: "",
  is_active: true,
});

  const loadNotifications = async () => {
    try {
      const res = await notificationsApi.list();
      setNotifications(res.data.results || res.data);
    } catch {
      setNotifications([]);
    }
  };

  const loadTemplates = async () => {
    try {
      const res = await notificationsApi.templates();
      setTemplates(res.data.results || res.data);
    } catch {
      setTemplates([]);
    }
  };

  useEffect(() => {
    if (tab === "inbox") loadNotifications();
    else loadTemplates();
  }, [tab]);

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (editingId) {
      await notificationsApi.updateTemplate(editingId, form);
    } else {
      await notificationsApi.createTemplate(form);
    }

    setForm({
      name: "",
      channel: "email",
      subject: "",
      body_template: "",
      is_active: true,
    });

    setEditingId(null);

    await loadTemplates();
  } catch {
    alert(
      editingId
        ? "Failed to update template"
        : "Failed to create template"
    );
  }
};
const handleMarkRead = async (id) => {
  try {
    await notificationsApi.markRead(id);
    await loadNotifications();
  } catch {
    alert("Failed to mark notification as read");
  }
};
const handleEdit = (template) => {
  setEditingId(template.id);

  setForm({
    name: template.name,
    channel: template.channel,
    subject: template.subject || "",
    body_template: template.body_template,
    is_active: template.is_active,
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
const handleDelete = async (id) => {
  if (!window.confirm("Delete this template?")) return;

  try {
    await notificationsApi.deleteTemplate(id);

    if (editingId === id) {
      setEditingId(null);

      setForm({
        name: "",
        channel: "email",
        subject: "",
        body_template: "",
        is_active: true,
      });
    }

    await loadTemplates();
  } catch {
    alert("Failed to delete template");
  }
};
  return (
      <div className="space-y-6">
        <div className="flex gap-3">
          <button
            onClick={() => setTab("inbox")}
            className={`btn ${tab === "inbox" ? "btn-primary" : "btn-secondary"}`}
          >
            Inbox
          </button>
          <button
            onClick={() => setTab("templates")}
            className={`btn ${tab === "templates" ? "btn-primary" : "btn-secondary"}`}
          >
            Templates
          </button>
        </div>

        {tab === "inbox" && (
          <div className="card">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No notifications</div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start justify-between p-4 rounded-lg border ${
                      n.is_read ? "bg-slate-50 border-slate-200" : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{n.title}</p>
                        {!n.is_read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{n.body}</p>
                      <p className="text-xs text-slate-400 mt-2">{new Date(n.sent_at).toLocaleString()}</p>
                    </div>
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="btn btn-primary text-sm ml-4"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "templates" && (
  <div className="space-y-6">

    <div className="card">
      <h3 className="text-lg font-semibold mb-4">
        {editingId ? "Edit Template" : "Create Template"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">

  <div>
    <label className="label">Template Name</label>
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
    <label className="label">Channel</label>
    <select
      className="input"
      value={form.channel}
      onChange={(e) =>
        setForm({ ...form, channel: e.target.value })
      }
    >
      <option value="email">Email</option>
      <option value="sms">SMS</option>
      <option value="push">Push</option>
      <option value="in_app">In App</option>
    </select>
  </div>

  <div>
    <label className="label">Subject</label>
    <input
      className="input"
      value={form.subject}
      onChange={(e) =>
        setForm({ ...form, subject: e.target.value })
      }
    />
  </div>

  <div>
    <label className="label">Body Template</label>
    <textarea
      className="input"
      rows={5}
      value={form.body_template}
      onChange={(e) =>
        setForm({
          ...form,
          body_template: e.target.value,
        })
      }
      required
    />
  </div>

  <button
    type="submit"
    className="btn btn-primary w-full"
  >
    {editingId ? "Update Template" : "Create Template"}
  </button>

  {editingId && (
    <button
      type="button"
      className="btn btn-secondary w-full"
      onClick={() => {
        setEditingId(null);

        setForm({
          name: "",
          channel: "email",
          subject: "",
          body_template: "",
          is_active: true,
        });
      }}
    >
      Cancel
    </button>
  )}

</form>
    </div>

    <div className="card">
  {templates.length === 0 ? (
    <div className="text-center py-12 text-slate-500">
      No templates
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
              Name
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
              Channel
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
              Active
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {templates.map((t) => (
            <tr
              key={t.id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              <td className="py-3 px-4 text-sm text-slate-900 font-medium">
                {t.name}
              </td>

              <td className="py-3 px-4 text-sm text-slate-600 capitalize">
                {t.channel}
              </td>

              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    t.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {t.is_active ? "Active" : "Inactive"}
                </span>
              </td>

              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary text-sm"
                    onClick={() => handleEdit(t)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger text-sm"
                    onClick={() => handleDelete(t.id)}
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

)}

</div>
  );
}
