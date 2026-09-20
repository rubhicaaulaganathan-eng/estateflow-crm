
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  UserRound,
  X,
  CalendarDays,
  Pencil,
} from "lucide-react";

const API = "https://estateflow-crm-d49o.onrender.com/api";

const stages = [
  "NEW",
  "CONTACTED",
  "SITE_VISIT",
  "INTERESTED",
  "NEGOTIATION",
  "BOOKED",
  "LOST",
];

function Leads() {
  const token = localStorage.getItem("estateflow_token");

  const savedUser = JSON.parse(
    localStorage.getItem("estateflow_user") || "{}"
  );

  const isAdmin = savedUser.role === "ADMIN";

  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const emptyForm = {
    fullName: "",
    phone: "",
    email: "",
    projectId: "",
    assignedEmployeeId: "",
    stage: "NEW",
    notes: "",
    nextFollowUp: "",
  };

  const [form, setForm] = useState(emptyForm);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  async function loadData() {
    try {
      setError("");

      const requests = [
        fetch(`${API}/leads`, { headers }),
        fetch(`${API}/projects`, { headers }),
      ];

      if (isAdmin) {
        requests.push(
          fetch(`${API}/employees`, { headers })
        );
      }

      const responses = await Promise.all(requests);

      const leadData = await responses[0].json();
      const projectData = await responses[1].json();

      if (!responses[0].ok) {
        throw new Error(
          leadData.message || "Failed to load leads"
        );
      }

      if (!responses[1].ok) {
        throw new Error(
          projectData.message || "Failed to load projects"
        );
      }

      setLeads(leadData.leads || []);
      setProjects(projectData.projects || []);

      if (isAdmin && responses[2]) {
        const employeeData = await responses[2].json();

        if (!responses[2].ok) {
          throw new Error(
            employeeData.message ||
              "Failed to load employees"
          );
        }

        setEmployees(employeeData.employees || []);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openAddForm() {
    setEditingLead(null);
    setForm({ ...emptyForm });
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(lead) {
    setEditingLead(lead);

    setForm({
      fullName: lead.full_name || "",
      phone: lead.phone || "",
      email: lead.email || "",
      projectId: lead.project_id
        ? String(lead.project_id)
        : "",
      assignedEmployeeId:
        lead.assigned_employee_id
          ? String(lead.assigned_employee_id)
          : "",
      stage: lead.stage || "NEW",
      notes: lead.notes || "",
      nextFollowUp: lead.next_follow_up
        ? String(lead.next_follow_up).slice(0, 10)
        : "",
    });

    setError("");
    setMessage("");
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const body = {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || null,
        projectId: form.projectId
          ? Number(form.projectId)
          : null,
        assignedEmployeeId:
          form.assignedEmployeeId
            ? Number(form.assignedEmployeeId)
            : null,
        stage: form.stage,
        notes: form.notes || null,
        nextFollowUp: form.nextFollowUp || null,
      };

      const url = editingLead
        ? `${API}/leads/${editingLead.lead_id}`
        : `${API}/leads`;

      const method = editingLead ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (editingLead
              ? "Failed to update lead"
              : "Failed to create lead")
        );
      }

      setMessage(
        editingLead
          ? "Lead updated successfully."
          : "Lead added successfully."
      );

      setForm({ ...emptyForm });
      setEditingLead(null);
      setShowForm(false);

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const value = `
      ${lead.full_name || ""}
      ${lead.phone || ""}
      ${lead.email || ""}
      ${lead.project_name || ""}
      ${lead.assigned_employee || ""}
      ${lead.stage || ""}
    `.toLowerCase();

    return value.includes(search.toLowerCase());
  });

  const salesEmployees = employees.filter(
    (employee) =>
      employee.role === "SALES" &&
      employee.status === "ACTIVE"
  );

  function formatStage(stage) {
    return stage.replaceAll("_", " ");
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Sales Workspace
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Leads
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage customers, assignments and follow-ups.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus size={18} />
          Add Lead
        </button>
      </div>

      {message && (
        <div className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 sm:max-w-sm">
            <Search size={17} className="text-slate-400" />

            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Customer
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Project
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Assigned To
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Stage
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Follow-up
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    No leads found.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.lead_id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {lead.full_name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {lead.phone}
                      </p>

                      {lead.email && (
                        <p className="mt-1 text-xs text-slate-400">
                          {lead.email}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {lead.project_name ||
                        "Not selected"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <UserRound size={15} />
                        </div>

                        <span className="text-sm text-slate-600">
                          {lead.assigned_employee ||
                            "Unassigned"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                        {formatStage(lead.stage)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {lead.next_follow_up ? (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays
                            size={15}
                            className="text-slate-400"
                          />

                          {new Date(
                            lead.next_follow_up
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">
                          No follow-up
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() =>
                          openEditForm(lead)
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingLead
                    ? "Edit Lead"
                    : "Add New Lead"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {editingLead
                    ? "Update customer information."
                    : "Add customer information."}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingLead(null);
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full Name *
                </label>

                <input
                  value={form.fullName}
                  onChange={(e) =>
                    updateForm(
                      "fullName",
                      e.target.value
                    )
                  }
                  placeholder="Customer name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Phone *
                </label>

                <input
                  value={form.phone}
                  onChange={(e) =>
                    updateForm(
                      "phone",
                      e.target.value
                    )
                  }
                  placeholder="9876543210"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    updateForm(
                      "email",
                      e.target.value
                    )
                  }
                  placeholder="customer@example.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Project
                </label>

                <select
                  value={form.projectId}
                  onChange={(e) =>
                    updateForm(
                      "projectId",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select project
                  </option>

                  {projects.map((project) => (
                    <option
                      key={project.project_id}
                      value={project.project_id}
                    >
                      {project.project_name}
                    </option>
                  ))}
                </select>
              </div>

              {isAdmin ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Assign to Sales Employee
                  </label>

                  <select
                    value={form.assignedEmployeeId}
                    onChange={(e) =>
                      updateForm(
                        "assignedEmployeeId",
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Unassigned
                    </option>

                    {salesEmployees.map(
                      (employee) => (
                        <option
                          key={employee.employee_id}
                          value={employee.employee_id}
                        >
                          {employee.full_name}
                        </option>
                      )
                    )}
                  </select>

                  {salesEmployees.length === 0 && (
                    <p className="mt-2 text-xs text-amber-600">
                      Add an active Sales Employee
                      first.
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  This lead will belong to your
                  Sales account.
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Lead Stage
                </label>

                <select
                  value={form.stage}
                  onChange={(e) =>
                    updateForm(
                      "stage",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  {stages.map((stage) => (
                    <option
                      key={stage}
                      value={stage}
                    >
                      {formatStage(stage)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Follow-up Date
                </label>

                <input
                  type="date"
                  value={form.nextFollowUp}
                  onChange={(e) =>
                    updateForm(
                      "nextFollowUp",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  rows="4"
                  value={form.notes}
                  onChange={(e) =>
                    updateForm(
                      "notes",
                      e.target.value
                    )
                  }
                  placeholder="Customer requirement..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingLead(null);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {loading
                    ? "Saving..."
                    : editingLead
                      ? "Update Lead"
                      : "Save Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Leads;

