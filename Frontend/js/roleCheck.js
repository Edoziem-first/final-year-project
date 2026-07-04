const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "../pages/login.html";
}

const role = user.role;
const page = window.location.pathname.toLowerCase();


// DASHBOARD

if (
    page.includes("dashboard.html") &&
    ![
        "Admin",
        "Depot Manager",
        "Station Manager"
    ].includes(role)
) {
    alert("Access denied");
    redirectUser(role);
}


// REPORTS

if (
    page.includes("reports.html") &&
    ![
        "Admin",
        "Depot Manager",
        "Station Manager"
    ].includes(role)
) {
    alert("Access denied");
    redirectUser(role);
}


// INVENTORY

if (
    page.includes("inventory.html") &&
    ![
        "Admin",
        "Depot Manager"
    ].includes(role)
) {
    alert("Access denied");
    redirectUser(role);
}


// SALES

if (
    page.includes("sales.html") &&
    ![
        "Admin",
        "Station Manager",
        "Cashier"
    ].includes(role)
) {
    alert("Access denied");
    redirectUser(role);
}


// SUPPLIERS

if (
    page.includes("suppliers.html") &&
    ![
        "Admin",
        "Depot Manager"
    ].includes(role)
) {
    alert("Access denied");
    redirectUser(role);
}


// DELIVERIES

if (
    page.includes("deliveries.html") &&
    ![
        "Admin",
        "Depot Manager",
        "Driver"
    ].includes(role)
) {
    alert("Access denied");
    redirectUser(role);
}


// PRICES

if (
    page.includes("prices.html") &&
    ![
        "Admin",
        "Depot Manager",
        "Station Manager"
    ].includes(role)
) {
    alert("Access denied");
    redirectUser(role);
}


// STAFF

if (
    page.includes("staff.html") &&
    ![
        "Admin",
        "Depot Manager",
        "Station Manager"
    ].includes(role)
) {
    alert("Access denied");
    redirectUser(role);
}


// ATTENDANCE

if (
    page.includes("attendance.html") &&
    ![
        "Admin",
        "Depot Manager",
        "Station Manager",
        "Cashier",
        "Driver",
        "Pump Attendant"
    ].includes(role)
) {
    alert("Access denied");
    redirectUser(role);
}


// REGISTER USER

if (
    page.includes("register-user.html") &&
    role !== "Admin"
) {
    alert("Access denied");
    redirectUser(role);
}


// CHANGE PASSWORD

if (
    page.includes("change-password.html") &&
    ![
        "Admin",
        "Depot Manager",
        "Station Manager",
        "Cashier",
        "Driver",
        "Pump Attendant"
    ].includes(role)
) {
    alert("Access denied");
    redirectUser(role);
}


function redirectUser(role) {
    if (role === "Cashier") {
        window.location.href = "sales.html";
    }

    else if (role === "Driver") {
        window.location.href = "deliveries.html";
    }

    else if (role === "Pump Attendant") {
        window.location.href = "attendance.html";
    }

    else if (role === "Depot Manager") {
        window.location.href = "inventory.html";
    }

    else if (role === "Station Manager") {
        window.location.href = "sales.html";
    }

    else {
        window.location.href = "dashboard.html";
    }
}