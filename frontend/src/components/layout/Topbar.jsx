import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CalendarClock,
  Menu,
  Search,
  X,
  ClipboardCheck,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchText, setSearchText] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [data, setData] = useState({
    leads: [],
    projects: [],
    units: [],
    bookings: [],
  });

  const searchRef = useRef(null);
  const notificationRef = useRef(null);

  // -----------------------------
  // Normalize text
  // -----------------------------
  const normalize = (value) => {
    return String(value ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");
  };

  // -----------------------------
  // Small typo matching
  // -----------------------------
  const levenshtein = (a, b) => {
    const matrix = Array.from(
      { length: b.length + 1 },
      () => Array(a.length + 1).fill(0)
    );

    for (let i = 0; i <= b.length; i++) {
      matrix[i][0] = i;
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b[i - 1] === a[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] =
            Math.min(
              matrix[i - 1][j],
              matrix[i][j - 1],
              matrix[i - 1][j - 1]
            ) + 1;
        }
      }
    }

    return matrix[b.length][a.length];
  };

  // -----------------------------
  // Search matching
  // -----------------------------
  const matchesSearch = (record, query) => {
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      return false;
    }

    const fullText = normalize(JSON.stringify(record));

    if (fullText.includes(normalizedQuery)) {
      return true;
    }

    const words = JSON.stringify(record)
      .toLowerCase()
      .split(/[\s,."':;_@/()-]+/)
      .filter(Boolean);

    return words.some((word) => {
      const normalizedWord = normalize(word);

      if (!normalizedWord) {
        return false;
      }

      if (
        normalizedWord.includes(normalizedQuery) ||
        normalizedQuery.includes(normalizedWord)
      ) {
        return true;
      }

      if (normalizedQuery.length >= 4) {
        return (
          levenshtein(
            normalizedWord,
            normalizedQuery
          ) <= 1
        );
      }

      return false;
    });
  };

  // -----------------------------
  // Convert API response
  // -----------------------------
  const getList = (result, keys) => {
    if (Array.isArray(result)) {
      return result;
    }

    for (const key of keys) {
      if (Array.isArray(result?.[key])) {
        return result[key];
      }
    }

    return [];
  };

  // -----------------------------
  // Load CRM data
  // -----------------------------
  useEffect(() => {
    const loadData = async () => {
      const token =
        localStorage.getItem("estateflow_token");

      if (!token) {
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const loadedData = {
        leads: [],
        projects: [],
        units: [],
        bookings: [],
      };

      // Leads
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/leads`,
          { headers }
        );

        if (response.ok) {
          const result = await response.json();

          loadedData.leads = getList(result, [
            "leads",
            "data",
          ]);
        }
      } catch (error) {
        console.error(
          "Leads fetch error:",
          error
        );
      }

      // Projects
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/projects`,
          { headers }
        );

        if (response.ok) {
          const result = await response.json();

          loadedData.projects = getList(
            result,
            ["projects", "data"]
          );
        }
      } catch (error) {
        console.error(
          "Projects fetch error:",
          error
        );
      }

      // Units
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/units`,
          { headers }
        );

        if (response.ok) {
          const result = await response.json();

          loadedData.units = getList(
            result,
            ["units", "data"]
          );
        }
      } catch (error) {
        console.error(
          "Units fetch error:",
          error
        );
      }

      // Bookings
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/bookings`,
          { headers }
        );

        if (response.ok) {
          const result = await response.json();

          loadedData.bookings = getList(
            result,
            ["bookings", "data"]
          );
        }
      } catch (error) {
        console.error(
          "Bookings fetch error:",
          error
        );
      }

      setData(loadedData);
    };

    loadData();
  }, [location.pathname]);

  // -----------------------------
  // Search results
  // -----------------------------
  const results = useMemo(() => {
    const query = searchText.trim();

    if (!query) {
      return [];
    }

    const matches = [];

    // Leads
    data.leads.forEach((lead) => {
      if (matchesSearch(lead, query)) {
        matches.push({
          type: "Lead",
          title:
            lead.full_name ||
            lead.customer_name ||
            lead.name ||
            "Lead",
          subtitle:
            lead.phone ||
            lead.email ||
            lead.stage ||
            "Customer Lead",
          path: "/leads",
        });
      }
    });

    // Projects
    data.projects.forEach((project) => {
      if (matchesSearch(project, query)) {
        matches.push({
          type: "Project",
          title:
            project.project_name ||
            project.projectName ||
            project.name ||
            "Project",
          subtitle:
            project.location ||
            "Property",
          path: "/properties",
        });
      }
    });

    // Units
    data.units.forEach((unit) => {
      if (matchesSearch(unit, query)) {
        matches.push({
          type: "Unit",
          title:
            unit.unit_number ||
            unit.unitNumber ||
            "Unit",
          subtitle:
            unit.unit_type ||
            unit.unitType ||
            unit.status ||
            "Property Unit",
          path: "/properties",
        });
      }
    });

    // Bookings
    data.bookings.forEach((booking) => {
      if (matchesSearch(booking, query)) {
        matches.push({
          type: "Booking",
          title:
            booking.customer_name ||
            booking.customerName ||
            booking.full_name ||
            "Booking",
          subtitle:
            booking.unit_number ||
            booking.unitNumber ||
            booking.status ||
            "Booking",
          path: "/bookings",
        });
      }
    });

    return matches.slice(0, 8);
  }, [searchText, data]);

  // -----------------------------
  // Date helpers
  // -----------------------------
  const getLocalDate = (value) => {
    if (!value) {
      return null;
    }

    const stringValue = String(value);

    // PostgreSQL date: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
      const [year, month, day] =
        stringValue.split("-").map(Number);

      return new Date(
        year,
        month - 1,
        day
      );
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  };

  const startOfDay = (date) => {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  };

  const formatNotificationDate = (value) => {
    const date = getLocalDate(value);

    if (!date) {
      return "";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
      }
    );
  };

  // -----------------------------
  // Notifications
  // -----------------------------
  const notifications = useMemo(() => {
    const items = [];

    const today = startOfDay(new Date());

    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(
      sevenDaysLater.getDate() + 7
    );

    // Follow-up notifications
    data.leads.forEach((lead) => {
      if (!lead.next_follow_up) {
        return;
      }

      const followUpDate =
        getLocalDate(lead.next_follow_up);

      if (!followUpDate) {
        return;
      }

      const followUpDay =
        startOfDay(followUpDate);

      const customer =
        lead.full_name ||
        lead.customer_name ||
        "Customer";

      // Today
      if (
        followUpDay.getTime() ===
        today.getTime()
      ) {
        items.push({
          id: `followup-today-${lead.lead_id}`,
          kind: "followup",
          title: "Follow-up due today",
          message: `${customer} needs a follow-up today.`,
          date: formatNotificationDate(
            lead.next_follow_up
          ),
          path: "/leads",
          priority: "today",
        });
      }

      // Upcoming
      if (
        followUpDay > today &&
        followUpDay <= sevenDaysLater
      ) {
        items.push({
          id: `followup-upcoming-${lead.lead_id}`,
          kind: "followup",
          title: "Upcoming follow-up",
          message: `${customer} has a scheduled follow-up.`,
          date: formatNotificationDate(
            lead.next_follow_up
          ),
          path: "/leads",
          priority: "upcoming",
        });
      }
    });

    // Recent bookings
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(
      sevenDaysAgo.getDate() - 7
    );

    data.bookings.forEach((booking) => {
      if (!booking.booking_date) {
        return;
      }

      const bookingDate =
        getLocalDate(booking.booking_date);

      if (!bookingDate) {
        return;
      }

      if (bookingDate >= sevenDaysAgo) {
        const customer =
          booking.customer_name ||
          booking.customerName ||
          "Customer";

        const unit =
          booking.unit_number ||
          booking.unitNumber ||
          "Unit";

        items.push({
          id: `booking-${booking.booking_id}`,
          kind: "booking",
          title: "New booking",
          message: `${customer} booked ${unit}.`,
          date: formatNotificationDate(
            booking.booking_date
          ),
          path: "/bookings",
          priority: "booking",
        });
      }
    });

    // Put today's follow-ups first
    return items
      .sort((a, b) => {
        const priorityOrder = {
          today: 1,
          booking: 2,
          upcoming: 3,
        };

        return (
          (priorityOrder[a.priority] || 9) -
          (priorityOrder[b.priority] || 9)
        );
      })
      .slice(0, 8);
  }, [data]);

  // -----------------------------
  // Total CRM records
  // -----------------------------
  const totalRecords =
    data.leads.length +
    data.projects.length +
    data.units.length +
    data.bookings.length;

  // -----------------------------
  // Close dropdowns outside
  // -----------------------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // -----------------------------
  // "/" shortcut
  // -----------------------------
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === "/" &&
        document.activeElement?.tagName !==
          "INPUT" &&
        document.activeElement?.tagName !==
          "TEXTAREA"
      ) {
        event.preventDefault();

        searchRef.current
          ?.querySelector("input")
          ?.focus();
      }

      if (event.key === "Escape") {
        setSearchText("");
        setIsSearchOpen(false);
        setNotificationOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  // -----------------------------
  // Search result click
  // -----------------------------
  const handleResultClick = (path) => {
    navigate(path);
    setSearchText("");
    setIsSearchOpen(false);
  };

  // -----------------------------
  // Notification click
  // -----------------------------
  const handleNotificationClick = (path) => {
    navigate(path);
    setNotificationOpen(false);
  };

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="text-sm text-slate-400">
            Good morning
          </p>

          <h2 className="text-lg font-bold text-slate-900">
            Sales Overview
          </h2>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* SEARCH */}
        <div
          ref={searchRef}
          className="relative hidden sm:block"
        >
          <div className="flex w-72 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
            <Search
              size={17}
              className="shrink-0 text-slate-400"
            />

            <input
              type="text"
              value={searchText}
              onFocus={() =>
                setIsSearchOpen(true)
              }
              onChange={(event) => {
                setSearchText(event.target.value);
                setIsSearchOpen(true);
              }}
              placeholder="Search CRM..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />

            {searchText ? (
              <button
                onClick={() => {
                  setSearchText("");
                  setIsSearchOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            ) : (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-400">
                /
              </span>
            )}
          </div>

          {/* SEARCH RESULTS */}
          {isSearchOpen &&
            searchText.trim() && (
              <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                {results.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto py-2">
                    {results.map(
                      (result, index) => (
                        <button
                          key={`${result.type}-${result.title}-${index}`}
                          onClick={() =>
                            handleResultClick(
                              result.path
                            )
                          }
                          className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                        >
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600">
                            {result.type.charAt(0)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {result.title}
                            </p>

                            <p className="truncate text-xs text-slate-400">
                              {result.type}
                              {result.subtitle
                                ? ` • ${result.subtitle}`
                                : ""}
                            </p>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-7 text-center">
                    <Search
                      size={22}
                      className="mx-auto mb-2 text-slate-300"
                    />

                    <p className="text-sm font-medium text-slate-600">
                      No results found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Search checks {totalRecords} CRM records
                    </p>
                  </div>
                )}
              </div>
            )}
        </div>

        {/* NOTIFICATIONS */}
        <div
          ref={notificationRef}
          className="relative"
        >
          <button
            onClick={() => {
              setNotificationOpen(
                (current) => !current
              );
              setIsSearchOpen(false);
            }}
            className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell
              size={20}
              strokeWidth={1.8}
            />

            {notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {notifications.length > 9
                  ? "9+"
                  : notifications.length}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {notificationOpen && (
            <div className="absolute right-0 top-14 z-50 w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Notifications
                  </p>

                  <p className="text-xs text-slate-400">
                    {notifications.length > 0
                      ? `${notifications.length} recent alert${
                          notifications.length > 1
                            ? "s"
                            : ""
                        }`
                      : "You're all caught up"}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setNotificationOpen(false)
                  }
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Notification list */}
              {notifications.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map(
                    (notification) => (
                      <button
                        key={notification.id}
                        onClick={() =>
                          handleNotificationClick(
                            notification.path
                          )
                        }
                        className="flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50"
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            notification.kind ===
                            "followup"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {notification.kind ===
                          "followup" ? (
                            <CalendarClock
                              size={17}
                            />
                          ) : (
                            <ClipboardCheck
                              size={17}
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-800">
                              {notification.title}
                            </p>

                            <span className="shrink-0 text-[11px] text-slate-400">
                              {notification.date}
                            </span>
                          </div>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {notification.message}
                          </p>
                        </div>
                      </button>
                    )
                  )}
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <Bell
                      size={22}
                      className="text-slate-400"
                    />
                  </div>

                  <p className="text-sm font-semibold text-slate-700">
                    No new notifications
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    New follow-ups and bookings will appear here.
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                <button
                  onClick={() => {
                    navigate("/leads");
                    setNotificationOpen(false);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  View all leads →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;