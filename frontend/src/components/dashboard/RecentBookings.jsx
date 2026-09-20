import { ArrowRight, CheckCircle2 } from "lucide-react";

const bookings = [
  {
    customer: "Meera Krishnan",
    project: "Green Valley Residency",
    unit: "Tower A · 1204",
    amount: "₹82.5 L",
    date: "Today",
  },
  {
    customer: "Vikram Raj",
    project: "Skyline Heights",
    unit: "Tower B · 804",
    amount: "₹68.0 L",
    date: "Yesterday",
  },
  {
    customer: "Ananya S",
    project: "Lakeview Towers",
    unit: "Tower C · 1502",
    amount: "₹91.2 L",
    date: "18 Sep",
  },
];

function RecentBookings() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Conversions
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-900">
            Recent Bookings
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Latest successful deals from the sales team.
          </p>
        </div>

        <button className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900">
          View all
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="mt-5 divide-y divide-slate-100">
        {bookings.map((booking) => (
          <div
            key={`${booking.customer}-${booking.unit}`}
            className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={19} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {booking.customer}
                </p>

                <p className="mt-1 truncate text-xs text-slate-400">
                  {booking.project} · {booking.unit}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-6 sm:justify-end">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {booking.amount}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  {booking.date}
                </p>
              </div>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                Booked
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecentBookings;
