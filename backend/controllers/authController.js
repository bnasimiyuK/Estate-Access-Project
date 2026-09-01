import sql from "mssql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    const pool = await sql.connect(process.env.DB_CONNECTION_STRING);

    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query(
        "SELECT TOP 1 * FROM Users WHERE Username = @username AND Status = 'Active'"
      );

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = result.recordset[0];

    const passwordMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // 🔑 If the user is a resident, fetch their ResidentID from the Residents table
    let residentId = null;
    const roleName = user.Role?.toLowerCase();

    if (roleName === "resident") {
      const residentResult = await pool
        .request()
        .input("UserID", sql.Int, user.UserID)
        .query("SELECT TOP 1 ResidentID FROM Residents WHERE UserID = @UserID");

      if (residentResult.recordset.length > 0) {
        residentId = residentResult.recordset[0].ResidentID;
      }
    }

    // 🔑 Attach ResidentID to JWT payload
    const payload = {
      UserID: user.UserID,
      RoleID: user.RoleID,
      Role: user.Role, // "Admin" / "Resident" / "Security"
      ResidentID: residentId, 
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.json({
      token,
      role: payload.Role,
      roleId: payload.RoleID,
      residentId: payload.ResidentID,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login." });
  }
}