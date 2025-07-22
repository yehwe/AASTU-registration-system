const express = require("express");
const { pool } = require("../config/database");
const { authenticateToken, authorizeRole, checkUserExists } = require("../middleware/auth");

const router = express.Router();

// Get teacher profile (joined with user info)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT t.*, u.email, u.role, d.name as department_name, d.code as department_code
       FROM teachers t
       JOIN users u ON t.user_id = u.id
       LEFT JOIN departments d ON t.department_id = d.id
       WHERE t.user_id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    const teacher = rows[0];
    // Always include role: 'teacher' in the response
    res.json({ ...teacher, role: 'teacher' });
  } catch (error) {
    console.error("Error fetching teacher profile:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Get teacher's courses
router.get("/courses", authenticateToken, checkUserExists, authorizeRole(["teacher"]), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, COUNT(e.id) as enrolled_count
       FROM courses c
       LEFT JOIN course_enrollments e ON c.id = e.course_id AND e.status = 'enrolled'
       WHERE c.teacher_id = ?
       GROUP BY c.id
       ORDER BY c.course_code`,
      [req.user.id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching teacher courses:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Create new course (teachers only)
router.post("/courses", authenticateToken, checkUserExists, authorizeRole(["teacher"]), async (req, res) => {
  console.log("Received request to create course");
  console.log("User:", req.user);
  console.log("Request body:", req.body);

  const connection = await pool.getConnection();

  try {
    const { course_code, title, credits, description, prerequisites, syllabus } = req.body;

    if (!course_code || !title || !description) {
      console.log("Missing required fields");
      return res.status(400).json({ error: "Course code, title, and description are required" });
    }

    // Get teacher's numeric id and department_id
    console.log("Fetching teacher's id and department_id for user_id:", req.user.id);
    const [teacherRows] = await connection.execute(
      "SELECT id, department_id FROM teachers WHERE user_id = ?",
      [req.user.id]
    );

    if (teacherRows.length === 0) {
      console.log("Teacher not found for user_id:", req.user.id);
      return res.status(404).json({ error: "Teacher not found" });
    }

    const teacher_numeric_id = teacherRows[0].id;
    const department_id = teacherRows[0].department_id;
    console.log("Found teacher id:", teacher_numeric_id, "department_id:", department_id);

    // Check if course code already exists
    console.log("Checking if course code exists:", course_code);
    const [existingCourses] = await connection.execute(
      "SELECT id FROM courses WHERE course_code = ?",
      [course_code]
    );

    if (existingCourses.length > 0) {
      console.log("Course code already exists:", course_code);
      return res.status(400).json({ error: "Course code already exists" });
    }

    await connection.beginTransaction();
    console.log("Starting transaction");

    const [result] = await connection.execute(
      `INSERT INTO courses (
        course_code, 
        title, 
        description, 
        credits, 
        department_id, 
        teacher_id, 
        semester, 
        year, 
        max_students
      ) VALUES (?, ?, ?, ?, ?, ?, 1, 1, 50)`,
      [
        course_code,
        title,
        description,
        credits || 3,
        department_id,
        teacher_numeric_id
      ]
    );

    await connection.commit();
    console.log("Course created successfully with ID:", result.insertId);

    res.status(201).json({ 
      message: "Course created successfully", 
      courseId: result.insertId,
      course: {
        id: result.insertId,
        course_code,
        title,
        description,
        credits: credits || 3,
        department_id,
        teacher_id: teacher_numeric_id,
        semester: 1,
        year: 1,
        max_students: 50
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating course:", error);

    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "Course code already exists" });
    } else {
      res.status(500).json({ error: "Failed to create course" });
    }
  } finally {
    connection.release();
  }
});

// Get students enrolled in teacher's course
router.get("/courses/:id/students", authenticateToken, checkUserExists, authorizeRole(["teacher"]), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.first_name, u.last_name, u.email, e.enrollment_date, e.status
       FROM course_enrollments e
       JOIN students s ON e.student_id = s.id
       JOIN users u ON s.user_id = u.id
       JOIN courses c ON e.course_id = c.id
       WHERE c.id = ? AND c.teacher_id = ?
       ORDER BY u.last_name, u.first_name`,
      [req.params.id, req.user.id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching course students:", error);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router; 