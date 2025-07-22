const express = require("express");
const { pool } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get all departments
router.get("/", authenticateToken, async (req, res) => {
  try {
    const [departments] = await pool.execute(
      "SELECT id, name, code, description FROM departments WHERE status = 'active'"
    );
    
    // If no departments exist, insert some default ones
    if (departments.length === 0) {
      const defaultDepartments = [
        ['Computer Science', 'CS', 'Department of Computer Science and Engineering'],
        ['Electrical Engineering', 'EE', 'Department of Electrical Engineering'],
        ['Mechanical Engineering', 'ME', 'Department of Mechanical Engineering'],
        ['Civil Engineering', 'CE', 'Department of Civil Engineering'],
        ['Information Technology', 'IT', 'Department of Information Technology']
      ];
      
      await pool.execute(
        "INSERT INTO departments (name, code, description) VALUES ?",
        [defaultDepartments]
      );
      
      // Fetch the newly inserted departments
      const [newDepartments] = await pool.execute(
        "SELECT id, name, code, description FROM departments"
      );
      return res.json(newDepartments);
    }
    
    res.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

module.exports = router; 