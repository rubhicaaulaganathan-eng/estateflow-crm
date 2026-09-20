const express = require("express");

const pool = require("../db");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get all bookings
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        b.booking_id,
        b.booking_amount,
        b.status,
        b.booking_date,
        b.notes,
        l.lead_id,
        l.full_name AS customer_name,
        l.phone,
        u.unit_id,
        u.unit_number,
        bu.building_name,
        p.project_name,
        e.full_name AS employee_name
      FROM bookings b
      JOIN leads l ON l.lead_id = b.lead_id
      JOIN units u ON u.unit_id = b.unit_id
      JOIN buildings bu ON bu.building_id = u.building_id
      JOIN projects p ON p.project_id = bu.project_id
      LEFT JOIN employees e ON e.employee_id = b.employee_id
      ORDER BY b.booking_id DESC
    `);

    res.json({
      bookings: result.rows,
    });
  } catch (error) {
    console.error("Get bookings error:", error);

    res.status(500).json({
      message: "Failed to fetch bookings",
    });
  }
});

// Create booking
router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN", "SALES"),
  async (req, res) => {
    const client = await pool.connect();

    try {
      const {
        leadId,
        unitId,
        bookingAmount,
        notes,
      } = req.body;

      if (!leadId || !unitId || bookingAmount === undefined) {
        return res.status(400).json({
          message: "Lead, unit and booking amount are required",
        });
      }

      await client.query("BEGIN");

      // Check unit availability and lock the row
      const unitResult = await client.query(
        `SELECT unit_id, status
         FROM units
         WHERE unit_id = $1
         FOR UPDATE`,
        [unitId]
      );

      if (unitResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          message: "Unit not found",
        });
      }

      if (unitResult.rows[0].status !== "AVAILABLE") {
        await client.query("ROLLBACK");

        return res.status(409).json({
          message: "Unit is not available for booking",
        });
      }

      // Create booking
      const bookingResult = await client.query(
        `INSERT INTO bookings
          (lead_id, unit_id, employee_id, booking_amount, status, notes)
         VALUES ($1, $2, $3, $4, 'CONFIRMED', $5)
         RETURNING *`,
        [
          leadId,
          unitId,
          req.user.employeeId,
          bookingAmount,
          notes || null,
        ]
      );

      // Mark unit as BOOKED
      await client.query(
        `UPDATE units
         SET status = 'BOOKED',
             updated_at = CURRENT_TIMESTAMP
         WHERE unit_id = $1`,
        [unitId]
      );

      // Mark lead as BOOKED
      await client.query(
        `UPDATE leads
         SET stage = 'BOOKED'
         WHERE lead_id = $1`,
        [leadId]
      );

      await client.query("COMMIT");

      res.status(201).json({
        message: "Booking created successfully",
        booking: bookingResult.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");

      console.error("Create booking error:", error);

      if (error.code === "23505") {
        return res.status(409).json({
          message: "This unit already has an active booking",
        });
      }

      res.status(500).json({
        message: "Failed to create booking",
      });
    } finally {
      client.release();
    }
  }
);

// Cancel booking
router.patch(
  "/:id/cancel",
  authenticateToken,
  requireRole("ADMIN", "SALES"),
  async (req, res) => {
    const client = await pool.connect();

    try {
      const { id } = req.params;

      await client.query("BEGIN");

      const bookingResult = await client.query(
        `UPDATE bookings
         SET status = 'CANCELLED',
             updated_at = CURRENT_TIMESTAMP
         WHERE booking_id = $1
           AND status IN ('PENDING', 'CONFIRMED')
         RETURNING unit_id`,
        [id]
      );

      if (bookingResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          message: "Active booking not found",
        });
      }

      // Make the unit available again
      await client.query(
        `UPDATE units
         SET status = 'AVAILABLE',
             updated_at = CURRENT_TIMESTAMP
         WHERE unit_id = $1`,
        [bookingResult.rows[0].unit_id]
      );

      await client.query("COMMIT");

      res.json({
        message: "Booking cancelled successfully",
      });
    } catch (error) {
      await client.query("ROLLBACK");

      console.error("Cancel booking error:", error);

      res.status(500).json({
        message: "Failed to cancel booking",
      });
    } finally {
      client.release();
    }
  }
);

module.exports = router;