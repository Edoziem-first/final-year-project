const express = require("express");
const router = express.Router();

const db = require("../db");

const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const createNotification = require("../utils/createNotification");


// GET PRICES

router.get(
    "/",
    verifyToken,
    allowRoles("Admin", "Depot Manager", "Station Manager"),
    (req, res) => {

        const sql = `
            SELECT *
            FROM prices
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


// ADD PRICE

router.post(
    "/",
    verifyToken,
    allowRoles("Admin", "Depot Manager"),
    (req, res) => {

        const {
            station_name,
            fuel_type,
            previous_price,
            new_price,
            effective_date,
            approved_by
        } = req.body;

        const sql = `
            INSERT INTO prices
            (
                station_name,
                fuel_type,
                previous_price,
                new_price,
                effective_date,
                approved_by
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                station_name,
                fuel_type,
                previous_price,
                new_price,
                effective_date,
                approved_by
            ],
            (err, result) => {

                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                createNotification(
                    "Fuel Price Updated",
                    `${fuel_type} price at ${station_name} changed from ₦${previous_price} to ₦${new_price}. Effective date: ${effective_date}. Approved by ${approved_by}.`,
                    "PRICE_UPDATE"
                );

                res.status(201).json({
                    message: "Price added successfully and notification sent",
                    id: result.insertId
                });

            }
        );

    }
);


module.exports = router;