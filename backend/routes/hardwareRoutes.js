import express from "express";

import {
    getHardwareDevices,
    getGateBarriers,
    getHardwareSummary,
    getHardwareEvents,
    updateHeartbeat,
    updateBarrierStatus,
    markOfflineDevices
} from "../controllers/hardwareController.js";

const router = express.Router();


/* ============================================================
   HARDWARE DEVICES
   ============================================================ */

router.get(
    "/devices",
    getHardwareDevices
);


/* ============================================================
   GATE BARRIERS
   ============================================================ */

router.get(
    "/barriers",
    getGateBarriers
);


/* ============================================================
   HARDWARE SUMMARY
   ============================================================ */

router.get(
    "/summary",
    getHardwareSummary
);


/* ============================================================
   HARDWARE EVENTS
   ============================================================ */

router.get(
    "/events",
    getHardwareEvents
);


/* ============================================================
   IOT HEARTBEAT
   ============================================================ */

router.post(
    "/heartbeat",
    updateHeartbeat
);


/* ============================================================
   BARRIER STATUS
   ============================================================ */

router.patch(
    "/barriers/:id/status",
    updateBarrierStatus
);


/* ============================================================
   OFFLINE DEVICE CHECK
   ============================================================ */

router.post(
    "/check-offline",
    markOfflineDevices
);


export default router;