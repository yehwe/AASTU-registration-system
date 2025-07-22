const express = require("express");
const { pool } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get student profile (joined with user info)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    console.log("Fetching student profile for user ID:", req.user.id);
    
    // First check if student exists
    const [studentCheck] = await pool.execute(
      "SELECT id FROM students WHERE user_id = ?",
      [req.user.id]
    );
    
    console.log("Student check result:", studentCheck);
    
    if (studentCheck.length === 0) {
      console.log("No student record found for user ID:", req.user.id);
      return res.status(404).json({ error: "Student record not found" });
    }

    const [rows] = await pool.execute(
      `SELECT s.*, u.email, u.role, d.name as department_name, d.code as department_code
       FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN departments d ON s.department_id = d.id
       WHERE s.user_id = ?`,
      [req.user.id]
    );
    
    console.log("Profile query result:", rows);
    
    if (rows.length === 0) {
      console.log("No profile data found for user ID:", req.user.id);
      return res.status(404).json({ error: "Student not found" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Update student profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    console.log("Updating student profile for user:", req.user.id);
    console.log("Request body:", req.body);
    
    const { first_name, last_name, phone, address, emergency_contact, gender, date_of_birth, year, semester, department_id } = req.body;
    
    // First check if student exists
    const [student] = await pool.execute(
      "SELECT id FROM students WHERE user_id = ?",
      [req.user.id]
    );
    
    if (student.length === 0) {
      console.log("Student not found for user:", req.user.id);
      return res.status(404).json({ error: "Student not found" });
    }
    
    const [result] = await pool.execute(
      `UPDATE students SET 
        first_name = ?, 
        last_name = ?, 
        phone = ?, 
        address = ?, 
        emergency_contact = ?, 
        gender = ?, 
        date_of_birth = ?, 
        year = ?, 
        semester = ?, 
        department_id = ? 
       WHERE user_id = ?`,
      [first_name, last_name, phone, address, emergency_contact, gender, date_of_birth, year, semester, department_id, req.user.id]
    );
    
    console.log("Update result:", result);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    
    // Fetch updated profile with department info
    const [updatedProfile] = await pool.execute(
      `SELECT s.*, u.email, u.role, d.name as department_name, d.code as department_code
       FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN departments d ON s.department_id = d.id
       WHERE s.user_id = ?`,
      [req.user.id]
    );
    
    res.json(updatedProfile[0]);
  } catch (error) {
    console.error("Error updating student profile:", error);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router; 