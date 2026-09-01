import express from "express";
import {
  getPayments,
  getVerifiedPayments,
  getBalances,
  makePayment,
  verifyPayment,
  mpesaPayment  
} from "../controllers/paymentsController.js";

import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// ------------------ Payments ------------------

// Get all payments
router.get("/", verifyToken, getPayments);

// Get verified payments
router.get("/verified", verifyToken, getVerifiedPayments);

// Get balances
router.get("/balances", verifyToken, getBalances);

// Make payment
router.post("/make", verifyToken, makePayment);

// M-Pesa payment
router.post("/mpesa", verifyToken, mpesaPayment);

// Verify payment (admin only)
router.put("/verify/:id", verifyToken, verifyPayment);

export default router;
