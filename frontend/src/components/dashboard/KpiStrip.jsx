import {
  Users,
  CalendarDays,
  Target,
  Building2,
  ArrowUpRight,
} from "lucide-react";

const metrics = [
  {
    label: "Active Leads",
    value: "124",
    change: "+12.5%",
    description: "vs. last month",
    icon: Users,
  },
  {
    label: "Site Visits",
    value: "38",
    change: "+8.2%",
    description: "this month",
    icon: CalendarDays,
  },
  {
    label: "Negotiations",
    value: "17",
    change: "+4.1%",
    description: "active deals",
    icon: Target,
  },
  {
    label: "Units Available",
    value: "64",
    change: "12",
    description: "newly listed",
    icon: Building2,
  },
];

function KpiStrip() {
  return (
    <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <div
            key={metric.label}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                <Icon size={20} strokeWidth={1.8} />
              </div>

              <button className="rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-50 hover:text-slate-600">
                <ArrowUpRight size={17} />
              </button>
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium text-slate-500">
                {metric.label}
              </p>

              <div className="mt-1 flex items-end gap-2">
                <p className="text-2xl font-bold tracking-tight text-slate-900">
                  {metric.value}
                </p>

                <span className="mb-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                  {metric.change}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-400">
                {metric.description}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default KpiStrip;
