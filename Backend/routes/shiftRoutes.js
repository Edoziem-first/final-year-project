const express = require("express");
const router = express.Router();

const db = require("../db");

const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");


// GET SHIFT ASSIGNMENTS

router.get(
    "/",
    verifyToken,
    allowRoles("Admin", "Depot Manager", "Station Manager"),
    (req, res) => {

        const sql = `
            SELECT *
            FROM shift_assignments
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


// ADD SHIFT ASSIGNMENT

router.post(
    "/",
    verifyToken,
    allowRoles("Admin", "Depot Manager", "Station Manager"),
    (req, res) => {

        const {
            staff_id,
            staff_name,
            role,
            station_name,
            shift_name,
            shift_date,
            assigned_by
        } = req.body;

        const sql = `
            INSERT INTO shift_assignments
            (
                staff_id,
                staff_name,
                role,
                station_name,
                shift_name,
                shift_date,
                assigned_by
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                staff_id,
                staff_name,
                role,
                station_name,
                shift_name,
                shift_date,
                assigned_by
            ],
            (err, result) => {

                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.status(201).json({
                    message: "Shift assigned successfully",
                    id: result.insertId
                });

            }
        );

    }
);


// UPDATE SHIFT ASSIGNMENT

router.put(
    "/:id",
    verifyToken,
    allowRoles("Admin", "Depot Manager", "Station Manager"),
    (req, res) => {

        const id = req.params.id;

        const {
            staff_id,
            staff_name,
            role,
            station_name,
            shift_name,
            shift_date,
            assigned_by
        } = req.body;

        const sql = `
            UPDATE shift_assignments
            SET staff_id = ?,
                staff_name = ?,
                role = ?,
                station_name = ?,
                shift_name = ?,
                shift_date = ?,
                assigned_by = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [
                staff_id,
                staff_name,
                role,
                station_name,
                shift_name,
                shift_date,
                assigned_by,
                id
            ],
            (err) => {

                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.json({
                    message: "Shift updated successfully"
                });

            }
        );

    }
);


// DELETE SHIFT ASSIGNMENT

router.delete(
    "/:id",
    verifyToken,
    allowRoles("Admin", "Depot Manager", "Station Manager"),
    (req, res) => {

        const id = req.params.id;

        const sql = `
            DELETE FROM shift_assignments
            WHERE id = ?
        `;

        db.query(sql, [id], (err) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Shift deleted successfully"
            });

        });

    }
);


module.exports = router;