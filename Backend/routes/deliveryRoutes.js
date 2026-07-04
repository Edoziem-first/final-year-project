const express = require("express");
const router = express.Router();

const db = require("../db");

const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const createNotification =
require("../utils/createNotification");


// GET DELIVERIES

router.get(
    "/",
    verifyToken,
    allowRoles("Admin", "Depot Manager", "Driver"),
    (req, res) => {

        const sql = `
            SELECT *
            FROM deliveries
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


// ADD DELIVERY AND UPDATE INVENTORY IF DELIVERED

router.post(
    "/",
    verifyToken,
    allowRoles("Admin", "Depot Manager", "Driver"),
    (req, res) => {

        const {
            supplier_name,
            destination,
            fuel_type,
            quantity,
            delivery_date,
            driver_name,
            truck_number,
            status
        } = req.body;


        const insertDeliverySql = `
            INSERT INTO deliveries
            (
                supplier_name,
                destination,
                fuel_type,
                quantity,
                delivery_date,
                driver_name,
                truck_number,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;


        db.query(
            insertDeliverySql,
            [
                supplier_name,
                destination,
                fuel_type,
                quantity,
                delivery_date,
                driver_name,
                truck_number,
                status
            ],
            (err, deliveryResult) => {

                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }


                if (status === "Delayed") {
                    createNotification(
                        "Delivery Delayed",
                        `${supplier_name} delivery to ${destination} has been delayed.`,
                        "DELIVERY"
                    );
                }


                if (status !== "Delivered") {
                    return res.status(201).json({
                        message: "Delivery recorded successfully",
                        id: deliveryResult.insertId
                    });
                }


                const checkInventorySql = `
                    SELECT *
                    FROM inventory
                    WHERE station_name = ?
                    AND fuel_type = ?
                `;


                db.query(
                    checkInventorySql,
                    [destination, fuel_type],
                    (err, inventoryResults) => {

                        if (err) {
                            return res.status(500).json({
                                error: err.message
                            });
                        }


                        if (inventoryResults.length > 0) {

                            const updateInventorySql = `
                                UPDATE inventory
                                SET quantity = quantity + ?,
                                    last_updated = ?
                                WHERE station_name = ?
                                AND fuel_type = ?
                            `;

                            db.query(
                                updateInventorySql,
                                [
                                    quantity,
                                    delivery_date,
                                    destination,
                                    fuel_type
                                ],
                                (err) => {

                                    if (err) {
                                        return res.status(500).json({
                                            error: err.message
                                        });
                                    }


                                    createNotification(
                                        "Delivery Completed",
                                        `${quantity}L of ${fuel_type} delivered to ${destination}.`,
                                        "DELIVERY"
                                    );


                                    res.status(201).json({
                                        message: "Delivery recorded and inventory increased successfully",
                                        id: deliveryResult.insertId
                                    });

                                }
                            );

                        } else {

                            const createInventorySql = `
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
                                createInventorySql,
                                [
                                    destination,
                                    fuel_type,
                                    quantity,
                                    5000,
                                    delivery_date
                                ],
                                (err) => {

                                    if (err) {
                                        return res.status(500).json({
                                            error: err.message
                                        });
                                    }


                                    createNotification(
                                        "New Inventory Created",
                                        `${quantity}L of ${fuel_type} delivered to ${destination} and new inventory record was created.`,
                                        "DELIVERY"
                                    );


                                    res.status(201).json({
                                        message: "Delivery recorded and new inventory created successfully",
                                        id: deliveryResult.insertId
                                    });

                                }
                            );

                        }

                    }
                );

            }
        );

    }
);


// UPDATE DELIVERY STATUS

router.put(
    "/:id",
    verifyToken,
    allowRoles("Admin", "Depot Manager", "Driver"),
    (req, res) => {

        const id = req.params.id;
        const { status } = req.body;

        const sql = `
            UPDATE deliveries
            SET status = ?
            WHERE id = ?
        `;

        db.query(sql, [status, id], (err) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }


            if (status === "Delayed") {
                createNotification(
                    "Delivery Delayed",
                    `Delivery record #${id} has been marked as delayed.`,
                    "DELIVERY"
                );
            }


            if (status === "Delivered") {
                createNotification(
                    "Delivery Completed",
                    `Delivery record #${id} has been marked as delivered.`,
                    "DELIVERY"
                );
            }


            res.json({
                message: "Delivery status updated successfully"
            });

        });

    }
);


module.exports = router;