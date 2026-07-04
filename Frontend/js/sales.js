const salesForm = document.getElementById("salesForm");
const salesTable = document.getElementById("salesTable");
const salesSearch = document.getElementById("salesSearch");
const exportSalesBtn = document.getElementById("exportSalesBtn");

const stationSelect = document.getElementById("station_name");
const fuelSelect = document.getElementById("fuel_type");
const availableStockText = document.getElementById("availableStockText");

let availableFuels = [];

loadAvailableStations();
loadSales();


// LOAD STATIONS/DEPOTS WITH AVAILABLE STOCK

async function loadAvailableStations() {
    try {
        const response = await fetch(
            "http://127.0.0.1:5050/api/inventory/available-stations",
            {
                headers: getAuthHeaders()
            }
        );

        const stations = await response.json();

        stationSelect.innerHTML = `
            <option value="">Select station/depot</option>
        `;

        stations.forEach(item => {
            stationSelect.innerHTML += `
                <option value="${item.station_name}">
                    ${item.station_name}
                </option>
            `;
        });

    } catch (error) {
        console.error(error);
    }
}


// LOAD AVAILABLE FUEL TYPES FOR SELECTED STATION

stationSelect.addEventListener("change", function () {
    loadAvailableFuels(this.value);
});


async function loadAvailableFuels(stationName) {
    if (!stationName) {
        fuelSelect.innerHTML = `
            <option value="">Select station/depot first</option>
        `;

        availableStockText.innerText =
            "Available stock: 0L";

        return;
    }

    try {
        const response = await fetch(
            `http://127.0.0.1:5050/api/inventory/available-fuels/${stationName}`,
            {
                headers: getAuthHeaders()
            }
        );

        availableFuels = await response.json();

        fuelSelect.innerHTML = `
            <option value="">Select fuel type</option>
        `;

        availableFuels.forEach(item => {
            fuelSelect.innerHTML += `
                <option value="${item.fuel_type}">
                    ${item.fuel_type} - ${item.quantity}L available
                </option>
            `;
        });

        availableStockText.innerText =
            "Available stock: 0L";

    } catch (error) {
        console.error(error);
    }
}


// SHOW AVAILABLE QUANTITY WHEN FUEL IS SELECTED

fuelSelect.addEventListener("change", function () {
    const selectedFuel = availableFuels.find(
        item => item.fuel_type === this.value
    );

    if (selectedFuel) {
        availableStockText.innerText =
            `Available stock: ${selectedFuel.quantity}L`;
    } else {
        availableStockText.innerText =
            "Available stock: 0L";
    }
});


// SUBMIT SALES RECORD

salesForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const quantitySold =
        Number(document.getElementById("quantity_sold").value);

    const pricePerLitre =
        Number(document.getElementById("price_per_litre").value);

    const selectedFuel = availableFuels.find(
        item => item.fuel_type === fuelSelect.value
    );

    if (!selectedFuel) {
        alert("Please select a valid fuel type");
        return;
    }

    if (quantitySold > selectedFuel.quantity) {
        alert("Quantity sold cannot be greater than available stock");
        return;
    }

    const salesData = {
        station_name: stationSelect.value,
        fuel_type: fuelSelect.value,
        quantity_sold: quantitySold,
        price_per_litre: pricePerLitre,
        total_amount: quantitySold * pricePerLitre,
        sales_date: document.getElementById("sales_date").value,
        payment_method: document.getElementById("payment_method").value
    };

    try {
        const response = await fetch(
            "http://127.0.0.1:5050/api/sales",
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(salesData)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Failed to record sale");
            return;
        }

        alert(result.message);

        salesForm.reset();

        availableStockText.innerText =
            "Available stock: 0L";

        fuelSelect.innerHTML = `
            <option value="">Select station/depot first</option>
        `;

        loadSales();
        await loadAvailableStations();

    } catch (error) {
        console.error(error);
        alert("Frontend could not connect to backend");
    }
});


// LOAD SALES RECORDS

async function loadSales() {
    try {
        const response = await fetch(
            "http://127.0.0.1:5050/api/sales",
            {
                headers: getAuthHeaders()
            }
        );

        const data = await response.json();

        const searchValue = salesSearch.value.toLowerCase();

        const filtered = data.filter(item =>
            item.station_name.toLowerCase().includes(searchValue) ||
            item.fuel_type.toLowerCase().includes(searchValue) ||
            item.payment_method.toLowerCase().includes(searchValue)
        );

        salesTable.innerHTML = "";

        filtered.forEach(item => {
            salesTable.innerHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.station_name}</td>
                    <td>${item.fuel_type}</td>
                    <td>${item.quantity_sold}</td>
                    <td>₦${item.price_per_litre}</td>
                    <td>₦${item.total_amount}</td>
                    <td>${item.sales_date}</td>
                    <td>${item.payment_method}</td>
                </tr>
            `;
        });

    } catch (error) {
        console.error(error);
    }
}


// SEARCH SALES

salesSearch.addEventListener("input", loadSales);

exportSalesBtn.addEventListener("click", exportSalesCSV);


async function exportSalesCSV() {
    try {
        const response = await fetch(
            "http://127.0.0.1:5050/api/sales",
            {
                headers: getAuthHeaders()
            }
        );

        const data = await response.json();

        let csv = "ID,Station,Fuel Type,Quantity Sold,Price Per Litre,Total Amount,Sales Date,Payment Method\n";

        data.forEach(item => {
            csv += `${item.id},"${item.station_name}","${item.fuel_type}",${item.quantity_sold},${item.price_per_litre},${item.total_amount},"${item.sales_date}","${item.payment_method}"\n`;
        });

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "sales.csv";
        a.click();

        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error(error);
    }
}