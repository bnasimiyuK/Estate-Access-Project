// ================================
// backend/db.js
// ================================

import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

// 🔧 SQL Server configuration
const dbConfig = {
  user: process.env.DB_USER || "Beverly",
  password: process.env.DB_PASSWORD || "Bev@1234567",
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "EstateAccessManagementSystem",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: false, // set true if using Azure SQL
    trustServerCertificate: true,
  },
};

// 🧩 Keep a single shared pool connection
let poolPromise = null;

export const getPool = async () => {
  try {
    if (!poolPromise) {
      poolPromise = sql.connect(dbConfig)
        .then(pool => {
          console.log("✅ Connected to SQL Server (shared pool)");
          return pool;
        })
        .catch(err => {
          console.error("❌ SQL connection failed:", err.message);
          poolPromise = null; // reset if connection failed
          throw err;
        });
    }
    return poolPromise;
  } catch (err) {
    console.error("❌ Database Connection Error:", err);
    throw err;
  }
};

// ✅ For convenience, also export `sql`
export { sql };
