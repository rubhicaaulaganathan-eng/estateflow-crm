const express = require("express");

const pool = require("../db");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

const validStages = [
  "NEW",
  "CONTACTED",
  "SITE_VISIT",
  "INTERESTED",
  "NEGOTIATION",
  "BOOKED",
  "LOST",
];

// Get leads
router.get("/", authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT
        l.lead_id,
        l.full_name,
        l.phone,
        l.email,
        l.stage,
        l.notes,
        l.next_follow_up,
        l.project_id,
        p.project_name,
        l.assigned_employee_id,
        e.full_name AS assigned_employee
      FROM leads l
      LEFT JOIN projects p
        ON p.project_id = l.project_id
      LEFT JOIN employees e
        ON e.employee_id = l.assigned_employee_id
    `;

    const values = [];

    // Sales employees see only their assigned leads
    if (req.user.role === "SALES") {
      query += `
        WHERE l.assigned_employee_id = $1
      `;
      values.push(req.user.employeeId);
    }

    query += ` ORDER BY l.lead_id DESC`;

    const result = await pool.query(query, values);

    res.json({
      leads: result.rows,
    });
  } catch (error) {
    console.error("Get leads error:", error);

    res.status(500).json({
      message: "Failed to fetch leads",
    });
  }
});

// Create lead
router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN", "SALES"),
  async (req, res) => {
    try {
      const {
        fullName,
        phone,
        email,
        projectId,
        assignedEmployeeId,
        stage = "NEW",
        notes,
        nextFollowUp,
      } = req.body;

      if (!fullName || !phone) {
        return res.status(400).json({
          message: "Name and phone are required",
        });
      }

      if (!validStages.includes(stage)) {
        return res.status(400).json({
          message: "Invalid lead stage",
        });
      }

      // Admin can assign a Sales employee.
      // Sales can only create a lead for themselves.
      let finalAssignedEmployeeId = assignedEmployeeId || null;

      if (req.user.role === "SALES") {
        finalAssignedEmployeeId = req.user.employeeId;
      }

      if (finalAssignedEmployeeId) {
        const employeeResult = await pool.query(
          `SELECT employee_id
           FROM employees
           WHERE employee_id = $1
             AND role = 'SALES'
             AND status = 'ACTIVE'`,
          [finalAssignedEmployeeId]
        );

        if (employeeResult.rows.length === 0) {
          return res.status(400).json({
            message: "Selected sales employee is not active",
          });
        }
      }

      const result = await pool.query(
        `INSERT INTO leads
          (
            full_name,
            phone,
            email,
            project_id,
            assigned_employee_id,
            stage,
            notes,
            next_follow_up
          )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          fullName,
          phone,
          email || null,
          projectId || null,
          finalAssignedEmployeeId,
          stage,
          notes || null,
          nextFollowUp || null,
        ]
      );

      res.status(201).json({
        message: "Lead created successfully",
        lead: result.rows[0],
      });
    } catch (error) {
      console.error("Create lead error:", error);

      res.status(500).json({
        message: "Failed to create lead",
      });
    }
  }
);

// Edit lead
router.put(
  "/:id",
  authenticateToken,
  requireRole("ADMIN", "SALES"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        fullName,
        phone,
        email,
        projectId,
        assignedEmployeeId,
        stage,
        notes,
        nextFollowUp,
      } = req.body;

      if (!fullName || !phone || !stage) {
        return res.status(400).json({
          message: "Name, phone and stage are required",
        });
      }

      if (!validStages.includes(stage)) {
        return res.status(400).json({
          message: "Invalid lead stage",
        });
      }

      let finalAssignedEmployeeId =
        assignedEmployeeId || null;

      // Sales cannot reassign leads.
      if (req.user.role === "SALES") {
        finalAssignedEmployeeId = req.user.employeeId;
      }

      if (finalAssignedEmployeeId) {
        const employeeResult = await pool.query(
          `SELECT employee_id
           FROM employees
           WHERE employee_id = $1
             AND role = 'SALES'
             AND status = 'ACTIVE'`,
          [finalAssignedEmployeeId]
        );

        if (employeeResult.rows.length === 0) {
          return res.status(400).json({
            message: "Selected sales employee is not active",
          });
        }
      }

      let query = `
        UPDATE leads
        SET
          full_name = $1,
          phone = $2,
          email = $3,
          project_id = $4,
          assigned_employee_id = $5,
          stage = $6,
          notes = $7,
          next_follow_up = $8
        WHERE lead_id = $9
      `;

      let values = [
        fullName,
        phone,
        email || null,
        projectId || null,
        finalAssignedEmployeeId,
        stage,
        notes || null,
        nextFollowUp || null,
        id,
      ];

      // Sales can edit only their own assigned lead.
      if (req.user.role === "SALES") {
        query += ` AND assigned_employee_id = $10`;
        values.push(req.user.employeeId);
      }

      query += ` RETURNING *`;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Lead not found or not assigned to you",
        });
      }

      res.json({
        message: "Lead updated successfully",
        lead: result.rows[0],
      });
    } catch (error) {
      console.error("Update lead error:", error);

      res.status(500).json({
        message: "Failed to update lead",
      });
    }
  }
);

// Assign / reassign lead - ADMIN only
router.patch(
  "/:id/assign",
  authenticateToken,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { employeeId } = req.body;

      if (!employeeId) {
        return res.status(400).json({
          message: "Employee ID is required",
        });
      }

      const employeeResult = await pool.query(
        `SELECT employee_id
         FROM employees
         WHERE employee_id = $1
           AND role = 'SALES'
           AND status = 'ACTIVE'`,
        [employeeId]
      );

      if (employeeResult.rows.length === 0) {
        return res.status(400).json({
          message: "Active sales employee not found",
        });
      }

      const result = await pool.query(
        `UPDATE leads
         SET assigned_employee_id = $1
         WHERE lead_id = $2
         RETURNING lead_id, full_name, assigned_employee_id`,
        [employeeId, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Lead not found",
        });
      }

      res.json({
        message: "Lead assigned successfully",
        lead: result.rows[0],
      });
    } catch (error) {
      console.error("Assign lead error:", error);

      res.status(500).json({
        message: "Failed to assign lead",
      });
    }
  }
);

module.exports = router;