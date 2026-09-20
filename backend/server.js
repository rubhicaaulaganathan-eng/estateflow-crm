const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const buildingRoutes = require("./routes/buildingRoutes");
const unitRoutes = require("./routes/unitRoutes");
const leadRoutes = require("./routes/leadRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/buildings", buildingRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/employees", employeeRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "EstateFlow CRM API is running",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "ok",
      database: "connected",
      serverTime: result.rows[0].now,
    });
  } catch (error) {
    console.error("FULL DATABASE ERROR:", error);

    res.status(500).json({
      status: "error",
      database: "not connected",
      error: error.message || String(error),
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`EstateFlow backend running on http://localhost:${PORT}`);
});