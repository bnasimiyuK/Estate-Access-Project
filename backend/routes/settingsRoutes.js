import express from "express";
import { getSettings, updateSettings, triggerBackup } from "../controllers/settingsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/settings - Retrieve system configuration
router.get("/", verifyToken, getSettings);

// PATCH /api/settings - Update configuration parameters
router.patch("/", verifyToken, updateSettings);

// POST /api/settings/backup - Execute manual backup
router.post("/backup", verifyToken, triggerBackup);

export default router;