loadDashboard();
loadNotifications();


// LOAD DASHBOARD DATA

async function loadDashboard() {
    try {
        const response = await fetch(
            "http://127.0.0.1:5050/api/reports",
            {
                headers: getAuthHeaders()
            }
        );

        const reportData = await response.json();

        document.getElementById("inventoryCount").innerText =
            reportData.inventory || 0;

        document.getElementById("salesRevenue").innerText =
            "₦" + Number(reportData.sales || 0).toLocaleString();

        document.getElementById("supplierCount").innerText =
            reportData.suppliers || 0;

        document.getElementById("staffCount").innerText =
            reportData.staff || 0;

        document.getElementById("deliveryCount").innerText =
            reportData.deliveries || 0;

        document.getElementById("attendanceCount").innerText =
            reportData.attendance || 0;

        document.getElementById("lowStockCount").innerText =
            reportData.lowStock ? reportData.lowStock.length : 0;


        if (reportData.bestFuel) {
            document.getElementById("bestFuel").innerText =
                reportData.bestFuel.fuel_type;

            document.getElementById("bestFuelQty").innerText =
                reportData.bestFuel.totalSold + "L";
        } else {
            document.getElementById("bestFuel").innerText = "None";
            document.getElementById("bestFuelQty").innerText = "0L";
        }


        if (reportData.topStation) {
            document.getElementById("topStation").innerText =
                reportData.topStation.station_name;

            document.getElementById("topStationRevenue").innerText =
                "₦" + Number(reportData.topStation.revenue || 0).toLocaleString();
        } else {
            document.getElementById("topStation").innerText = "None";
            document.getElementById("topStationRevenue").innerText = "₦0";
        }


        loadRecentDeliveries(reportData.recentDeliveries || []);
        loadLowStock(reportData.lowStock || []);

        drawFuelChart(reportData.fuelChart || []);
        drawStationChart(reportData.stationChart || []);

    } catch (error) {
        console.error("Dashboard error:", error);
    }
}


// RECENT DELIVERIES TABLE

function loadRecentDeliveries(deliveries) {
    const table = document.getElementById("recentDeliveriesTable");

    table.innerHTML = "";

    if (deliveries.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6">No recent deliveries found</td>
            </tr>
        `;
        return;
    }

    deliveries.forEach(item => {
        table.innerHTML += `
            <tr>
                <td>${item.supplier_name}</td>
                <td>${item.destination}</td>
                <td>${item.fuel_type}</td>
                <td>${item.quantity}L</td>
                <td>${item.delivery_date}</td>
                <td>
                    <span class="status ${getDeliveryStatusClass(item.status)}">
                        ${item.status}
                    </span>
                </td>
            </tr>
        `;
    });
}


// LOW STOCK TABLE

function loadLowStock(items) {
    const table = document.getElementById("lowStockTable");

    table.innerHTML = "";

    if (items.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5">No low stock items</td>
            </tr>
        `;
        return;
    }

    items.forEach(item => {
        table.innerHTML += `
            <tr>
                <td>${item.station_name}</td>
                <td>${item.fuel_type}</td>
                <td>${item.quantity}L</td>
                <td>${item.minimum_level}L</td>
                <td>
                    <span class="status low">
                        Low Stock
                    </span>
                </td>
            </tr>
        `;
    });
}


// DRAW FUEL CHART

function drawFuelChart(fuelData) {
    const ctx = document.getElementById("fuelChart");

    if (!ctx) return;

    if (fuelData.length === 0) {
        ctx.parentElement.innerHTML += `
            <p>No fuel sales data available</p>
        `;
        return;
    }

    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: fuelData.map(item => item.fuel_type),
            datasets: [
                {
                    label: "Fuel Sold",
                    data: fuelData.map(item => Number(item.totalSold))
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}


// DRAW STATION CHART

function drawStationChart(stationData) {
    const ctx = document.getElementById("stationChart");

    if (!ctx) return;

    if (stationData.length === 0) {
        ctx.parentElement.innerHTML += `
            <p>No station revenue data available</p>
        `;
        return;
    }

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: stationData.map(item => item.station_name),
            datasets: [
                {
                    label: "Revenue",
                    data: stationData.map(item => Number(item.revenue))
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}


// DELIVERY STATUS COLORS

function getDeliveryStatusClass(status) {
    if (status === "Delivered") return "good";
    if (status === "In Transit") return "blue";
    if (status === "Delayed") return "low";
    return "pending";
}


// LOAD NOTIFICATIONS

async function loadNotifications() {
    try {
        const response = await fetch(
            "http://127.0.0.1:5050/api/notifications",
            {
                headers: getAuthHeaders()
            }
        );

        const notifications = await response.json();

        console.log("Notifications:", notifications);

        const unreadCount =
            notifications.filter(item => !item.is_read).length;

        document.getElementById("notificationCount").innerText =
            unreadCount;

        const list =
            document.getElementById("notificationList");

        list.innerHTML = "";

        if (notifications.length === 0) {
            list.innerHTML = `
                <div class="notification-item">
                    <p>No notifications yet</p>
                </div>
            `;
            return;
        }

        notifications.forEach(item => {
            list.innerHTML += `
                <div class="notification-item">
                    <strong>${item.title}</strong>
                    <p>${item.message}</p>
                    <small>${item.created_at}</small>
                </div>
            `;
        });

    } catch (error) {
        console.error("Notification error:", error);
    }
}


// TOGGLE NOTIFICATION PANEL

function toggleNotifications() {
    const panel =
        document.getElementById("notificationPanel");

    panel.classList.toggle("show");
}

function openNotificationsPage() {
    window.location.href = "notifications.html";
}

const exportPdfBtn = document.getElementById("exportPdfBtn");

if (exportPdfBtn) {
    exportPdfBtn.addEventListener("click", exportDashboardPDF);
}

async function exportDashboardPDF() {
    try {
        const response = await fetch(
            "http://127.0.0.1:5050/api/reports",
            {
                headers: getAuthHeaders()
            }
        );

        const data = await response.json();

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Oil Management System Report", 20, 20);

        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

        doc.setFontSize(14);
        doc.text("Summary", 20, 45);

        doc.setFontSize(11);

        let y = 55;

        doc.text(`Total Inventory Records: ${data.inventory || 0}`, 20, y);
        y += 8;

        doc.text(`Total Sales Revenue: ₦${Number(data.sales || 0).toLocaleString()}`, 20, y);
        y += 8;

        doc.text(`Total Suppliers: ${data.suppliers || 0}`, 20, y);
        y += 8;

        doc.text(`Total Staff: ${data.staff || 0}`, 20, y);
        y += 8;

        doc.text(`Total Deliveries: ${data.deliveries || 0}`, 20, y);
        y += 8;

        doc.text(`Attendance Records: ${data.attendance || 0}`, 20, y);
        y += 12;

        doc.setFontSize(14);
        doc.text("Performance Insights", 20, y);
        y += 10;

        doc.setFontSize(11);

        doc.text(
            `Best Selling Fuel: ${
                data.bestFuel ? data.bestFuel.fuel_type : "None"
            }`,
            20,
            y
        );
        y += 8;

        doc.text(
            `Quantity Sold: ${
                data.bestFuel ? data.bestFuel.totalSold + "L" : "0L"
            }`,
            20,
            y
        );
        y += 8;

        doc.text(
            `Top Station: ${
                data.topStation ? data.topStation.station_name : "None"
            }`,
            20,
            y
        );
        y += 8;

        doc.text(
            `Top Station Revenue: ₦${
                data.topStation
                    ? Number(data.topStation.revenue).toLocaleString()
                    : "0"
            }`,
            20,
            y
        );
        y += 12;

        doc.setFontSize(14);
        doc.text("Low Stock Items", 20, y);
        y += 10;

        doc.setFontSize(10);

        if (data.lowStock && data.lowStock.length > 0) {
            data.lowStock.forEach(item => {
                doc.text(
                    `${item.station_name} | ${item.fuel_type} | ${item.quantity}L / Min: ${item.minimum_level}L`,
                    20,
                    y
                );
                y += 7;
            });
        } else {
            doc.text("No low stock items", 20, y);
            y += 8;
        }

        y += 6;

        doc.setFontSize(14);
        doc.text("Recent Deliveries", 20, y);
        y += 10;

        doc.setFontSize(10);

        if (data.recentDeliveries && data.recentDeliveries.length > 0) {
            data.recentDeliveries.forEach(item => {
                doc.text(
                    `${item.supplier_name} → ${item.destination} | ${item.fuel_type} | ${item.quantity}L | ${item.status}`,
                    20,
                    y
                );
                y += 7;
            });
        } else {
            doc.text("No recent deliveries", 20, y);
        }

        doc.save("oil-management-report.pdf");

    } catch (error) {
        console.error(error);
        alert("Failed to export PDF");
    }
}