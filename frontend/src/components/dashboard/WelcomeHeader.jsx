import { ArrowUpRight, CalendarDays } from "lucide-react";

function WelcomeHeader() {
  return (
    <section className="mb-7">
      <div className="flex flex-col gap-5 rounded-3xl bg-slate-900 p-6 text-white shadow-sm sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Welcome content */}
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Sales Command Center
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Good morning, Sales Team 👋
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            Here's what needs your attention today. Stay on top of leads,
            follow-ups and active deals.
          </p>
        </div>

        {/* Today's activity */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
            <CalendarDays size={20} />
          </div>

          <div>
            <p className="text-xs text-slate-400">Today's activity</p>
            <p className="text-sm font-semibold text-white">
              8 follow-ups
            </p>
          </div>

          <button className="ml-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-900 transition hover:bg-slate-100">
            <ArrowUpRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default WelcomeHeader;