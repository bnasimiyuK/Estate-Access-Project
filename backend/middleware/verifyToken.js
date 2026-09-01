// backend/middleware/verifyToken.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// ==========================================
// 🔐 Verify JWT Token Middleware
// ==========================================
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Missing Authorization header." });
  }

  // Expected format: "Bearer <token>"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing." });
  }

  try {
    // Verify token with secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");

    // Attach decoded user info (includes role, ResidentID, etc.)
    req.user = decoded;

    // ✅ Proceed to next middleware or controller
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.name, "-", error.message);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};
