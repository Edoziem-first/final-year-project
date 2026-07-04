const express = require("express");
const router = express.Router();

const db = require("../db");

const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");


// GET SALES

router.get(
    "/",
    verifyToken,
    allowRoles("Admin", "Station Manager", "Cashier"),
    (req, res) => {

        const sql = `
            SELECT *
            FROM sales
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


// ADD SALE AND REDUCE INVENTORY

router.post(
    "/",
    verifyToken,
    allowRoles("Admin", "Station Manager", "Cashier"),
    (req, res) => {

        const {
            station_name,
            fuel_type,
            quantity_sold,
            price_per_litre,
            total_amount,
            sales_date,
            payment_method
        } = req.body;


        const checkStockSql = `
            SELECT *
            FROM inventory
            WHERE station_name = ?
            AND fuel_type = ?
        `;

        db.query(
            checkStockSql,
            [station_name, fuel_type],
            (err, inventoryResults) => {

                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                if (inventoryResults.length === 0) {
                    return res.status(400).json({
                        error: "No inventory record found for this station and fuel type"
                    });
                }

                const inventory = inventoryResults[0];

                if (inventory.quantity < quantity_sold) {
                    return res.status(400).json({
                        error: "Not enough fuel stock available"
                    });
                }


                const insertSaleSql = `
                    INSERT INTO sales
                    (
                        station_name,
                        fuel_type,
                        quantity_sold,
                        price_per_litre,
                        total_amount,
                        sales_date,
                        payment_method
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                db.query(
                    insertSaleSql,
                    [
                        station_name,
                        fuel_type,
                        quantity_sold,
                        price_per_litre,
                        total_amount,
                        sales_date,
                        payment_method
                    ],
                    (err, saleResult) => {

                        if (err) {
                            return res.status(500).json({
                                error: err.message
                            });
                        }


                        const updateInventorySql = `
                            UPDATE inventory
                            SET quantity = quantity - ?
                            WHERE station_name = ?
                            AND fuel_type = ?
                        `;

                        db.query(
                            updateInventorySql,
                            [
                                quantity_sold,
                                station_name,
                                fuel_type
                            ],
                            (err) => {

                                if (err) {
                                    return res.status(500).json({
                                        error: err.message
                                    });
                                }

                                res.status(201).json({
                                    message: "Sale recorded and inventory updated successfully",
                                    id: saleResult.insertId
                                });

                            }
                        );

                    }
                );

            }
        );

    }
);


module.exports = router;