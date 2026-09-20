import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  XCircle,
  X,
} from "lucide-react";

const API = "http://localhost:5000/api";

const statusStyles = {
  CONFIRMED: "bg-emerald-50 text-emerald-600",
  PENDING: "bg-amber-50 text-amber-600",
  CANCELLED: "bg-red-50 text-red-600",
};

const statusIcons = {
  CONFIRMED: CheckCircle2,
  PENDING: Clock3,
  CANCELLED: XCircle,
};

function Bookings() {
  const token = localStorage.getItem("estateflow_token");

  const [bookings, setBookings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [units, setUnits] = useState([]);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    leadId: "",
    unitId: "",
    bookingAmount: "",
    notes: "",
  });

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  async function loadData() {
    try {
      setError("");

      const [bookingResponse, leadResponse, unitResponse] =
        await Promise.all([
          fetch(`${API}/bookings`, { headers }),
          fetch(`${API}/leads`, { headers }),
          fetch(`${API}/units`, { headers }),
        ]);

      const bookingData = await bookingResponse.json();
      const leadData = await leadResponse.json();
      const unitData = await unitResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(
          bookingData.message || "Failed to load bookings"
        );
      }

      if (!leadResponse.ok) {
        throw new Error(
          leadData.message || "Failed to load leads"
        );
      }

      if (!unitResponse.ok) {
        throw new Error(
          unitData.message || "Failed to load units"
        );
      }

      setBookings(bookingData.bookings || []);
      setLeads(leadData.leads || []);
      setUnits(unitData.units || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API}/bookings`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          leadId: Number(form.leadId),
          unitId: Number(form.unitId),
          bookingAmount: Number(form.bookingAmount),
          notes: form.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create booking"
        );
      }

      setMessage("Booking created successfully.");

      setForm({
        leadId: "",
        unitId: "",
        bookingAmount: "",
        notes: "",
      });

      setShowForm(false);

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(bookingId) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API}/bookings/${bookingId}/cancel`,
        {
          method: "PATCH",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to cancel booking"
        );
      }

      setMessage("Booking cancelled successfully.");

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const value = `
      ${booking.customer_name || ""}
      ${booking.project_name || ""}
      ${booking.unit_number || ""}
      ${booking.employee_name || ""}
      ${booking.status || ""}
    `.toLowerCase();

    return value.includes(search.toLowerCase());
  });

  const confirmedCount = bookings.filter(
    (booking) => booking.status === "CONFIRMED"
  ).length;

  const pendingCount = bookings.filter(
    (booking) => booking.status === "PENDING"
  ).length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonthCount = bookings.filter((booking) => {
    if (!booking.booking_date) {
      return false;
    }

    const date = new Date(booking.booking_date);

    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  }).length;

  const availableUnits = units.filter(
    (unit) => unit.status === "AVAILABLE"
  );

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Conversion Workspace
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Bookings
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Track unit bookings and their current status.
          </p>
        </div>

        <button
          onClick={() => {
            setMessage("");
            setError("");
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus size={18} />
          New Booking
        </button>
      </div>

      {message && (
        <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Confirmed
              </p>

              <p className="text-xl font-bold text-slate-900">
                {confirmedCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock3 size={19} />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Pending
              </p>

              <p className="text-xl font-bold text-slate-900">
                {pendingCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarCheck size={19} />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                This Month
              </p>

              <p className="text-xl font-bold text-slate-900">
                {thisMonthCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 sm:max-w-sm">
            <Search
              size={17}
              className="text-slate-400"
            />

            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Customer
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Property
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Salesperson
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Booking Date
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    No bookings found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  const StatusIcon =
                    statusIcons[booking.status] ||
                    Clock3;

                  const bookingDate =
                    booking.booking_date
                      ? new Date(
                          booking.booking_date
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "-";

                  const canCancel =
                    booking.status ===
                      "CONFIRMED" ||
                    booking.status === "PENDING";

                  return (
                    <tr
                      key={booking.booking_id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {booking.customer_name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {booking.phone || ""}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {booking.project_name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {booking.building_name
                            ? `${booking.building_name} · `
                            : ""}
                          {booking.unit_number}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {booking.employee_name || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {bookingDate}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            statusStyles[
                              booking.status
                            ] ||
                            "bg-slate-50 text-slate-600"
                          }`}
                        >
                          <StatusIcon size={13} />
                          {booking.status}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="px-5 py-4 text-right">
                        {canCancel ? (
                          <button
                            onClick={() =>
                              cancelBooking(
                                booking.booking_id
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100"
                          >
                            <XCircle size={15} />
                            Cancel
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">
                            No action
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* NEW BOOKING MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  New Booking
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Create a booking for an available unit.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"
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
                  Customer
                </label>

                <select
                  value={form.leadId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      leadId: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  required
                >
                  <option value="">
                    Select customer
                  </option>

                  {leads.map((lead) => (
                    <option
                      key={lead.lead_id}
                      value={lead.lead_id}
                    >
                      {lead.full_name} -{" "}
                      {lead.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Available Unit
                </label>

                <select
                  value={form.unitId}
                  onChange={(e) => {
                    const selectedUnit =
                      units.find(
                        (unit) =>
                          Number(
                            unit.unit_id
                          ) ===
                          Number(
                            e.target.value
                          )
                      );

                    setForm({
                      ...form,
                      unitId: e.target.value,
                      bookingAmount:
                        selectedUnit
                          ? selectedUnit.price
                          : "",
                    });
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  required
                >
                  <option value="">
                    Select available unit
                  </option>

                  {availableUnits.map(
                    (unit) => (
                      <option
                        key={unit.unit_id}
                        value={unit.unit_id}
                      >
                        {unit.project_name} -{" "}
                        {unit.building_name} -{" "}
                        {unit.unit_number}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Booking Amount
                </label>

                <input
                  type="number"
                  value={
                    form.bookingAmount
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      bookingAmount:
                        e.target.value,
                    })
                  }
                  placeholder="8200000"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  required
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
                    setForm({
                      ...form,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Booking notes"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {loading
                    ? "Saving..."
                    : "Create Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Bookings;