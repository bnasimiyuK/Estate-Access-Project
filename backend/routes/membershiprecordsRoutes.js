// backend/routes/membershiprecordsRoutes.js
import express from "express";
import {
  getAllMembershipRecords,
  approveMembershipRecord,
  rejectMembershipRecord,
  deleteMembershipRecord,
  syncMembershipRecords
} from "../controllers/membershiprecordsController.js";

import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Sync membership requests → records (Admin only)
router.post("/sync", verifyToken, isAdmin, syncMembershipRecords);

// Get all membership records (Admin only)
router.get("/all", verifyToken, isAdmin, getAllMembershipRecords);

// Approve a membership record
router.put("/approve/:id", verifyToken, isAdmin, approveMembershipRecord);

// Reject a membership record
router.put("/reject/:id", verifyToken, isAdmin, rejectMembershipRecord);

// Delete a membership record
router.delete("/delete/:id", verifyToken, isAdmin, deleteMembershipRecord);

export default router;
