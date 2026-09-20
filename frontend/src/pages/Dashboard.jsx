import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  Home,
  CalendarCheck,
  ArrowRight,
  Phone,
  CalendarDays,
  TrendingUp,
  MapPin,
  Layers3,
  Sparkles,
} from "lucide-react";

const API = "http://localhost:5000/api";

const stageStyles = {
  NEW: {
    wrapper: "bg-sky-50 border-sky-100",
    icon: "bg-sky-100 text-sky-600",
    text: "text-sky-700",
    progress: "bg-sky-500",
  },
  CONTACTED: {
    wrapper: "bg-blue-50 border-blue-100",
    icon: "bg-blue-100 text-blue-600",
    text: "text-blue-700",
    progress: "bg-blue-500",
  },
  SITE_VISIT: {
    wrapper: "bg-violet-50 border-violet-100",
    icon: "bg-violet-100 text-violet-600",
    text: "text-violet-700",
    progress: "bg-violet-500",
  },
  INTERESTED: {
    wrapper: "bg-amber-50 border-amber-100",
    icon: "bg-amber-100 text-amber-600",
    text: "text-amber-700",
    progress: "bg-amber-500",
  },
  NEGOTIATION: {
    wrapper: "bg-orange-50 border-orange-100",
    icon: "bg-orange-100 text-orange-600",
    text: "text-orange-700",
    progress: "bg-orange-500",
  },
  BOOKED: {
    wrapper: "bg-emerald-50 border-emerald-100",
    icon: "bg-emerald-100 text-emerald-600",
    text: "text-emerald-700",
    progress: "bg-emerald-500",
  },
  LOST: {
    wrapper: "bg-rose-50 border-rose-100",
    icon: "bg-rose-100 text-rose-600",
    text: "text-rose-700",
    progress: "bg-rose-500",
  },
};

const kpiCards = [
  {
    key: "leads",
    title: "Total Leads",
    description: "Customer enquiries",
    icon: Users,
    gradient: "from-blue-600 via-indigo-500 to-violet-500",
    iconBg: "bg-white/15",
    path: "/leads",
  },
  {
    key: "projects",
    title: "Projects",
    description: "Active properties",
    icon: Building2,
    gradient: "from-violet-600 via-purple-500 to-fuchsia-500",
    iconBg: "bg-white/15",
    path: "/properties",
  },
  {
    key: "available",
    title: "Available Units",
    description: "Ready for booking",
    icon: Home,
    gradient: "from-emerald-600 via-teal-500 to-cyan-500",
    iconBg: "bg-white/15",
    path: "/properties",
  },
  {
    key: "bookings",
    title: "Confirmed Bookings",
    description: "Successful conversions",
    icon: CalendarCheck,
    gradient: "from-orange-500 via-amber-500 to-yellow-400",
    iconBg: "bg-white/20",
    path: "/bookings",
  },
];

function Dashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem("estateflow_token");

  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [units, setUnits] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [
        leadsResponse,
        projectsResponse,
        buildingsResponse,
        unitsResponse,
        bookingsResponse,
      ] = await Promise.all([
        fetch(`${API}/leads`, { headers }),
        fetch(`${API}/projects`, { headers }),
        fetch(`${API}/buildings`, { headers }),
        fetch(`${API}/units`, { headers }),
        fetch(`${API}/bookings`, { headers }),
      ]);

      const leadsData = await leadsResponse.json();
      const projectsData = await projectsResponse.json();
      const buildingsData = await buildingsResponse.json();
      const unitsData = await unitsResponse.json();
      const bookingsData = await bookingsResponse.json();

      if (!leadsResponse.ok) {
        throw new Error(
          leadsData.message || "Failed to load leads"
        );
      }

      if (!projectsResponse.ok) {
        throw new Error(
          projectsData.message || "Failed to load projects"
        );
      }

      if (!buildingsResponse.ok) {
        throw new Error(
          buildingsData.message || "Failed to load buildings"
        );
      }

      if (!unitsResponse.ok) {
        throw new Error(
          unitsData.message || "Failed to load units"
        );
      }

      if (!bookingsResponse.ok) {
        throw new Error(
          bookingsData.message || "Failed to load bookings"
        );
      }

      setLeads(leadsData.leads || []);
      setProjects(projectsData.projects || []);
      setBuildings(buildingsData.buildings || []);
      setUnits(unitsData.units || []);
      setBookings(bookingsData.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalLeads = leads.length;

  const availableUnits = units.filter(
    (unit) => unit.status === "AVAILABLE"
  ).length;

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "CONFIRMED"
  ).length;

  const bookedUnits = units.filter(
    (unit) => unit.status === "BOOKED"
  ).length;

  const stageCounts = useMemo(
    () => ({
      NEW: leads.filter((lead) => lead.stage === "NEW").length,
      CONTACTED: leads.filter(
        (lead) => lead.stage === "CONTACTED"
      ).length,
      SITE_VISIT: leads.filter(
        (lead) => lead.stage === "SITE_VISIT"
      ).length,
      INTERESTED: leads.filter(
        (lead) => lead.stage === "INTERESTED"
      ).length,
      NEGOTIATION: leads.filter(
        (lead) => lead.stage === "NEGOTIATION"
      ).length,
      BOOKED: leads.filter(
        (lead) => lead.stage === "BOOKED"
      ).length,
      LOST: leads.filter(
        (lead) => lead.stage === "LOST"
      ).length,
    }),
    [leads]
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingFollowUps = leads
    .filter((lead) => lead.next_follow_up)
    .filter((lead) => {
      const date = new Date(lead.next_follow_up);
      date.setHours(0, 0, 0, 0);
      return date >= today;
    })
    .sort(
      (a, b) =>
        new Date(a.next_follow_up) -
        new Date(b.next_follow_up)
    )
    .slice(0, 5);

  const recentLeads = leads.slice(0, 5);
  const recentBookings = bookings.slice(0, 5);

  const getStagePercentage = (count) => {
    if (totalLeads === 0) {
      return 0;
    }

    return Math.round((count / totalLeads) * 100);
  };

  const formatStage = (stage) => {
    return stage
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  if (loading) {
    return (
      <main className="flex-1 bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-lg">
              <Building2 size={26} />
            </div>

            <p className="text-sm font-medium text-slate-500">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-violet-900 p-6 shadow-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur-sm">
              <Sparkles size={13} />
              EstateFlow Intelligence
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
              Sales Overview
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/80">
              Real-time sales, property inventory,
              customer follow-ups and booking activity
              in one place.
            </p>
          </div>

          <button
            onClick={() => navigate("/leads")}
            className="group flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Users size={17} />
            Add Lead
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 shadow-sm">
          {error}
        </div>
      )}

      {/* KPI CARDS */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;

          const value =
            card.key === "leads"
              ? totalLeads
              : card.key === "projects"
              ? projects.length
              : card.key === "available"
              ? availableUnits
              : confirmedBookings;

          return (
            <button
              key={card.key}
              onClick={() => navigate(card.path)}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-5 text-left text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl`}
            >
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
              <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-black/5" />

              <div className="relative flex items-start justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg} backdrop-blur-sm`}
                >
                  <Icon size={21} />
                </div>

                <ArrowRight
                  size={18}
                  className="text-white/60 transition-transform group-hover:translate-x-1 group-hover:text-white"
                />
              </div>

              <div className="relative mt-7">
                <p className="text-sm font-medium text-white/80">
                  {card.title}
                </p>

                <p className="mt-1 text-4xl font-bold tracking-tight">
                  {value}
                </p>

                <p className="mt-1 text-xs text-white/70">
                  {card.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* LEAD PIPELINE */}
      <section className="mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <TrendingUp size={18} />
              </div>

              <h2 className="font-semibold text-slate-900">
                Lead Pipeline
              </h2>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Track every lead from enquiry to conversion
            </p>
          </div>

          <button
            onClick={() => navigate("/leads")}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Manage Leads →
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {Object.entries(stageCounts).map(
            ([stage, count]) => {
              const style = stageStyles[stage];
              const percentage = getStagePercentage(count);

              return (
                <button
                  key={stage}
                  onClick={() => navigate("/leads")}
                  className={`group rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${style.wrapper}`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${style.icon}`}
                    >
                      <Layers3 size={16} />
                    </div>

                    <span
                      className={`text-xs font-bold ${style.text}`}
                    >
                      {percentage}%
                    </span>
                  </div>

                  <p
                    className={`mt-4 text-xs font-bold uppercase tracking-wider ${style.text}`}
                  >
                    {formatStage(stage)}
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {count}
                  </p>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/80">
                    <div
                      className={`h-full rounded-full transition-all ${style.progress}`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </button>
              );
            }
          )}
        </div>
      </section>

      {/* FOLLOW UPS + PROPERTY PULSE */}
      <div className="mb-7 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Follow Ups */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <CalendarDays size={18} />
                </div>

                <h2 className="font-semibold text-slate-900">
                  Follow-ups
                </h2>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Upcoming customer activities
              </p>
            </div>

            <button
              onClick={() => navigate("/leads")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View Leads
            </button>
          </div>

          {upcomingFollowUps.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <CalendarDays
                  size={22}
                  className="text-slate-400"
                />
              </div>

              <p className="text-sm font-medium text-slate-600">
                No upcoming follow-ups
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Your schedule is clear.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingFollowUps.map((lead) => {
                const stageStyle =
                  stageStyles[lead.stage] || stageStyles.NEW;

                return (
                  <div
                    key={lead.lead_id}
                    className="flex items-center justify-between gap-4 p-5 transition hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stageStyle.icon}`}
                      >
                        <Users size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {lead.full_name}
                        </p>

                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                          <Phone size={13} />
                          {lead.phone || "No phone"}
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                          <MapPin size={13} />
                          {lead.project_name ||
                            "Project not specified"}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="rounded-xl bg-slate-50 px-3 py-2">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                          Follow-up
                        </p>

                        <p className="mt-1 flex items-center justify-end gap-1 text-xs font-bold text-slate-700">
                          <CalendarDays size={13} />

                          {new Date(
                            lead.next_follow_up
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </p>
                      </div>

                      <p
                        className={`mt-2 text-xs font-semibold ${stageStyle.text}`}
                      >
                        {formatStage(lead.stage)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Property Pulse */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Building2 size={18} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Property Pulse
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Live inventory snapshot
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">
                Buildings
              </p>

              <p className="mt-2 text-3xl font-bold text-violet-700">
                {buildings.length}
              </p>

              <p className="mt-1 text-xs text-violet-500">
                Total structures
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                Available
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-700">
                {availableUnits}
              </p>

              <p className="mt-1 text-xs text-emerald-500">
                Ready to book
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                Booked
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-700">
                {bookedUnits}
              </p>

              <p className="mt-1 text-xs text-blue-500">
                Already reserved
              </p>
            </div>
          </div>

          <div className="px-5 pb-5">
            <button
              onClick={() => navigate("/properties")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Manage Properties
              <ArrowRight size={15} />
            </button>
          </div>
        </section>
      </div>

      {/* RECENT LEADS */}
      <section className="mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users size={18} />
              </div>

              <h2 className="font-semibold text-slate-900">
                Recent Leads
              </h2>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Latest customer enquiries
            </p>
          </div>

          <button
            onClick={() => navigate("/leads")}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View all →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
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
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {recentLeads.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    No leads available.
                  </td>
                </tr>
              ) : (
                recentLeads.map((lead) => {
                  const style =
                    stageStyles[lead.stage] || stageStyles.NEW;

                  return (
                    <tr
                      key={lead.lead_id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {lead.full_name
                              ?.charAt(0)
                              ?.toUpperCase() || "L"}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {lead.full_name}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {lead.phone || "No phone"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-600">
                          {lead.project_name || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-600">
                          {lead.assigned_employee ||
                            "Unassigned"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${style.wrapper} ${style.text}`}
                        >
                          {formatStage(lead.stage)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* RECENT BOOKINGS */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CalendarCheck size={18} />
              </div>

              <h2 className="font-semibold text-slate-900">
                Recent Bookings
              </h2>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Latest property conversions
            </p>
          </div>

          <button
            onClick={() => navigate("/bookings")}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View all →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Customer
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Project
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Unit
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {recentBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    No bookings available.
                  </td>
                </tr>
              ) : (
                recentBookings.map((booking) => (
                  <tr
                    key={booking.booking_id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                          {booking.customer_name
                            ?.charAt(0)
                            ?.toUpperCase() || "B"}
                        </div>

                        <p className="text-sm font-semibold text-slate-700">
                          {booking.customer_name}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {booking.project_name}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                        {booking.unit_number}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;