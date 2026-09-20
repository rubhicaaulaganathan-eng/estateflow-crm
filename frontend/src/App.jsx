import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Properties from "./pages/Properties";
import Bookings from "./pages/Bookings";
import Employees from "./pages/Employees";

function ProtectedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem("estateflow_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <Routes>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/leads"
            element={<Leads />}
          />

          <Route
            path="/properties"
            element={<Properties />}
          />

          <Route
            path="/bookings"
            element={<Bookings />}
          />

          <Route
            path="/employees"
            element={<Employees />}
          />

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/*"
        element={<ProtectedLayout />}
      />
    </Routes>
  );
}

export default App;