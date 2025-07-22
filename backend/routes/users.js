const express = require("express")
const { pool } = require("../config/database")
const { authenticateToken, checkUserExists } = require("../middleware/auth")

const router = express.Router()

// Get user profile
router.get("/profile", authenticateToken, checkUserExists, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, email, role FROM users WHERE id = ?`,
      [req.user.id],
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(rows[0])
  } catch (error) {
    console.error("Error fetching profile:", error)
    res.status(500).json({ error: "Database error" })
  }
})

// Update user profile
router.put("/profile", authenticateToken, checkUserExists, async (req, res) => {
  const connection = await pool.getConnection()

  try {
    const { firstName, lastName, phone, address, emergencyContact } = req.body

    if (!firstName || !lastName) {
      return res.status(400).json({ error: "First name and last name are required" })
    }

    await connection.beginTransaction()

    await connection.execute(
      `UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ?, emergency_contact = ? 
       WHERE id = ?`,
      [firstName, lastName, phone, address, emergencyContact, req.user.id],
    )

    await connection.commit()
    res.json({ message: "Profile updated successfully" })
  } catch (error) {
    await connection.rollback()
    console.error("Error updating profile:", error)
    res.status(500).json({ error: "Failed to update profile" })
  } finally {
    connection.release()
  }
})

module.exports = router
