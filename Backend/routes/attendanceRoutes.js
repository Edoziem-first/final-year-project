const express = require("express");
const router = express.Router();

const db = require("../db");

const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");


// CALCULATE DISTANCE BETWEEN TWO COORDINATES IN METERS

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;

    const toRadians = (value) => {
        return value * Math.PI / 180;
    };

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;
}


// GET ATTENDANCE

router.get(
    "/",
    verifyToken,
    allowRoles(
        "Admin",
        "Depot Manager",
        "Station Manager",
        "Cashier",
        "Pump Attendant",
        "Driver"
    ),
    (req, res) => {

        const sql = `
            SELECT *
            FROM attendance
            ORDER BY id DESC
        `;

        db.query(sql, (err, results) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(results);

        });

    }
);


// ADD ATTENDANCE WITH LOCATION CHECK

router.post(
    "/",
    verifyToken,
    allowRoles(
        "Admin",
        "Depot Manager",
        "Station Manager",
        "Cashier",
        "Pump Attendant",
        "Driver"
    ),
    (req, res) => {

        const {
            staff_name,
            station_name,
            shift_name,
            check_in,
            check_out,
            attendance_date,
            status,
            user_lat,
            user_lng
        } = req.body;


        const staffSql = `
            SELECT *
            FROM staff
            WHERE full_name = ?
            LIMIT 1
        `;

        db.query(
            staffSql,
            [staff_name],
            (err, staffResults) => {

                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                let finalStatus = status;
                let locationStatus = "Location Not Checked";


                if (
                    staffResults.length > 0 &&
                    staffResults[0].office_lat &&
                    staffResults[0].office_lng &&
                    user_lat &&
                    user_lng
                ) {
                    const staff = staffResults[0];

                    const distance = calculateDistance(
                        Number(user_lat),
                        Number(user_lng),
                        Number(staff.office_lat),
                        Number(staff.office_lng)
                    );

                    const allowedRadius =
                        Number(staff.allowed_radius || 200);

                    if (distance <= allowedRadius) {
                        finalStatus = "Present";
                        locationStatus = "Within Office";
                    } else {
                        finalStatus = "Absent";
                        locationStatus = "Outside Office";
                    }
                } else if (!user_lat || !user_lng) {
                    finalStatus = "Absent";
                    locationStatus = "Location Denied";
                }


                const sql = `
                    INSERT INTO attendance
                    (
                        staff_name,
                        station_name,
                        shift_name,
                        check_in,
                        check_out,
                        attendance_date,
                        status,
                        user_lat,
                        user_lng,
                        location_status
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                db.query(
                    sql,
                    [
                        staff_name,
                        station_name,
                        shift_name,
                        check_in,
                        check_out,
                        attendance_date,
                        finalStatus,
                        user_lat || null,
                        user_lng || null,
                        locationStatus
                    ],
                    (err, result) => {

                        if (err) {
                            return res.status(500).json({
                                error: err.message
                            });
                        }

                        res.status(201).json({
                            message:
                                `Attendance recorded as ${finalStatus} (${locationStatus})`,
                            id: result.insertId
                        });

                    }
                );

            }
        );

    }
);


// UPDATE ATTENDANCE

router.put(
    "/:id",
    verifyToken,
    allowRoles("Admin", "Depot Manager", "Station Manager"),
    (req, res) => {

        const id = req.params.id;

        const {
            status,
            check_in,
            check_out
        } = req.body;

        const sql = `
            UPDATE attendance
            SET status = ?,
                check_in = ?,
                check_out = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [
                status,
                check_in,
                check_out,
                id
            ],
            (err) => {

                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.json({
                    message: "Attendance updated successfully"
                });

            }
        );

    }
);


module.exports = router;