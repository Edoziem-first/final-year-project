const deliveryForm = document.getElementById("deliveryForm");
const deliveryTable = document.getElementById("deliveryTable");
const deliverySearch = document.getElementById("deliverySearch");

loadDeliveries();


// ADD DELIVERY

deliveryForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const deliveryData = {
        supplier_name: document.getElementById("supplier_name").value,
        destination: document.getElementById("destination").value,
        fuel_type: document.getElementById("fuel_type").value,
        quantity: Number(document.getElementById("quantity").value),
        delivery_date: document.getElementById("delivery_date").value,
        driver_name: document.getElementById("driver_name").value,
        truck_number: document.getElementById("truck_number").value,
        status: document.getElementById("status").value
    };

    try {
        const response = await fetch(
            "http://127.0.0.1:5050/api/deliveries",
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(deliveryData)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Failed to add delivery");
            return;
        }

        alert(result.message);

        deliveryForm.reset();

        loadDeliveries();

    } catch (error) {
        console.error(error);
        alert("Frontend could not connect to backend");
    }
});


// LOAD DELIVERIES

async function loadDeliveries() {
    try {
        const response = await fetch(
            "http://127.0.0.1:5050/api/deliveries",
            {
                headers: getAuthHeaders()
            }
        );

        const data = await response.json();

        const searchValue = deliverySearch.value.toLowerCase();

        const filtered = data.filter(item =>
            item.supplier_name.toLowerCase().includes(searchValue) ||
            item.destination.toLowerCase().includes(searchValue) ||
            item.fuel_type.toLowerCase().includes(searchValue) ||
            item.driver_name.toLowerCase().includes(searchValue) ||
            item.truck_number.toLowerCase().includes(searchValue) ||
            item.status.toLowerCase().includes(searchValue)
        );

        deliveryTable.innerHTML = "";

        filtered.forEach(item => {
            deliveryTable.innerHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.supplier_name}</td>
                    <td>${item.destination}</td>
                    <td>${item.fuel_type}</td>
                    <td>${item.quantity}</td>
                    <td>${item.delivery_date}</td>
                    <td>${item.driver_name}</td>
                    <td>${item.truck_number}</td>
                    <td>
                        <span class="status ${getDeliveryStatusClass(item.status)}">
                            ${item.status}
                        </span>
                    </td>
                    <td>
                        <select id="status-${item.id}">
                            <option value="Scheduled" ${item.status === "Scheduled" ? "selected" : ""}>
                                Scheduled
                            </option>

                            <option value="In Transit" ${item.status === "In Transit" ? "selected" : ""}>
                                In Transit
                            </option>

                            <option value="Delivered" ${item.status === "Delivered" ? "selected" : ""}>
                                Delivered
                            </option>

                            <option value="Delayed" ${item.status === "Delayed" ? "selected" : ""}>
                                Delayed
                            </option>
                        </select>

                        <button
                            class="edit-btn"
                            onclick="updateDeliveryStatus(${item.id})"
                        >
                            Update
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error(error);
    }
}


// UPDATE DELIVERY STATUS

async function updateDeliveryStatus(id) {
    const newStatus = document.getElementById(`status-${id}`).value;

    try {
        const response = await fetch(
            `http://127.0.0.1:5050/api/deliveries/${id}`,
            {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    status: newStatus
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Failed to update delivery status");
            return;
        }

        alert(result.message);

        loadDeliveries();

    } catch (error) {
        console.error(error);
        alert("Frontend could not connect to backend");
    }
}


// DELIVERY STATUS BADGE

function getDeliveryStatusClass(status) {
    if (status === "Delivered") return "good";
    if (status === "In Transit") return "blue";
    if (status === "Delayed") return "low";
    return "pending";
}


// SEARCH DELIVERIES

deliverySearch.addEventListener("input", loadDeliveries);