import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * 🔐 Verify accessToken from Authorization header
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader) {
    return res.status(401).json({ success: false, message: "No accessToken provided." });
  }

  // Extract accessToken cleanly
  const accessToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!accessToken) {
    return res.status(401).json({ success: false, message: "Invalid accessToken format." });
  }

  jwt.verify(
    accessToken,
    process.env.JWT_SECRET || "supersecretkey",
    (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Invalid or expired accessToken." });
      }

      req.user = decoded;
      next();
    }
  );
}

/**
 * 🛡️ Admin Role Check
 */
export function isAdmin(req, res, next) {
  const user = req.user || {};

  const role = user.role || user.Role || "";
  const roleId = user.roleId ?? user.RoleID ?? null;

  const normalizedRole = String(role).trim().toLowerCase();

  // Allow standard admin titles and role IDs
  const allowedRoles = ["admin", "full", "finance", "guard"];

  if (allowedRoles.includes(normalizedRole) || roleId === 1) {
    return next();
  }

  console.warn("⛔ isAdmin blocked access:", { normalizedRole, roleId });
  return res.status(403).json({ success: false, message: "Access denied for your role." });
}