const express = require("express");
const router = express.Router();

const db = require("../db");

const verifyToken =
require("../middleware/authMiddleware");

const allowRoles =
require("../middleware/roleMiddleware");



// GET SUPPLIERS

router.get(

"/",

verifyToken,

allowRoles(
"Admin",
"Depot Manager"
),

(req,res)=>{

    db.query(

    "SELECT * FROM suppliers",

    (err,result)=>{

        if(err){

            return res.status(500)
            .json({

                error:
                err.message

            });

        }

        res.json(
            result
        );

    }

    );

}

);




// ADD SUPPLIER

router.post(

"/",

verifyToken,

allowRoles(
"Admin",
"Depot Manager"
),

(req,res)=>{

    const {

        supplier_name,

        fuel_type,

        contact_person,

        phone,

        email,

        status

    }

    = req.body;


    const sql =

    `

    INSERT INTO suppliers

    (

    supplier_name,

    fuel_type,

    contact_person,

    phone,

    email,

    status

    )

    VALUES (?,?,?,?,?,?)

    `;


    db.query(

    sql,

    [

    supplier_name,

    fuel_type,

    contact_person,

    phone,

    email,

    status

    ],

    (err,result)=>{

        if(err){

            return res.status(500)
            .json({

                error:
                err.message

            });

        }

        res.json({

            message:
            "Supplier added successfully"

        });

    }

    );

}

);




// UPDATE SUPPLIER

router.put(

"/:id",

verifyToken,

allowRoles(
"Admin",
"Depot Manager"
),

(req,res)=>{

    const id =
    req.params.id;

    const {

        supplier_name,

        fuel_type,

        contact_person,

        phone,

        email,

        status

    }

    = req.body;


    const sql =

    `

    UPDATE suppliers

    SET

    supplier_name=?,

    fuel_type=?,

    contact_person=?,

    phone=?,

    email=?,

    status=?

    WHERE id=?

    `;


    db.query(

    sql,

    [

    supplier_name,

    fuel_type,

    contact_person,

    phone,

    email,

    status,

    id

    ],

    (err,result)=>{

        if(err){

            return res.status(500)
            .json({

                error:
                err.message

            });

        }

        res.json({

            message:
            "Supplier updated successfully"

        });

    }

    );

}

);




// DELETE SUPPLIER

router.delete(

"/:id",

verifyToken,

allowRoles(
"Admin",
"Depot Manager"
),

(req,res)=>{

    const id =
    req.params.id;

    db.query(

    "DELETE FROM suppliers WHERE id=?",

    [id],

    (err,result)=>{

        if(err){

            return res.status(500)
            .json({

                error:
                err.message

            });

        }

        res.json({

            message:
            "Supplier deleted successfully"

        });

    }

    );

}

);



module.exports = router;