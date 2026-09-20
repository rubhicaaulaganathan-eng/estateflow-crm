const express = require("express");

const pool = require("../db");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get all units
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.unit_id,
        u.unit_number,
        u.floor_number,
        u.unit_type,
        u.price,
        u.status,
        u.building_id,
        b.building_name,
        p.project_name
      FROM units u
      JOIN buildings b ON b.building_id = u.building_id
      JOIN projects p ON p.project_id = b.project_id
      ORDER BY u.unit_id DESC
    `);

    res.json({
      units: result.rows,
    });
  } catch (error) {
    console.error("Get units error:", error);

    res.status(500).json({
      message: "Failed to fetch units",
    });
  }
});

// Create unit - ADMIN only
router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const {
        buildingId,
        unitNumber,
        floorNumber,
        unitType,
        price,
        status = "AVAILABLE",
      } = req.body;

      if (
        !buildingId ||
        !unitNumber ||
        !unitType ||
        price === undefined
      ) {
        return res.status(400).json({
          message: "Building, unit number, unit type and price are required",
        });
      }

      if (!["AVAILABLE", "BLOCKED", "BOOKED"].includes(status)) {
        return res.status(400).json({
          message: "Invalid unit status",
        });
      }

      const result = await pool.query(
        `INSERT INTO units
          (building_id, unit_number, floor_number, unit_type, price, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          buildingId,
          unitNumber,
          floorNumber || null,
          unitType,
          price,
          status,
        ]
      );

      res.status(201).json({
        message: "Unit created successfully",
        unit: result.rows[0],
      });
    } catch (error) {
      console.error("Create unit error:", error);

      res.status(500).json({
        message: "Failed to create unit",
      });
    }
  }
);

module.exports = router;