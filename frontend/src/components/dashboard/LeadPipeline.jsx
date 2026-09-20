import { ArrowRight, Users } from "lucide-react";

const stages = [
  { name: "New", count: 24 },
  { name: "Contacted", count: 18 },
  { name: "Site Visit", count: 12 },
  { name: "Interested", count: 9 },
  { name: "Negotiation", count: 6 },
  { name: "Booked", count: 4 },
];

function LeadPipeline() {
  return (
    <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Lead Journey
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-900">
            Sales Pipeline
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Track leads as they move through the sales journey.
          </p>
        </div>

        <button className="flex items-center gap-2 self-start rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900">
          View all leads
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <div className="flex min-w-[850px] items-center gap-2">
          {stages.map((stage, index) => (
            <div key={stage.name} className="flex flex-1 items-center gap-2">
              <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/40">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    {stage.name}
                  </span>

                  <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-white px-2 text-xs font-bold text-slate-700 shadow-sm">
                    {stage.count}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                  <Users size={14} />
                  <span>Active leads</span>
                </div>
              </div>

              {index < stages.length - 1 && (
                <ArrowRight
                  size={17}
                  className="shrink-0 text-slate-300"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LeadPipeline;