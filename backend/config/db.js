// backend/config/db.js
import dotenv from "dotenv";
import sql from "mssql";

dotenv.config();

const dbConfig = {
  user: process.env.DB_USER || "Beverly",
  password: process.env.DB_PASSWORD || "Bev@1234567",
  database: process.env.DB_NAME || "EstateAccessManagementSystem",
  server: process.env.DB_SERVER || "localhost",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// ✅ Shared connection pool (reused for all routes)
let poolPromise;

export const getPool = async () => {
  if (!poolPromise) {
    poolPromise = sql.connect(dbConfig)
      .then((pool) => {
        console.log("✅ Connected to SQL Server (shared pool)");
        return pool;
      })
      .catch((err) => {
        console.error("❌ SQL Server Connection Failed:", err);
        poolPromise = null;
        throw err;
      });
  }
  return poolPromise;
};

export default sql;
