const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });
}

module.exports = {
  hashPassword,
  comparePassword,
  createToken,
};