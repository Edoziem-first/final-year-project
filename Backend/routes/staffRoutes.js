const express = require("express");
const router = express.Router();

const db = require("../db");

const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");


// GET STAFF

router.get(
    "/",
    verifyToken,
    allowRoles("Admin", "Depot Manager", "Station Manager"),
    (req, res) => {

        const sql = `
            SELECT *
            FROM staff
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


// ADD STAFF

router.post(
    "/",
    verifyToken,
    allowRoles("Admin", "Depot Manager", "Station Manager"),
    (req, res) => {

        const {
            staff_id,
            full_name,
            role,
            station_name,
            phone,
            email,
            employment_status,
            office_lat,
            office_lng,
            allowed_radius
        } = req.body;

        const sql = `
            INSERT INTO staff
            (
                staff_id,
                full_name,
                role,
                station_name,
                phone,
                email,
                employment_status,
                office_lat,
                office_lng,
                allowed_radius
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                staff_id,
                full_name,
                role,
                station_name,
                phone,
                email,
                employment_status,
                office_lat || null,
                office_lng || null,
                allowed_radius || 200
            ],
            (err, result) => {

                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.status(201).json({
                    message: "Staff added successfully",
                    id: result.insertId
                });

            }
        );

    }
);


// UPDATE STAFF

router.put(
    "/:id",
    verifyToken,
    allowRoles("Admin", "Depot Manager", "Station Manager"),
    (req, res) => {

        const id = req.params.id;

        const {
            staff_id,
            full_name,
            role,
            station_name,
            phone,
            email,
            employment_status,
            office_lat,
            office_lng,
            allowed_radius
        } = req.body;

        const sql = `
            UPDATE staff
            SET staff_id = ?,
                full_name = ?,
                role = ?,
                station_name = ?,
                phone = ?,
                email = ?,
                employment_status = ?,
                office_lat = ?,
                office_lng = ?,
                allowed_radius = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [
                staff_id,
                full_name,
                role,
                station_name,
                phone,
                email,
                employment_status,
                office_lat || null,
                office_lng || null,
                allowed_radius || 200,
                id
            ],
            (err) => {

                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.json({
                    message: "Staff updated successfully"
                });

            }
        );

    }
);


// DELETE STAFF

router.delete(
    "/:id",
    verifyToken,
    allowRoles("Admin", "Depot Manager", "Station Manager"),
    (req, res) => {

        const id = req.params.id;

        const sql = `
            DELETE FROM staff
            WHERE id = ?
        `;

        db.query(sql, [id], (err) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Staff deleted successfully"
            });

        });

    }
);


module.exports = router;