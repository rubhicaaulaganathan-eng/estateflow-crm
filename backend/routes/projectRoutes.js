const express = require("express");

const pool = require("../db");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get all projects
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         project_id,
         project_name,
         location,
         description,
         status,
         created_at,
         updated_at
       FROM projects
       ORDER BY created_at DESC`
    );

    res.json({
      projects: result.rows,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    res.status(500).json({
      message: "Failed to fetch projects",
    });
  }
});

// Get one project
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
         project_id,
         project_name,
         location,
         description,
         status,
         created_at,
         updated_at
       FROM projects
       WHERE project_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json({
      project: result.rows[0],
    });
  } catch (error) {
    console.error("Get project error:", error);

    res.status(500).json({
      message: "Failed to fetch project",
    });
  }
});

// Create project - ADMIN only
router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const {
        projectName,
        location,
        description,
        status = "ACTIVE",
      } = req.body;

      if (!projectName || !location) {
        return res.status(400).json({
          message: "Project name and location are required",
        });
      }

      if (!["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({
          message: "Invalid project status",
        });
      }

      const result = await pool.query(
        `INSERT INTO projects
          (project_name, location, description, status)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [projectName, location, description || null, status]
      );

      res.status(201).json({
        message: "Project created successfully",
        project: result.rows[0],
      });
    } catch (error) {
      console.error("Create project error:", error);

      res.status(500).json({
        message: "Failed to create project",
      });
    }
  }
);

// Update project - ADMIN only
router.put(
  "/:id",
  authenticateToken,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        projectName,
        location,
        description,
        status,
      } = req.body;

      if (!projectName || !location || !status) {
        return res.status(400).json({
          message: "Project name, location and status are required",
        });
      }

      if (!["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({
          message: "Invalid project status",
        });
      }

      const result = await pool.query(
        `UPDATE projects
         SET project_name = $1,
             location = $2,
             description = $3,
             status = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE project_id = $5
         RETURNING *`,
        [
          projectName,
          location,
          description || null,
          status,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      res.json({
        message: "Project updated successfully",
        project: result.rows[0],
      });
    } catch (error) {
      console.error("Update project error:", error);

      res.status(500).json({
        message: "Failed to update project",
      });
    }
  }
);

// Delete project - ADMIN only
router.delete(
  "/:id",
  authenticateToken,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `DELETE FROM projects
         WHERE project_id = $1
         RETURNING project_id`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      res.json({
        message: "Project deleted successfully",
      });
    } catch (error) {
      console.error("Delete project error:", error);

      res.status(500).json({
        message: "Failed to delete project",
      });
    }
  }
);

module.exports = router;