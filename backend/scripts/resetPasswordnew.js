// backend/scripts/resetPassword.js
import bcrypt from "bcryptjs";
import sql from "mssql";
import dbConfig from "../config/dbConfig.js";

// Set SALT_ROUNDS to match whatever your login/register code uses
// (check your registerUser / authController — usually 10)
const SALT_ROUNDS = 10;

// --- Option A: reset a fixed list (bulk reset) ---
const USERS_TO_RESET = [
  { email: "beulahbev2005@gmail.com", newPassword: "TempPass123!" },
  
];

// --- Option B: reset a single user via CLI args ---
// Usage: node resetPassword.js user@example.com NewPassword123!
const [, , cliEmail, cliPassword] = process.argv;

async function resetPasswords() {
  const pool = await sql.connect(dbConfig);

  const targets = cliEmail && cliPassword
    ? [{ email: cliEmail, newPassword: cliPassword }]
    : USERS_TO_RESET;

  for (const user of targets) {
    const hashed = await bcrypt.hash(user.newPassword, SALT_ROUNDS);

    const result = await pool.request()
      .input("Email", sql.VarChar, user.email)
      .input("PasswordHash", sql.VarChar, hashed)
      .query(`
        UPDATE Users
        SET PasswordHash = @PasswordHash
        WHERE Email = @Email
      `);

    if (result.rowsAffected[0] === 0) {
      console.warn(`⚠️  No user found for ${user.email} — nothing updated`);
    } else {
      console.log(`✅ Password reset for ${user.email}`);
    }
  }

  await pool.close();
  process.exit(0);
}

resetPasswords().catch(err => {
  console.error("❌ Reset failed:", err);
  process.exit(1);
});