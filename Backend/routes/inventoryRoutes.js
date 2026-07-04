const express = require("express");
const router = express.Router();

const db = require("../db");

const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const createNotification =
require("../utils/createNotification");


// GET all inventory records

router.get(
    "/",
    verifyToken,
    allowRoles("Admin", "Depot Manager"),
    (req, res) => {

        const sql = `
            SELECT *
            FROM inventory
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


// GET stations/depots with available stock

router.get(
    "/available-stations",
    verifyToken,
    allowRoles("Admin", "Station Manager", "Cashier"),
    (req, res) => {

        const sql = `
            SELECT DISTINCT station_name
            FROM inventory
            WHERE quantity > 0
            ORDER BY station_name ASC
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


// GET available fuel types for selected station/depot

router.get(
    "/available-fuels/:station_name",
    verifyToken,
    allowRoles("Admin", "Station Manager", "Cashier"),
    (req, res) => {

        const stationName = req.params.station_name;

        const sql = `
            SELECT fuel_type, quantity
            FROM inventory
            WHERE station_name = ?
            AND quantity > 0
            ORDER BY fuel_type ASC
        `;

        db.query(sql, [stationName], (err, results) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(results);

        });

    }
);


// ADD inventory OR update existing inventory

router.post(
    "/",
    verifyToken,
    allowRoles("Admin", "Depot Manager"),
    (req, res) => {

        const {
            station_name,
            fuel_type,
            quantity,
            minimum_level,
            last_updated
        } = req.body;

        const checkSql = `
            SELECT *
            FROM inventory
            WHERE station_name = ?
            AND fuel_type = ?
        `;

        db.query(checkSql, [station_name, fuel_type], (err, results) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }


            if (results.length > 0) {

                const updateSql = `
                    UPDATE inventory
                    SET quantity = quantity + ?,
                        minimum_level = ?,
                        last_updated = ?
                    WHERE station_name = ?
                    AND fuel_type = ?
                `;

                const newQuantity =
                    Number(results[0].quantity) + Number(quantity);

                db.query(
                    updateSql,
                    [
                        Number(quantity),
                        Number(minimum_level),
                        last_updated,
                        station_name,
                        fuel_type
                    ],
                    (err) => {

                        if (err) {
                            return res.status(500).json({
                                error: err.message
                            });
                        }


                        if (
                            newQuantity <=
                            Number(minimum_level)
                        ) {
                            createNotification(
                                "Low Stock Alert",
                                `${fuel_type} at ${station_name} is low. Current: ${newQuantity}L. Minimum: ${minimum_level}L.`,
                                "LOW_STOCK"
                            );
                        }


                        res.json({
                            message: "Existing inventory updated successfully"
                        });

                    }
                );

            } else {

                const insertSql = `
                    INSERT INTO inventory
                    (
                        station_name,
                        fuel_type,
                        quantity,
                        minimum_level,
                        last_updated
                    )
                    VALUES (?, ?, ?, ?, ?)
                `;

                db.query(
                    insertSql,
                    [
                        station_name,
                        fuel_type,
                        Number(quantity),
                        Number(minimum_level),
                        last_updated
                    ],
                    (err, result) => {

                        if (err) {
                            return res.status(500).json({
                                error: err.message
                            });
                        }


                        if (
                            Number(quantity) <=
                            Number(minimum_level)
                        ) {
                            createNotification(
                                "Low Stock Alert",
                                `${fuel_type} at ${station_name} is low. Current: ${quantity}L. Minimum: ${minimum_level}L.`,
                                "LOW_STOCK"
                            );
                        }


                        res.status(201).json({
                            message: "Inventory added successfully",
                            id: result.insertId
                        });

                    }
                );

            }

        });

    }
);


// UPDATE inventory

router.put(
    "/:id",
    verifyToken,
    allowRoles("Admin", "Depot Manager"),
    (req, res) => {

        const id = req.params.id;

        const {
            station_name,
            fuel_type,
            quantity,
            minimum_level,
            last_updated
        } = req.body;

        const sql = `
            UPDATE inventory
            SET station_name = ?,
                fuel_type = ?,
                quantity = ?,
                minimum_level = ?,
                last_updated = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [
                station_name,
                fuel_type,
                quantity,
                minimum_level,
                last_updated,
                id
            ],
            (err) => {

                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }


                if (
                    Number(quantity) <=
                    Number(minimum_level)
                ) {
                    createNotification(
                        "Low Stock Alert",
                        `${fuel_type} at ${station_name} is low. Current: ${quantity}L. Minimum: ${minimum_level}L.`,
                        "LOW_STOCK"
                    );
                }


                res.json({
                    message: "Inventory updated successfully"
                });

            }
        );

    }
);


// DELETE inventory

router.delete(
    "/:id",
    verifyToken,
    allowRoles("Admin", "Depot Manager"),
    (req, res) => {

        const id = req.params.id;

        const sql = `
            DELETE FROM inventory
            WHERE id = ?
        `;

        db.query(sql, [id], (err) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Inventory deleted successfully"
            });

        });

    }
);


module.exports = router;