import sql from "mssql";
import dbConfig from "../config/dbConfig.js";

/* ============================================================
   GET ALL HARDWARE DEVICES
   ============================================================ */

export const getHardwareDevices = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);

        const result = await pool.request().query(`
            SELECT
                DeviceID,
                DeviceName,
                DeviceCode,
                DeviceType,
                GateName,
                Location,
                IPAddress,
                MACAddress,
                Status,
                IsOnline,
                FirmwareVersion,
                SignalStrength,
                BatteryLevel,
                LastHeartbeat,
                LastSeen,
                IsEnabled,
                CreatedAt,
                UpdatedAt
            FROM HardwareDevices
            ORDER BY DeviceID DESC
        `);

        res.json({
            success: true,
            count: result.recordset.length,
            devices: result.recordset
        });

    } catch (error) {

        console.error("GET HARDWARE DEVICES ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve hardware devices",
            error: error.message
        });
    }
};


/* ============================================================
   GET GATE BARRIERS
   ============================================================ */

export const getGateBarriers = async (req, res) => {

    try {

        const pool = await sql.connect(dbConfig);

        const result = await pool.request().query(`
            SELECT
                gb.BarrierID,
                gb.DeviceID,
                gb.BarrierName,
                gb.GateName,
                gb.Direction,
                gb.BarrierStatus,
                gb.IsOperational,
                gb.LastStatusChange,
                gb.CreatedAt,
                gb.UpdatedAt,

                hd.DeviceName,
                hd.DeviceCode,
                hd.Status AS DeviceStatus,
                hd.IsOnline,
                hd.IPAddress,
                hd.SignalStrength,
                hd.BatteryLevel,
                hd.LastHeartbeat,
                hd.LastSeen

            FROM GateBarriers gb

            INNER JOIN HardwareDevices hd
                ON gb.DeviceID = hd.DeviceID

            ORDER BY gb.BarrierID DESC
        `);

        res.json({
            success: true,
            count: result.recordset.length,
            barriers: result.recordset
        });

    } catch (error) {

        console.error("GET GATE BARRIERS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve gate barriers",
            error: error.message
        });
    }
};


/* ============================================================
   GET HARDWARE SUMMARY
   ============================================================ */

export const getHardwareSummary = async (req, res) => {

    try {

        const pool = await sql.connect(dbConfig);

        const result = await pool.request().query(`
            SELECT

                (SELECT COUNT(*)
                 FROM HardwareDevices) AS TotalDevices,

                (SELECT COUNT(*)
                 FROM HardwareDevices
                 WHERE IsOnline = 1) AS OnlineDevices,

                (SELECT COUNT(*)
                 FROM HardwareDevices
                 WHERE IsOnline = 0) AS OfflineDevices,

                (SELECT COUNT(*)
                 FROM GateBarriers) AS TotalBarriers,

                (SELECT COUNT(*)
                 FROM GateBarriers
                 WHERE BarrierStatus = 'OPEN') AS OpenBarriers,

                (SELECT COUNT(*)
                 FROM GateBarriers
                 WHERE BarrierStatus = 'CLOSED') AS ClosedBarriers,

                (SELECT COUNT(*)
                 FROM GateBarriers
                 WHERE BarrierStatus = 'FAULT') AS FaultBarriers
        `);

        res.json({
            success: true,
            summary: result.recordset[0]
        });

    } catch (error) {

        console.error("GET HARDWARE SUMMARY ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve hardware summary",
            error: error.message
        });
    }
};


/* ============================================================
   GET HARDWARE EVENTS
   ============================================================ */

export const getHardwareEvents = async (req, res) => {

    try {

        const limit = Number(req.query.limit) || 50;

        const pool = await sql.connect(dbConfig);

        const result = await pool
            .request()
            .input("Limit", sql.Int, limit)
            .query(`
                SELECT TOP (@Limit)

                    he.EventID,
                    he.DeviceID,
                    he.BarrierID,
                    he.EventType,
                    he.EventStatus,
                    he.Description,
                    he.EventValue,
                    he.CreatedAt,

                    hd.DeviceName,
                    hd.DeviceCode,

                    gb.BarrierName,
                    gb.GateName

                FROM HardwareEvents he

                LEFT JOIN HardwareDevices hd
                    ON he.DeviceID = hd.DeviceID

                LEFT JOIN GateBarriers gb
                    ON he.BarrierID = gb.BarrierID

                ORDER BY he.CreatedAt DESC
            `);

        res.json({
            success: true,
            count: result.recordset.length,
            events: result.recordset
        });

    } catch (error) {

        console.error("GET HARDWARE EVENTS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve hardware events",
            error: error.message
        });
    }
};


/* ============================================================
   UPDATE DEVICE HEARTBEAT
   This endpoint is intended for an IoT device/controller.
   ============================================================ */

export const updateHeartbeat = async (req, res) => {

    try {

        const {
            deviceCode,
            status,
            signalStrength,
            batteryLevel,
            firmwareVersion
        } = req.body;

        if (!deviceCode) {

            return res.status(400).json({
                success: false,
                message: "deviceCode is required"
            });
        }

        const pool = await sql.connect(dbConfig);

        const result = await pool
            .request()
            .input("DeviceCode", sql.NVarChar(100), deviceCode)
            .input("Status", sql.NVarChar(30), status || "ONLINE")
            .input(
                "SignalStrength",
                sql.Int,
                signalStrength ?? null
            )
            .input(
                "BatteryLevel",
                sql.Int,
                batteryLevel ?? null
            )
            .input(
                "FirmwareVersion",
                sql.NVarChar(50),
                firmwareVersion || null
            )
            .query(`
                UPDATE HardwareDevices

                SET
                    Status = @Status,
                    IsOnline = 1,
                    SignalStrength = @SignalStrength,
                    BatteryLevel = @BatteryLevel,
                    FirmwareVersion = @FirmwareVersion,
                    LastHeartbeat = GETDATE(),
                    LastSeen = GETDATE(),
                    UpdatedAt = GETDATE()

                WHERE DeviceCode = @DeviceCode;

                SELECT
                    DeviceID,
                    DeviceName,
                    DeviceCode,
                    Status,
                    IsOnline,
                    LastHeartbeat,
                    LastSeen

                FROM HardwareDevices
                WHERE DeviceCode = @DeviceCode;
            `);

        if (result.recordset.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Device not found"
            });
        }

        res.json({
            success: true,
            message: "Heartbeat updated",
            device: result.recordset[0]
        });

    } catch (error) {

        console.error("HEARTBEAT ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update heartbeat",
            error: error.message
        });
    }
};


/* ============================================================
   UPDATE BARRIER STATUS
   ============================================================ */

export const updateBarrierStatus = async (req, res) => {

    try {

        const barrierId = Number(req.params.id);

        const {
            status,
            description
        } = req.body;

        const allowedStatuses = [
            "OPEN",
            "CLOSED",
            "OPENING",
            "CLOSING",
            "FAULT",
            "OFFLINE"
        ];

        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({
                success: false,
                message: "Invalid barrier status"
            });
        }

        const pool = await sql.connect(dbConfig);

        const transaction = new sql.Transaction(pool);

        await transaction.begin();

        try {

            const barrierRequest = new sql.Request(transaction);

            const barrierResult = await barrierRequest
                .input("BarrierID", sql.Int, barrierId)
                .input("Status", sql.NVarChar(30), status)
                .query(`
                    UPDATE GateBarriers

                    SET
                        BarrierStatus = @Status,
                        IsOperational =
                            CASE
                                WHEN @Status = 'FAULT'
                                  OR @Status = 'OFFLINE'
                                THEN 0
                                ELSE 1
                            END,
                        LastStatusChange = GETDATE(),
                        UpdatedAt = GETDATE()

                    WHERE BarrierID = @BarrierID;

                    SELECT
                        BarrierID,
                        DeviceID,
                        BarrierName,
                        GateName,
                        Direction,
                        BarrierStatus,
                        IsOperational,
                        LastStatusChange

                    FROM GateBarriers
                    WHERE BarrierID = @BarrierID;
                `);

            if (barrierResult.recordset.length === 0) {

                await transaction.rollback();

                return res.status(404).json({
                    success: false,
                    message: "Barrier not found"
                });
            }

            const barrier = barrierResult.recordset[0];

            const eventRequest = new sql.Request(transaction);

            await eventRequest
                .input("DeviceID", sql.Int, barrier.DeviceID)
                .input("BarrierID", sql.Int, barrier.BarrierID)
                .input("EventType", sql.NVarChar(50), "STATUS_CHANGE")
                .input("EventStatus", sql.NVarChar(50), status)
                .input(
                    "Description",
                    sql.NVarChar(500),
                    description || `Barrier status changed to ${status}`
                )
                .input(
                    "EventValue",
                    sql.NVarChar(200),
                    status
                )
                .query(`
                    INSERT INTO HardwareEvents
                    (
                        DeviceID,
                        BarrierID,
                        EventType,
                        EventStatus,
                        Description,
                        EventValue
                    )
                    VALUES
                    (
                        @DeviceID,
                        @BarrierID,
                        @EventType,
                        @EventStatus,
                        @Description,
                        @EventValue
                    )
                `);

            await transaction.commit();

            res.json({
                success: true,
                message: "Barrier status updated",
                barrier
            });

        } catch (transactionError) {

            try {
                await transaction.rollback();
            } catch {}

            throw transactionError;
        }

    } catch (error) {

        console.error("UPDATE BARRIER STATUS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update barrier status",
            error: error.message
        });
    }
};


/* ============================================================
   MARK OFFLINE DEVICES
   Devices that have not sent heartbeat recently are offline.
   ============================================================ */

export const markOfflineDevices = async (req, res) => {

    try {

        const pool = await sql.connect(dbConfig);

        await pool.request().query(`
            UPDATE HardwareDevices

            SET
                IsOnline = 0,
                Status = 'OFFLINE',
                UpdatedAt = GETDATE()

            WHERE
                IsOnline = 1
                AND LastHeartbeat IS NOT NULL
                AND DATEDIFF(
                    SECOND,
                    LastHeartbeat,
                    GETDATE()
                ) > 60;
        `);

        res.json({
            success: true,
            message: "Offline devices updated"
        });

    } catch (error) {

        console.error("MARK OFFLINE DEVICES ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update offline devices",
            error: error.message
        });
    }
};