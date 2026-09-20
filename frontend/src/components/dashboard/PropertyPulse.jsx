import { Building2, Circle } from "lucide-react";

const properties = [
  {
    project: "Green Valley Residency",
    location: "Chennai",
    available: 18,
    total: 40,
    status: "Healthy",
  },
  {
    project: "Skyline Heights",
    location: "Bangalore",
    available: 9,
    total: 32,
    status: "Limited",
  },
  {
    project: "Lakeview Towers",
    location: "Coimbatore",
    available: 24,
    total: 50,
    status: "Healthy",
  },
];

function PropertyPulse() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Inventory
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-900">
            Property Pulse
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Quick view of available units across projects.
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Building2 size={19} />
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {properties.map((property) => {
          const percentage = Math.round(
            (property.available / property.total) * 100
          );

          return (
            <div key={property.project}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {property.project}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {property.location}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    {property.available}
                  </p>

                  <p className="text-[11px] text-slate-400">
                    of {property.total} available
                  </p>
                </div>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Circle
                    size={7}
                    fill="currentColor"
                    className={
                      property.status === "Limited"
                        ? "text-orange-400"
                        : "text-emerald-400"
                    }
                  />

                  <span className="text-[11px] font-medium text-slate-400">
                    {property.status}
                  </span>
                </div>

                <span className="text-[11px] font-medium text-slate-400">
                  {percentage}% available
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default PropertyPulse;