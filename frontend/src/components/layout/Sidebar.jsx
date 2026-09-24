import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  UserRoundCog,
  Settings,
  X,
  LogOut,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Leads",
    icon: Users,
    path: "/leads",
  },
  {
    label: "Properties",
    icon: Building2,
    path: "/properties",
  },
  {
    label: "Bookings",
    icon: CalendarCheck,
    path: "/bookings",
  },
  {
    label: "Employees",
    icon: UserRoundCog,
    path: "/employees",
  },
];

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = localStorage.getItem(
    "estateflow_user"
  );

  let user = {};

  try {
    user = storedUser ? JSON.parse(storedUser) : {};
  } catch (error) {
    user = {};
  }

  const userName =
    user.fullName ||
    user.full_name ||
    user.name ||
    "EstateFlow User";

  const userRole =
    user.role === "SALES"
      ? "Sales Executive"
      : user.role === "ADMIN"
      ? "Administrator"
      : "User";

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");

  function handleLogout() {
    localStorage.removeItem("estateflow_token");
    localStorage.removeItem("estateflow_user");

    navigate("/login", { replace: true });

    if (onClose) {
      onClose();
    }
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
        isOpen
          ? "translate-x-0"
          : "-translate-x-full"
      }`}
    >
      {/* Logo */}
      <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Building2 size={21} />
          </div>

          <div>
            <h1 className="text-base font-bold text-slate-900">
              EstateFlow
            </h1>

            <p className="text-xs text-slate-400">
              Sales CRM
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path;

          return (
            <button
              key={item.label}
              onClick={() => {
                navigate(item.path);

                if (onClose) {
                  onClose();
                }
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon
                size={19}
                strokeWidth={1.8}
              />

              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-slate-100 p-4">
        {/* Settings */}
        <button
          onClick={() => {}}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <Settings
            size={19}
            strokeWidth={1.8}
          />

          <span>Settings</span>
        </button>

        {/* User profile */}
        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              {initials || "EF"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                {userName}
              </p>

              <p className="truncate text-xs text-slate-400">
                {userRole}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

