import {
  AlertCircle,
  CalendarClock,
  Clock3,
  ArrowRight,
} from "lucide-react";

const followUps = [
  {
    name: "Arun Kumar",
    project: "Green Valley Residency",
    time: "10:30 AM",
    status: "Overdue",
    icon: AlertCircle,
    style: "border-red-100 bg-red-50 text-red-600",
  },
  {
    name: "Priya Sharma",
    project: "Skyline Heights",
    time: "2:00 PM",
    status: "Today",
    icon: CalendarClock,
    style: "border-orange-100 bg-orange-50 text-orange-600",
  },
  {
    name: "Rahul Menon",
    project: "Lakeview Towers",
    time: "Tomorrow",
    status: "Upcoming",
    icon: Clock3,
    style: "border-blue-100 bg-blue-50 text-blue-600",
  },
];

function FollowUpRadar() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Attention
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-900">
            Follow-up Radar
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Keep every conversation moving forward.
          </p>
        </div>

        <button className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700">
          <ArrowRight size={18} />
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {followUps.map((followUp) => {
          const Icon = followUp.icon;

          return (
            <div
              key={followUp.name}
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-slate-200 hover:shadow-sm"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${followUp.style}`}
              >
                <Icon size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {followUp.name}
                </p>

                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {followUp.project}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold text-slate-700">
                  {followUp.time}
                </p>

                <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                  {followUp.status}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FollowUpRadar;
