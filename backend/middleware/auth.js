const jwt = require("jsonwebtoken")
const { pool } = require("../config/database")

// Authentication middleware
const authenticateToken = (req, res, next) => {
  console.log("Authenticating token...");
  const authHeader = req.headers["authorization"]
  console.log("Auth header:", authHeader);
  const token = authHeader && authHeader.split(" ")[1]
  console.log("Token:", token ? "Present" : "Missing");

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ error: "Access token required" })
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET)
    console.log("Token verified, user:", user);
    req.user = user
    next()
  } catch (err) {
    console.error("Token verification error:", err)
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token has expired" })
    }
    return res.status(403).json({ error: "Invalid token" })
  }
}

// Role-based authorization middleware
const authorizeRole = (roles) => {
  return (req, res, next) => {
    console.log("Authorizing role...");
    console.log("User role:", req.user.role);
    console.log("Required roles:", roles);
    
    if (!roles.includes(req.user.role)) {
      console.log("Insufficient permissions");
      return res.status(403).json({ error: "Insufficient permissions" })
    }
    console.log("Role authorized");
    next()
  }
}

// Check if user exists and is active
const checkUserExists = async (req, res, next) => {
  try {
    console.log("Checking if user exists...");
    console.log("User ID:", req.user.id);
    
    const [rows] = await pool.execute("SELECT id, role FROM users WHERE id = ?", [req.user.id])
    console.log("User query result:", rows);

    if (rows.length === 0) {
      console.log("User not found");
      return res.status(404).json({ error: "User not found" })
    }

    req.user.role = rows[0].role // Update role in case it changed
    console.log("User exists, role:", rows[0].role);
    next()
  } catch (error) {
    console.error("Error checking user:", error)
    res.status(500).json({ error: "Database error" })
  }
}

module.exports = {
  authenticateToken,
  authorizeRole,
  checkUserExists,
}
