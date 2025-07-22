const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { pool } = require("../config/database")

const router = express.Router()

// Register endpoint
router.post("/register", async (req, res) => {
  const connection = await pool.getConnection()

  try {
    console.log("Received registration request body:", req.body);
    
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      role = "student", 
      phone, 
      address, 
      emergencyContact,
      studentId,
      year,
      semester,
      departmentId,
      gender,
      dateOfBirth,
      enrollmentDate = new Date().toISOString().split('T')[0]
    } = req.body

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      console.log("Missing required fields:", { email, firstName, lastName });
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("Invalid email format:", email);
      return res.status(400).json({ error: "Invalid email format" })
    }

    // Validate password strength
    if (password.length < 8) {
      console.log("Password too short");
      return res.status(400).json({
        error: "Password must be at least 8 characters long"
      })
    }

    await connection.beginTransaction()

    try {
      // Check if user already exists
      const [existingUsers] = await connection.execute(
        "SELECT id FROM users WHERE email = ?",
        [email]
      )

      if (existingUsers.length > 0) {
        console.log("User already exists:", email);
        await connection.rollback()
        return res.status(400).json({ error: "User already exists" })
      }

      // Hash password
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      console.log("Creating user record...");
      // Insert user
      const [userResult] = await connection.execute(
        "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
        [email, hashedPassword, role]
      )

      const userId = userResult.insertId
      console.log("User created with ID:", userId);

      if (!userId) {
        throw new Error("Failed to create user record");
      }

      // Insert student record if role is student
      if (role === "student") {
        console.log("Creating student record...");
        
        // Generate a unique student_id
        const studentId = `STU${userId}`;
        
        // Set default values for optional fields
        const defaultValues = {
          gender: 'other',
          dateOfBirth: '2000-01-01',
          phone: '',
          address: '',
          departmentId: 1,
          year: 1,
          semester: 1
        };

        console.log("Checking department...");
        // First check if department exists
        const [department] = await connection.execute(
          "SELECT id FROM departments WHERE id = ?",
          [departmentId || defaultValues.departmentId]
        );

        if (department.length === 0) {
          console.log("Department not found:", departmentId || defaultValues.departmentId);
          throw new Error("Invalid department ID");
        }

        console.log("Department found, inserting student record...");
        console.log("Student data:", {
          userId,
          studentId,
          firstName,
          lastName,
          gender: gender || defaultValues.gender,
          dateOfBirth: dateOfBirth || defaultValues.dateOfBirth,
          phone: phone || defaultValues.phone,
          address: address || defaultValues.address,
          departmentId: departmentId || defaultValues.departmentId,
          year: year || defaultValues.year,
          semester: semester || defaultValues.semester
        });

        try {
          // Insert student record
          const [studentResult] = await connection.execute(
            `INSERT INTO students (
              user_id, student_id, first_name, last_name, gender, date_of_birth, 
              phone, address, department_id, year, semester, enrollment_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              userId,
              studentId,
              firstName,
              lastName,
              gender || defaultValues.gender,
              dateOfBirth || defaultValues.dateOfBirth,
              phone || defaultValues.phone,
              address || defaultValues.address,
              departmentId || defaultValues.departmentId,
              year || defaultValues.year,
              semester || defaultValues.semester,
              enrollmentDate
            ]
          );

          console.log("Student record created:", studentResult);

          if (!studentResult.insertId) {
            throw new Error("Failed to create student record");
          }
        } catch (error) {
          console.error("Error creating student record:", error);
          throw error;
        }
      }

      // Insert teacher record if role is teacher
      if (role === "teacher") {
        console.log("Creating teacher record...");
        
        // Generate a unique teacher_id
        const teacherId = `TCHR${userId}`;
        
        // Set default values for optional fields
        const defaultValues = {
          gender: 'other',
          dateOfBirth: '2000-01-01',
          phone: '',
          address: '',
          departmentId: 1,
          qualification: 'Not specified',
          specialization: 'Not specified'
        };

        console.log("Checking department...");
        // First check if department exists
        const [department] = await connection.execute(
          "SELECT id FROM departments WHERE id = ?",
          [departmentId || defaultValues.departmentId]
        );

        if (department.length === 0) {
          console.log("Department not found:", departmentId || defaultValues.departmentId);
          throw new Error("Invalid department ID");
        }

        console.log("Department found, inserting teacher record...");
        console.log("Teacher data:", {
          userId,
          teacherId,
          firstName,
          lastName,
          gender: gender || defaultValues.gender,
          dateOfBirth: dateOfBirth || defaultValues.dateOfBirth,
          phone: phone || defaultValues.phone,
          address: address || defaultValues.address,
          departmentId: departmentId || defaultValues.departmentId
        });

        // Insert teacher record (without hire_date)
        const [teacherResult] = await connection.execute(
          `INSERT INTO teachers (
            user_id, teacher_id, first_name, last_name, gender, date_of_birth, 
            phone, address, department_id, qualification, specialization
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            teacherId,
            firstName,
            lastName,
            gender || defaultValues.gender,
            dateOfBirth || defaultValues.dateOfBirth,
            phone || defaultValues.phone,
            address || defaultValues.address,
            departmentId || defaultValues.departmentId,
            defaultValues.qualification,
            defaultValues.specialization
          ]
        );

        console.log("Teacher record created:", teacherResult);

        if (!teacherResult.insertId) {
          throw new Error("Failed to create teacher record");
        }
      }

      await connection.commit()
      console.log("Registration completed successfully");

      // Generate JWT token
      const token = jwt.sign(
        { id: userId, email, role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      )

      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: userId,
          email,
          role,
          firstName,
          lastName
        }
      })
    } catch (error) {
      console.error("Database operation error:", {
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
        sqlState: error.sqlState
      });
      await connection.rollback()
      throw error;
    }
  } catch (error) {
    console.error("Registration error details:", {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    })

    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "User already exists" })
    } else if (error.code === "ER_NO_REFERENCED_ROW") {
      res.status(400).json({ error: "Invalid department ID" })
    } else if (error.message === "Invalid department ID") {
      res.status(400).json({ error: "Invalid department ID" })
    } else if (error.message === "Failed to create teacher record") {
      res.status(500).json({ error: "Failed to create teacher record" })
    } else if (error.message === "Failed to create user record") {
      res.status(500).json({ error: "Failed to create user record" })
    } else {
      res.status(500).json({ 
        error: "Failed to create user",
        details: error.message
      })
    }
  } finally {
    connection.release()
  }
})

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    // Get user from database with role-specific information
    const [rows] = await pool.execute(
      `SELECT 
        u.*,
        CASE 
          WHEN u.role = 'student' THEN s.first_name
          WHEN u.role = 'teacher' THEN t.first_name
          ELSE NULL
        END as first_name,
        CASE 
          WHEN u.role = 'student' THEN s.last_name
          WHEN u.role = 'teacher' THEN t.last_name
          ELSE NULL
        END as last_name,
        CASE 
          WHEN u.role = 'student' THEN s.student_id
          WHEN u.role = 'teacher' THEN t.teacher_id
          ELSE NULL
        END as id_number,
        CASE 
          WHEN u.role = 'student' THEN s.department_id
          WHEN u.role = 'teacher' THEN t.department_id
          ELSE NULL
        END as department_id
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN teachers t ON u.id = t.user_id
      WHERE u.email = ?`,
      [email]
    )

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    const user = rows[0]

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    )

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        idNumber: user.id_number,
        departmentId: user.department_id
      }
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Login failed" })
  }
})

// Get departments endpoint
router.get("/departments", async (req, res) => {
  try {
    const [departments] = await pool.execute(
      "SELECT id, name, code, description FROM departments"
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
})

module.exports = router
