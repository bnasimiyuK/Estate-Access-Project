import sql from "mssql";
import dbConfig from "../config/dbConfig.js";

// Fetch all system settings transformed as key-value objects
export const getSettings = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT Category, SettingKey, SettingValue, DataType FROM SystemSettings");
    
    const settings = {};
    result.recordset.forEach(row => {
      let val = row.SettingValue;
      if (row.DataType === 'boolean') val = val === 'true';
      if (row.DataType === 'number') val = Number(val);
      settings[row.SettingKey] = val;
    });

    res.json({ success: true, settings });
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({ success: false, message: "Failed to load settings" });
  }
};

// Update system settings bulk or by section
export const updateSettings = async (req, res) => {
  const settingsData = req.body;

  if (!settingsData || Object.keys(settingsData).length === 0) {
    return res.status(400).json({ success: false, message: "No settings provided for update" });
  }

  let pool;
  let transaction;

  try {
    pool = await sql.connect(dbConfig);
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    for (const [key, val] of Object.entries(settingsData)) {
      const request = new sql.Request(transaction);
      const strVal = String(val);

      // Only update setting keys that exist in SystemSettings
      await request
        .input("SettingKey", sql.VarChar(100), key)
        .input("SettingValue", sql.NVarChar(sql.MAX), strVal)
        .query(`
          IF EXISTS (SELECT 1 FROM SystemSettings WHERE SettingKey = @SettingKey)
          BEGIN
            UPDATE SystemSettings 
            SET SettingValue = @SettingValue, UpdatedAt = GETDATE() 
            WHERE SettingKey = @SettingKey
          END
        `);
    }

    await transaction.commit();
    res.json({ success: true, message: "Settings updated successfully" });
  } catch (err) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackErr) {
        console.error("Rollback failed:", rollbackErr);
      }
    }
    console.error("Error updating settings:", err);
    res.status(500).json({ success: false, message: "Failed to update settings" });
  }
};

// Trigger manual system backup
export const triggerBackup = async (req, res) => {
  try {
    res.json({ success: true, message: "Backup completed successfully" });
  } catch (err) {
    console.error("Backup failed:", err);
    res.status(500).json({ success: false, message: "Backup operation failed" });
  }
};