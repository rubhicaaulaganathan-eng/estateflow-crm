const express = require("express");

const pool = require("../db");
const { hashPassword } = require("../auth");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get all employees
router.get(
  "/",
  authenticateToken,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          e.employee_id,
          e.full_name,
          e.email,
          e.role,
          e.status,
          COUNT(l.lead_id)::int AS assigned_leads
        FROM employees e
        LEFT JOIN leads l
          ON l.assigned_employee_id = e.employee_id
        GROUP BY
          e.employee_id,
          e.full_name,
          e.email,
          e.role,
          e.status
        ORDER BY e.employee_id DESC
      `);

      res.json({
        employees: result.rows,
      });
    } catch (error) {
      console.error("Get employees error:", error);

      res.status(500).json({
        message: "Failed to fetch employees",
      });
    }
  }
);

// Add employee
router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const {
        fullName,
        email,
        password,
        role = "SALES",
        status = "ACTIVE",
      } = req.body;

      if (!fullName || !email || !password) {
        return res.status(400).json({
          message: "Name, email and password are required",
        });
      }

      const existing = await pool.query(
        "SELECT employee_id FROM employees WHERE email = $1",
        [email]
      );

      if (existing.rows.length > 0) {
        return res.status(409).json({
          message: "Employee with this email already exists",
        });
      }

      const passwordHash = await hashPassword(password);

      const result = await pool.query(
        `INSERT INTO employees
          (full_name, email, password_hash, role, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING employee_id, full_name, email, role, status`,
        [
          fullName,
          email,
          passwordHash,
          role,
          status,
        ]
      );

      res.status(201).json({
        message: "Employee created successfully",
        employee: result.rows[0],
      });
    } catch (error) {
      console.error("Create employee error:", error);

      res.status(500).json({
        message: "Failed to create employee",
      });
    }
  }
);

module.exports = router;