const express = require("express");
const router = express.Router();

const db = require("../db");

const verifyToken =
require("../middleware/authMiddleware");

const allowRoles =
require("../middleware/roleMiddleware");


// GET REPORT SUMMARY

router.get(

"/",

verifyToken,

allowRoles(
"Admin",
"Depot Manager",
"Station Manager"
),

(req,res)=>{

    const report = {};


    db.query(

    "SELECT COUNT(*) AS total FROM inventory",

    (err,inventory)=>{

        if(err){

            return res.status(500)
            .json({

                error:
                err.message

            });

        }

        report.inventory =
        inventory[0].total;



        db.query(

        "SELECT SUM(total_amount) AS total FROM sales",

        (err,sales)=>{

            if(err){

                return res.status(500)
                .json({

                    error:
                    err.message

                });

            }

            report.sales =
            sales[0].total || 0;



            db.query(

            "SELECT COUNT(*) AS total FROM suppliers",

            (err,suppliers)=>{

                report.suppliers =
                suppliers[0].total;



                db.query(

                "SELECT COUNT(*) AS total FROM staff",

                (err,staff)=>{

                    report.staff =
                    staff[0].total;



                    db.query(

                    "SELECT COUNT(*) AS total FROM deliveries",

                    (err,deliveries)=>{

                        report.deliveries =
                        deliveries[0].total;



                        db.query(

                        "SELECT COUNT(*) AS total FROM attendance",

                        (err,attendance)=>{

                            report.attendance =
                            attendance[0].total;



                            // BEST FUEL

                            db.query(

                            `

                            SELECT fuel_type,

                            SUM(quantity_sold)

                            AS totalSold

                            FROM sales

                            GROUP BY fuel_type

                            ORDER BY totalSold DESC

                            LIMIT 1

                            `,

                            (err,bestFuel)=>{

                                report.bestFuel =

                                bestFuel.length ?

                                bestFuel[0]

                                :

                                null;



                                // TOP STATION

                                db.query(

                                `

                                SELECT station_name,

                                SUM(total_amount)

                                AS revenue

                                FROM sales

                                GROUP BY station_name

                                ORDER BY revenue DESC

                                LIMIT 1

                                `,

                                (err,topStation)=>{

                                    report.topStation =

                                    topStation.length ?

                                    topStation[0]

                                    :

                                    null;



                                    // RECENT DELIVERIES

                                    db.query(

                                    `

                                    SELECT *

                                    FROM deliveries

                                    ORDER BY id DESC

                                    LIMIT 5

                                    `,

                                    (err,recentDeliveries)=>{

                                        report.recentDeliveries =
                                        recentDeliveries;



                                        // LOW STOCK

                                        db.query(

                                        `

                                        SELECT *

                                        FROM inventory

                                        WHERE quantity <= minimum_level

                                        LIMIT 5

                                        `,

                                        (err,lowStock)=>{

                                            report.lowStock =
                                            lowStock;



                                            // FUEL CHART

                                            db.query(

                                            `

                                            SELECT fuel_type,

                                            SUM(quantity_sold)

                                            AS totalSold

                                            FROM sales

                                            GROUP BY fuel_type

                                            `,

                                            (err,fuelChart)=>{

                                                report.fuelChart =
                                                fuelChart;



                                                // STATION CHART

                                                db.query(

                                                `

                                                SELECT station_name,

                                                SUM(total_amount)

                                                AS revenue

                                                FROM sales

                                                GROUP BY station_name

                                                `,

                                                (err,stationChart)=>{

                                                    report.stationChart =
                                                    stationChart;


                                                    res.json(
                                                    report
                                                    );

                                                }

                                                );

                                            }

                                            );

                                        }

                                        );

                                    }

                                    );

                                }

                                );

                            }

                            );

                        }

                        );

                    }

                    );

                }

                );

            }

            );

        }

        );

    }

    );

}

);


module.exports = router;