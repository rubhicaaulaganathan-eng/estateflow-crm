const express = require("express");

const pool = require("../db");
const { comparePassword, createToken } = require("../auth");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await pool.query(
      `SELECT employee_id, full_name, email, password_hash, role, status
       FROM employees
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const employee = result.rows[0];

    if (employee.status !== "ACTIVE") {
      return res.status(403).json({
        message: "This account is inactive",
      });
    }

    const passwordMatches = await comparePassword(
      password,
      employee.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = createToken({
      employeeId: employee.employee_id,
      role: employee.role,
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        employeeId: employee.employee_id,
        name: employee.full_name,
        email: employee.email,
        role: employee.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
});
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT employee_id, full_name, email, role, status
       FROM employees
       WHERE employee_id = $1`,
      [req.user.employeeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = result.rows[0];

    res.json({
      user: {
        employeeId: user.employee_id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
});
router.get(
  "/admin-test",
  authenticateToken,
  requireRole("ADMIN"),
  (req, res) => {
    res.json({
      message: "Admin access granted",
      user: req.user,
    });
  }
);router.get(
  "/admin-test",
  authenticateToken,
  requireRole("ADMIN"),
  (req, res) => {
    res.json({
      message: "Admin access granted",
      user: req.user,
    });
  }
);
module.exports = router;