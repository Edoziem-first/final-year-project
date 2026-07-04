const express = require("express");

const router = express.Router();

const db = require("../db");

const verifyToken =
require("../middleware/authMiddleware");

const allowRoles =
require("../middleware/roleMiddleware");


// GET ALL NOTIFICATIONS

router.get(

"/",

verifyToken,

allowRoles(
"Admin",
"Depot Manager",
"Station Manager"
),

(req,res)=>{

const sql = `

SELECT *

FROM notifications

ORDER BY id DESC

LIMIT 50

`;

db.query(

sql,

(err,results)=>{

if(err){

return res.status(500)
.json({

error:
err.message

});

}

res.json(
results
);

}

);

}

);



// MARK AS READ

router.put(

"/:id/read",

verifyToken,

allowRoles(
"Admin",
"Depot Manager",
"Station Manager"
),

(req,res)=>{

const id =
req.params.id;

db.query(

`

UPDATE notifications

SET is_read = TRUE

WHERE id = ?

`,

[id],

(err)=>{

if(err){

return res.status(500)
.json({

error:
err.message

});

}

res.json({

message:
"Notification marked as read"

});

}

);

}

);

// MARK ALL AS READ

router.put(
    "/mark-all-read",
    verifyToken,
    allowRoles("Admin", "Depot Manager", "Station Manager"),
    (req, res) => {

        db.query(
            "UPDATE notifications SET is_read = TRUE WHERE id > 0",
            (err) => {

                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.json({
                    message: "All notifications marked as read"
                });

            }
        );

    }
);


module.exports =
router;