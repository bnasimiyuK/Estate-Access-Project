// ==========================================
// backend/routes/authRoutes.js
// ==========================================
// Self-contained version: dbConfig, verifyToken, and isAdmin all live in
// this file, matching the behavior of your working "existing" version.
// If you'd rather split them into separate files (config/dbConfig.js,
// middleware/verifyToken.js), see the note at the bottom of this file.

import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import sql from "mssql";

const router = express.Router();

// ================= DATABASE CONFIG =================
const dbConfig = {
  user: process.env.DB_USER || "Beverly",
  password: process.env.DB_PASSWORD || "Bev@12345678",
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "EstateAccessManagementSystem",
  options: { encrypt: false, trustServerCertificate: true },
};

// ================= LOGIN ROUTE =================
router.post("/login", async (req, res) => {
  const { Email, username, Password, password } = req.body;
  const userIdentifier = Email || username;
  const userPassword = Password || password;

  if (!userIdentifier || !userPassword) {
    return res.status(400).json({ message: "Email/Username and Password are required." });
  }

  try {
    const pool = await sql.connect(dbConfig);

    // LEFT JOIN on Roles/Residents so a user with no matching role or
    // resident row can still log in (rather than silently disappearing).
    const result = await pool
      .request()
      .input("Identifier", sql.VarChar, userIdentifier)
      .query(`
        SELECT TOP 1
          U.UserID, U.Username, U.Email, U.PasswordHash, U.RoleID, U.FullName, U.Status,
          R.RoleName AS Role,
          Res.ResidentID, Res.PhoneNumber
        FROM Users U
        LEFT JOIN Roles R ON U.RoleID = R.RoleID
        LEFT JOIN Residents Res ON U.UserID = Res.UserID
        WHERE (U.Email = @Identifier OR U.Username = @Identifier)
      `);

    const user = result.recordset[0];
    if (!user) return res.status(401).json({ message: "Invalid email or password." });

    const validPassword = await bcrypt.compare(userPassword, user.PasswordHash);
    if (!validPassword) return res.status(401).json({ message: "Invalid email or password." });

    const roleName = String(user.Role || "").trim().toLowerCase();
    const effectiveResidentID = user.ResidentID || (roleName === "resident" ? user.UserID : null);

    // ================= JWT CREATION =================
    // Duplicate keys (both casing styles) so any controller reading either
    // PascalCase or camelCase off req.user keeps working.
    const payload = {
      UserID: user.UserID,
      userId: user.UserID,
      Role: user.Role || roleName,
      role: roleName,
      RoleID: Number(user.RoleID),
      roleId: Number(user.RoleID),
      FullName: user.FullName,
      fullName: user.FullName,
      Email: user.Email,
      ResidentID: effectiveResidentID,
      residentId: effectiveResidentID,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || "supersecretkey", { expiresIn: "7d" });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET || "refreshsupersecret", { expiresIn: "14d" });

    // ================= RESPONSE =================
    res.json({
      message: "Login successful",
      accessToken,
      token: accessToken,
      refreshToken,
      fullName: user.FullName,
      role: user.Role || roleName,
      roleId: Number(user.RoleID),
      userId: user.UserID,
      UserID: user.UserID,
      Email: user.Email,
      ResidentID: effectiveResidentID,
      residentId: effectiveResidentID,
      PhoneNumber: user.PhoneNumber || "",
    });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

// ================= TOKEN REFRESH ROUTE =================
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token provided." });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET || "refreshsupersecret");

    const newAccessToken = jwt.sign(
      {
        UserID: decoded.UserID || decoded.userId,
        userId: decoded.userId || decoded.UserID,
        Role: decoded.Role || decoded.role,
        role: decoded.role || decoded.Role,
        RoleID: decoded.RoleID || decoded.roleId,
        roleId: decoded.roleId || decoded.RoleID,
        FullName: decoded.FullName || decoded.fullName,
        fullName: decoded.fullName || decoded.FullName,
        Email: decoded.Email,
        ResidentID: decoded.ResidentID || decoded.residentId,
        residentId: decoded.residentId || decoded.ResidentID,
      },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "7d" }
    );

    res.json({ accessToken: newAccessToken, token: newAccessToken });
  } catch (err) {
    console.error("❌ Refresh token error:", err);
    return res.status(403).json({ message: "Invalid or expired refresh token." });
  }
});

// ================= TOKEN VERIFICATION =================
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided." });

  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ message: "Access token expired." });
    return res.status(403).json({ message: "Invalid token." });
  }
};

// ================= ADMIN-ONLY AUTH =================
export const isAdmin = (req, res, next) => {
  const roleId = req.user?.roleId || req.user?.RoleID;
  const roleName = req.user?.role || req.user?.Role;

  if (roleId === 1 || (roleName && String(roleName).toLowerCase() === "admin"))
    return next();

  return res.status(403).json({ message: "Access denied: Admins only." });
};

// ================= LOGOUT ROUTE =================
router.post("/logout", (req, res) => {
  res.json({ message: "Logout successful (token invalidated client-side)." });
});

export default router;

// ------------------------------------------------------------------
// NOTE: If any other file in your project does:
//   import { verifyToken, isAdmin } from "../middleware/verifyToken.js";
// you have two options:
//   1. Update those imports to point at this file instead
//      (import { verifyToken, isAdmin } from "../routes/authRoutes.js";)
//   2. Or create backend/middleware/verifyToken.js that just re-exports
//      from here:
//        export { verifyToken, isAdmin } from "../routes/authRoutes.js";
// Either works — just pick one so you don't end up with two different
// copies of this logic drifting apart again.
// ------------------------------------------------------------------