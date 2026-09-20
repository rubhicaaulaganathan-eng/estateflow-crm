require("dotenv").config();

const pool = require("./db");
const { hashPassword } = require("./auth");

async function createAdmin() {
  try {
    const existingAdmin = await pool.query(
      "SELECT employee_id FROM employees WHERE email = $1",
      [process.env.ADMIN_EMAIL]
    );

    if (existingAdmin.rows.length > 0) {
      console.log("Admin user already exists.");
      return;
    }

    const passwordHash = await hashPassword(process.env.ADMIN_PASSWORD);

    await pool.query(
      `INSERT INTO employees
        (full_name, email, password_hash, role, status)
       VALUES ($1, $2, $3, 'ADMIN', 'ACTIVE')`,
      [
        "Sales Admin",
        process.env.ADMIN_EMAIL,
        passwordHash,
      ]
    );

    console.log("Admin user created successfully.");
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await pool.end();
  }
}

createAdmin();