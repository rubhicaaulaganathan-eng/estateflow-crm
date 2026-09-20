const express = require("express");

const pool = require("../db");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get all buildings
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        b.building_id,
        b.building_name,
        b.total_floors,
        b.project_id,
        p.project_name
      FROM buildings b
      JOIN projects p ON p.project_id = b.project_id
      ORDER BY b.building_id DESC
    `);

    res.json({
      buildings: result.rows,
    });
  } catch (error) {
    console.error("Get buildings error:", error);

    res.status(500).json({
      message: "Failed to fetch buildings",
    });
  }
});

// Create building - ADMIN only
router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const {
        projectId,
        buildingName,
        totalFloors,
      } = req.body;

      if (!projectId || !buildingName) {
        return res.status(400).json({
          message: "Project ID and building name are required",
        });
      }

      const result = await pool.query(
        `INSERT INTO buildings
          (project_id, building_name, total_floors)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [
          projectId,
          buildingName,
          totalFloors || null,
        ]
      );

      res.status(201).json({
        message: "Building created successfully",
        building: result.rows[0],
      });
    } catch (error) {
      console.error("Create building error:", error);

      res.status(500).json({
        message: "Failed to create building",
      });
    }
  }
);

module.exports = router;