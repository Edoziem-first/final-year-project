document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".sidebar");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!sidebar || !user) {
        return;
    }

    const role = user.role;

    const links = {
        Admin: [
            ["dashboard.html", "Dashboard"],
            ["inventory.html", "Fuel Inventory"],
            ["sales.html", "Sales"],
            ["suppliers.html", "Suppliers"],
            ["deliveries.html", "Deliveries"],
            ["prices.html", "Fuel Prices"],
            ["staff.html", "Staff"],
            ["shifts.html", "Shift Management"],
            ["attendance.html", "Attendance"],
            ["reports.html", "Reports"],
            ["notifications.html", "Notifications"],
            ["profile.html", "Profile"],
            ["change-password.html", "Change Password"]
        ],

        "Depot Manager": [
            ["dashboard.html", "Dashboard"],
            ["inventory.html", "Fuel Inventory"],
            ["suppliers.html", "Suppliers"],
            ["deliveries.html", "Deliveries"],
            ["prices.html", "Fuel Prices"],
            ["staff.html", "Staff"],
            ["shifts.html", "Shift Management"],
            ["attendance.html", "Attendance"],
            ["reports.html", "Reports"],
            ["notifications.html", "Notifications"],
            ["profile.html", "Profile"],
            ["change-password.html", "Change Password"]
        ],

        "Station Manager": [
            ["dashboard.html", "Dashboard"],
            ["sales.html", "Sales"],
            ["prices.html", "Fuel Prices"],
            ["staff.html", "Staff"],
            ["shifts.html", "Shift Management"],
            ["attendance.html", "Attendance"],
            ["reports.html", "Reports"],
            ["notifications.html", "Notifications"],
            ["profile.html", "Profile"],
            ["change-password.html", "Change Password"]
        ],

        Cashier: [
            ["sales.html", "Sales"],
            ["attendance.html", "Attendance"],
            ["profile.html", "Profile"],
            ["change-password.html", "Change Password"]
        ],

        Driver: [
            ["deliveries.html", "Deliveries"],
            ["attendance.html", "Attendance"],
            ["profile.html", "Profile"],
            ["change-password.html", "Change Password"]
        ],

        "Pump Attendant": [
            ["attendance.html", "Attendance"],
            ["profile.html", "Profile"],
            ["change-password.html", "Change Password"]
        ]
    };

    sidebar.innerHTML = `<h2>PetroFlow OMS</h2>`;

    const userLinks = links[role] || [];

    userLinks.forEach(link => {
        sidebar.innerHTML += `
            <a href="${link[0]}">${link[1]}</a>
        `;
    });

    sidebar.innerHTML += `
        <button class="dark-toggle" onclick="toggleDarkMode()">
            Toggle Dark Mode
        </button>

        <a href="#" onclick="logout()">Logout</a>
    `;
});