import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Building2,
  Home,
  X,
} from "lucide-react";

const API = "https://estateflow-crm-d49o.onrender.com/api";

function Properties() {
  const token = localStorage.getItem("estateflow_token");

  const [projects, setProjects] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [units, setUnits] = useState([]);

  const [search, setSearch] = useState("");

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showBuildingForm, setShowBuildingForm] = useState(false);
  const [showUnitForm, setShowUnitForm] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [projectForm, setProjectForm] = useState({
    projectName: "",
    location: "",
    description: "",
    status: "ACTIVE",
  });

  const [buildingForm, setBuildingForm] = useState({
    buildingName: "",
    totalFloors: "",
  });

  const [unitForm, setUnitForm] = useState({
    unitNumber: "",
    floorNumber: "",
    unitType: "2 BHK",
    price: "",
    status: "AVAILABLE",
  });

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  async function loadData() {
    try {
      setError("");

      const [projectResponse, buildingResponse, unitResponse] =
        await Promise.all([
          fetch(`${API}/projects`, { headers }),
          fetch(`${API}/buildings`, { headers }),
          fetch(`${API}/units`, { headers }),
        ]);

      const projectData = await projectResponse.json();
      const buildingData = await buildingResponse.json();
      const unitData = await unitResponse.json();

      if (!projectResponse.ok) {
        throw new Error(
          projectData.message || "Failed to load projects"
        );
      }

      if (!buildingResponse.ok) {
        throw new Error(
          buildingData.message || "Failed to load buildings"
        );
      }

      if (!unitResponse.ok) {
        throw new Error(
          unitData.message || "Failed to load units"
        );
      }

      setProjects(projectData.projects || []);
      setBuildings(buildingData.buildings || []);
      setUnits(unitData.units || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function addProject(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API}/projects`, {
        method: "POST",
        headers,
        body: JSON.stringify(projectForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create project"
        );
      }

      setMessage("Project added successfully.");

      setProjectForm({
        projectName: "",
        location: "",
        description: "",
        status: "ACTIVE",
      });

      setShowProjectForm(false);

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addBuilding(e) {
    e.preventDefault();

    if (!selectedProject) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API}/buildings`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          projectId: selectedProject.project_id,
          buildingName: buildingForm.buildingName,
          totalFloors: buildingForm.totalFloors
            ? Number(buildingForm.totalFloors)
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create building"
        );
      }

      setMessage("Building added successfully.");

      setBuildingForm({
        buildingName: "",
        totalFloors: "",
      });

      setShowBuildingForm(false);

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addUnit(e) {
    e.preventDefault();

    if (!selectedBuilding) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API}/units`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          buildingId: selectedBuilding.building_id,
          unitNumber: unitForm.unitNumber,
          floorNumber: unitForm.floorNumber
            ? Number(unitForm.floorNumber)
            : null,
          unitType: unitForm.unitType,
          price: Number(unitForm.price),
          status: unitForm.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create unit"
        );
      }

      setMessage("Unit added successfully.");

      setUnitForm({
        unitNumber: "",
        floorNumber: "",
        unitType: "2 BHK",
        price: "",
        status: "AVAILABLE",
      });

      setShowUnitForm(false);

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function getProjectBuildings(projectId) {
    return buildings.filter(
      (building) =>
        Number(building.project_id) === Number(projectId)
    );
  }

  function getBuildingUnits(buildingId) {
    return units.filter(
      (unit) =>
        Number(unit.building_id) === Number(buildingId)
    );
  }

  function getProjectUnits(projectId) {
    const projectBuildings = getProjectBuildings(projectId);

    return units.filter((unit) =>
      projectBuildings.some(
        (building) =>
          Number(building.building_id) ===
          Number(unit.building_id)
      )
    );
  }

  const filteredProjects = projects.filter((project) => {
    const text =
      `${project.project_name} ${project.location}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const totalAvailableUnits = units.filter(
    (unit) => unit.status === "AVAILABLE"
  ).length;

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Inventory Workspace
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Properties
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage projects, buildings and units.
          </p>
        </div>

        <button
          onClick={() => {
            setMessage("");
            setError("");
            setShowProjectForm(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Building2 size={19} />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Projects
              </p>

              <p className="text-xl font-bold">
                {projects.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Building2 size={19} />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Buildings
              </p>

              <p className="text-xl font-bold">
                {buildings.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Home size={19} />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Available Units
              </p>

              <p className="text-xl font-bold">
                {totalAvailableUnits}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <section className="mb-6 rounded-2xl border bg-white shadow-sm">
        <div className="p-4">
          <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5 sm:max-w-sm">
            <Search size={17} className="text-slate-400" />

            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>
      </section>

      {/* Projects */}
      <div className="space-y-6">
        {filteredProjects.map((project) => {
          const projectBuildings = getProjectBuildings(
            project.project_id
          );

          const projectUnits = getProjectUnits(
            project.project_id
          );

          const projectAvailableUnits =
            projectUnits.filter(
              (unit) => unit.status === "AVAILABLE"
            ).length;

          return (
            <section
              key={project.project_id}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm"
            >
              {/* Project top */}
              <div className="flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {project.project_name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    {project.location}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    {project.description || "No description"}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setShowBuildingForm(true);
                    setError("");
                    setMessage("");
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Plus size={17} />
                  Add Building
                </button>
              </div>

              {/* Project counts */}
              <div className="grid grid-cols-2 gap-4 border-b p-5 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-slate-400">
                    Buildings
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {projectBuildings.length}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Total Units
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {projectUnits.length}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Available Units
                  </p>

                  <p className="mt-1 text-2xl font-bold text-emerald-600">
                    {projectAvailableUnits}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Booked Units
                  </p>

                  <p className="mt-1 text-2xl font-bold text-blue-600">
                    {
                      projectUnits.filter(
                        (unit) =>
                          unit.status === "BOOKED"
                      ).length
                    }
                  </p>
                </div>
              </div>

              {/* Buildings */}
              <div className="space-y-4 p-5">
                {projectBuildings.map((building) => {
                  const buildingUnits = getBuildingUnits(
                    building.building_id
                  );

                  const available =
                    buildingUnits.filter(
                      (unit) => unit.status === "AVAILABLE"
                    ).length;

                  return (
                    <div
                      key={building.building_id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      {/* Building header */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-800">
                            {building.building_name}
                          </h3>

                          <p className="mt-1 text-xs text-slate-400">
                            {building.total_floors
                              ? `${building.total_floors} floors`
                              : "Floors not specified"}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedBuilding(building);
                            setShowUnitForm(true);
                            setError("");
                            setMessage("");
                          }}
                          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          <Plus size={15} />
                          Add Unit
                        </button>
                      </div>

                      {/* Building counts */}
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-xs text-slate-400">
                            Units
                          </p>

                          <p className="mt-1 font-bold">
                            {buildingUnits.length}
                          </p>
                        </div>

                        <div className="rounded-lg bg-emerald-50 p-3">
                          <p className="text-xs text-emerald-600">
                            Available
                          </p>

                          <p className="mt-1 font-bold text-emerald-700">
                            {available}
                          </p>
                        </div>

                        <div className="rounded-lg bg-blue-50 p-3">
                          <p className="text-xs text-blue-600">
                            Booked
                          </p>

                          <p className="mt-1 font-bold text-blue-700">
                            {
                              buildingUnits.filter(
                                (unit) =>
                                  unit.status === "BOOKED"
                              ).length
                            }
                          </p>
                        </div>
                      </div>

                      {/* Units */}
                      {buildingUnits.length > 0 && (
                        <div className="mt-4 overflow-x-auto">
                          <table className="w-full min-w-[600px]">
                            <thead>
                              <tr className="border-b text-left">
                                <th className="px-3 py-3 text-xs text-slate-400">
                                  Unit
                                </th>

                                <th className="px-3 py-3 text-xs text-slate-400">
                                  Floor
                                </th>

                                <th className="px-3 py-3 text-xs text-slate-400">
                                  Type
                                </th>

                                <th className="px-3 py-3 text-xs text-slate-400">
                                  Price
                                </th>

                                <th className="px-3 py-3 text-xs text-slate-400">
                                  Status
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {buildingUnits.map((unit) => (
                                <tr
                                  key={unit.unit_id}
                                  className="border-b last:border-0"
                                >
                                  <td className="px-3 py-3 text-sm font-semibold text-slate-700">
                                    {unit.unit_number}
                                  </td>

                                  <td className="px-3 py-3 text-sm text-slate-600">
                                    {unit.floor_number || "-"}
                                  </td>

                                  <td className="px-3 py-3 text-sm text-slate-600">
                                    {unit.unit_type}
                                  </td>

                                  <td className="px-3 py-3 text-sm text-slate-600">
                                    ₹
                                    {Number(
                                      unit.price
                                    ).toLocaleString("en-IN")}
                                  </td>

                                  <td className="px-3 py-3">
                                    <span
                                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                        unit.status === "AVAILABLE"
                                          ? "bg-emerald-50 text-emerald-600"
                                          : unit.status === "BOOKED"
                                            ? "bg-blue-50 text-blue-600"
                                            : "bg-amber-50 text-amber-600"
                                      }`}
                                    >
                                      {unit.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {buildingUnits.length === 0 && (
                        <div className="mt-4 rounded-lg border border-dashed p-5 text-center text-sm text-slate-400">
                          No units yet. Click{" "}
                          <b>Add Unit</b> to add one.
                        </div>
                      )}
                    </div>
                  );
                })}

                {projectBuildings.length === 0 && (
                  <div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-400">
                    No buildings yet.
                    <br />
                    Click <b>Add Building</b> above.
                  </div>
                )}
              </div>
            </section>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="rounded-2xl border border-dashed bg-white p-12 text-center text-sm text-slate-400">
            No projects found.
          </div>
        )}
      </div>

      {/* Add Project */}
      {showProjectForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Add Project
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Create a new project.
                </p>
              </div>

              <button
                onClick={() => setShowProjectForm(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addProject} className="space-y-4">
              <input
                required
                value={projectForm.projectName}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    projectName: e.target.value,
                  })
                }
                placeholder="Project name"
                className="w-full rounded-xl border px-4 py-3 text-sm"
              />

              <input
                required
                value={projectForm.location}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    location: e.target.value,
                  })
                }
                placeholder="Location"
                className="w-full rounded-xl border px-4 py-3 text-sm"
              />

              <textarea
                rows="4"
                value={projectForm.description}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    description: e.target.value,
                  })
                }
                placeholder="Description"
                className="w-full rounded-xl border px-4 py-3 text-sm"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
              >
                {loading ? "Saving..." : "Save Project"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Building */}
      {showBuildingForm && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Add Building
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {selectedProject.project_name}
                </p>
              </div>

              <button
                onClick={() => setShowBuildingForm(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={addBuilding}
              className="space-y-4"
            >
              <input
                required
                value={buildingForm.buildingName}
                onChange={(e) =>
                  setBuildingForm({
                    ...buildingForm,
                    buildingName: e.target.value,
                  })
                }
                placeholder="Building name e.g. Tower A"
                className="w-full rounded-xl border px-4 py-3 text-sm"
              />

              <input
                type="number"
                min="1"
                value={buildingForm.totalFloors}
                onChange={(e) =>
                  setBuildingForm({
                    ...buildingForm,
                    totalFloors: e.target.value,
                  })
                }
                placeholder="Total floors"
                className="w-full rounded-xl border px-4 py-3 text-sm"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
              >
                {loading ? "Saving..." : "Save Building"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Unit */}
      {showUnitForm && selectedBuilding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Add Unit
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {selectedBuilding.building_name}
                </p>
              </div>

              <button
                onClick={() => setShowUnitForm(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addUnit} className="space-y-4">
              <input
                required
                value={unitForm.unitNumber}
                onChange={(e) =>
                  setUnitForm({
                    ...unitForm,
                    unitNumber: e.target.value,
                  })
                }
                placeholder="Unit number e.g. A-101"
                className="w-full rounded-xl border px-4 py-3 text-sm"
              />

              <input
                type="number"
                min="1"
                value={unitForm.floorNumber}
                onChange={(e) =>
                  setUnitForm({
                    ...unitForm,
                    floorNumber: e.target.value,
                  })
                }
                placeholder="Floor number"
                className="w-full rounded-xl border px-4 py-3 text-sm"
              />

              <select
                value={unitForm.unitType}
                onChange={(e) =>
                  setUnitForm({
                    ...unitForm,
                    unitType: e.target.value,
                  })
                }
                className="w-full rounded-xl border px-4 py-3 text-sm"
              >
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="4 BHK">4 BHK</option>
                <option value="Villa">Villa</option>
              </select>

              <input
                type="number"
                min="0"
                required
                value={unitForm.price}
                onChange={(e) =>
                  setUnitForm({
                    ...unitForm,
                    price: e.target.value,
                  })
                }
                placeholder="Price e.g. 6500000"
                className="w-full rounded-xl border px-4 py-3 text-sm"
              />

              <select
                value={unitForm.status}
                onChange={(e) =>
                  setUnitForm({
                    ...unitForm,
                    status: e.target.value,
                  })
                }
                className="w-full rounded-xl border px-4 py-3 text-sm"
              >
                <option value="AVAILABLE">Available</option>
                <option value="BLOCKED">Blocked</option>
              </select>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
              >
                {loading ? "Saving..." : "Save Unit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Properties;

