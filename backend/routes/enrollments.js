const express = require("express")
const { pool } = require("../config/database")
const { authenticateToken, authorizeRole, checkUserExists } = require("../middleware/auth")

const router = express.Router()

// Enroll in course (students only)
router.post("/", authenticateToken, checkUserExists, authorizeRole(["student"]), async (req, res) => {
  const connection = await pool.getConnection()

  try {
    const { courseId } = req.body

    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required" })
    }

    await connection.beginTransaction()

    // Get student's numeric ID first
    const [student] = await connection.execute(
      "SELECT id FROM students WHERE user_id = ?",
      [req.user.id]
    );

    if (student.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Student record not found" });
    }

    const studentId = student[0].id;

    // Check if already enrolled
    const [existingEnrollment] = await connection.execute(
      "SELECT id FROM course_enrollments WHERE student_id = ? AND course_id = ? AND status = 'enrolled'",
      [studentId, courseId]
    );

    if (existingEnrollment.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: "Already enrolled in this course" });
    }

    // Check course capacity
    const [courseInfo] = await connection.execute(
      `SELECT c.max_students, COUNT(e.id) as enrolled_count
       FROM courses c
       LEFT JOIN course_enrollments e ON c.id = e.course_id AND e.status = 'enrolled'
       WHERE c.id = ?
       GROUP BY c.id`,
      [courseId]
    );

    if (courseInfo.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Course not found" });
    }

    if (courseInfo[0].enrolled_count >= courseInfo[0].max_students) {
      await connection.rollback();
      return res.status(400).json({ error: "Course is full" });
    }

    // Enroll student using the correct student ID
    await connection.execute(
      "INSERT INTO course_enrollments (student_id, course_id, enrollment_date) VALUES (?, ?, CURDATE())",
      [studentId, courseId]
    );

    await connection.commit()
    res.status(201).json({ message: "Enrolled successfully" })
  } catch (error) {
    await connection.rollback()
    console.error("Error enrolling in course:", error)
    res.status(500).json({ error: "Failed to enroll" })
  } finally {
    connection.release()
  }
})

// Get student's enrollments
router.get("/", authenticateToken, checkUserExists, async (req, res) => {
  try {
    // First get the student ID from the students table
    const [student] = await pool.execute(
      "SELECT id FROM students WHERE user_id = ?",
      [req.user.id]
    );

    if (student.length === 0) {
      return res.status(404).json({ error: "Student record not found" });
    }

    const studentId = student[0].id;

    const [rows] = await pool.execute(
      `SELECT e.*, c.course_code, c.course_name, c.description,
              CONCAT(u.first_name, ' ', u.last_name) as instructor_name
       FROM course_enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN users u ON c.instructor_id = u.id
       WHERE e.student_id = ? AND e.status = 'enrolled'
       ORDER BY e.enrollment_date DESC`,
      [studentId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({ error: "Database error" });
  }
})

// Unenroll from course (students only)
router.delete("/:courseId", authenticateToken, checkUserExists, authorizeRole(["student"]), async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const [result] = await connection.execute(
      "UPDATE course_enrollments SET status = 'dropped' WHERE student_id = ? AND course_id = ? AND status = 'enrolled'",
      [req.user.id, req.params.courseId],
    )

    if (result.affectedRows === 0) {
      await connection.rollback()
      return res.status(404).json({ error: "Enrollment not found" })
    }

    await connection.commit()
    res.json({ message: "Unenrolled successfully" })
  } catch (error) {
    await connection.rollback()
    console.error("Error unenrolling from course:", error)
    res.status(500).json({ error: "Failed to unenroll" })
  } finally {
    connection.release()
  }
})

module.exports = router
