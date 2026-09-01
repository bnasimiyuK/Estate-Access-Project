// ================================
// backend/routes/dashboardRoutes.js
// ================================

import { Router } from "express";
import { getDashboardSummary, getAccessChart } from "../controllers/dashboardController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

// Apply JWT authentication to all dashboard routes
router.use(verifyToken);

// GET dashboard summary
router.get("/summary", getDashboardSummary);

// GET access chart
router.get("/accesschart", getAccessChart);

export default router;
