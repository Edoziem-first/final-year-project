require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();



// DATABASE

const db = require("./db");
const shiftRoutes = require("./routes/shiftRoutes");
app.use("/api/shifts", shiftRoutes);


// MIDDLEWARE

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);



// ROUTES

const authRoutes =
require(
"./routes/authRoutes"
);

const inventoryRoutes =
require(
"./routes/inventoryRoutes"
);

const salesRoutes =
require(
"./routes/salesRoutes"
);

const supplierRoutes =
require(
"./routes/supplierRoutes"
);

const deliveryRoutes =
require(
"./routes/deliveryRoutes"
);

const priceRoutes =
require(
"./routes/priceRoutes"
);

const staffRoutes =
require(
"./routes/staffRoutes"
);

const attendanceRoutes =
require(
"./routes/attendanceRoutes"
);

const reportRoutes =
require(
"./routes/reportRoutes"
);

const notificationRoutes =
require(
"./routes/notificationRoutes"
);



// API ROUTES

app.use(
"/api/auth",
authRoutes
);

app.use(
"/api/inventory",
inventoryRoutes
);

app.use(
"/api/sales",
salesRoutes
);

app.use(
"/api/suppliers",
supplierRoutes
);

app.use(
"/api/deliveries",
deliveryRoutes
);

app.use(
"/api/prices",
priceRoutes
);

app.use(
"/api/staff",
staffRoutes
);

app.use(
"/api/attendance",
attendanceRoutes
);

app.use(
"/api/reports",
reportRoutes
);

app.use(
"/api/notifications",
notificationRoutes
);



// ROOT TEST

app.get(
"/",

(req,res)=>{

res.send(
"Oil Management API Running"
);

}
);



// SERVER

const PORT =
process.env.PORT ||
5050;


app.listen(

PORT,

()=>{

console.log(

`Server running on port ${PORT}`

);

}

);