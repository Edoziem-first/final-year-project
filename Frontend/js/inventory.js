const inventoryForm = document.getElementById("inventoryForm");
const inventoryTable = document.getElementById("inventoryTable");
const inventorySearch = document.getElementById("inventorySearch");
const exportInventoryBtn = document.getElementById("exportInventoryBtn");

let editId = null;

loadInventory();


// ADD OR UPDATE INVENTORY

inventoryForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const inventoryData = {
        station_name: document.getElementById("station_name").value,
        fuel_type: document.getElementById("fuel_type").value,
        quantity: Number(document.getElementById("quantity").value),
        minimum_level: Number(document.getElementById("minimum_level").value),
        last_updated: document.getElementById("last_updated").value
    };

    const url = editId
        ? `http://127.0.0.1:5050/api/inventory/${editId}`
        : "http://127.0.0.1:5050/api/inventory";

    const method = editId ? "PUT" : "POST";

    try {
        const response = await fetch(
            url,
            {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(inventoryData)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Failed to save inventory");
            return;
        }

        alert(result.message);

        inventoryForm.reset();

        editId = null;

        loadInventory();

    } catch (error) {
        console.error(error);
        alert("Frontend could not connect to backend");
    }
});


// LOAD INVENTORY

async function loadInventory() {
    try {
        const response = await fetch(
            "http://127.0.0.1:5050/api/inventory",
            {
                headers: getAuthHeaders()
            }
        );

        const data = await response.json();

        const searchValue =
            inventorySearch.value.toLowerCase();

        const filtered = data.filter(item =>

            item.station_name
            .toLowerCase()
            .includes(searchValue)

            ||

            item.fuel_type
            .toLowerCase()
            .includes(searchValue)

        );

        inventoryTable.innerHTML = "";

        filtered.forEach(item => {

            let statusText = "Available";
            let statusClass = "good";

            if (
                item.quantity <=
                item.minimum_level
            ) {
                statusText = "Low Stock";
                statusClass = "low";
            }

            inventoryTable.innerHTML += `

            <tr>

                <td>
                    ${item.id}
                </td>

                <td>
                    ${item.station_name}
                </td>

                <td>
                    ${item.fuel_type}
                </td>

                <td>
                    ${item.quantity}L
                </td>

                <td>
                    ${item.minimum_level}L
                </td>

                <td>

                    <span
                    class="status ${statusClass}"
                    >

                    ${statusText}

                    </span>

                </td>

                <td>
                    ${item.last_updated}
                </td>

                <td>

                    <button
                    class="edit-btn"

                    onclick='editInventory(
                    ${JSON.stringify(item)}
                    )'

                    >

                    Edit

                    </button>


                    <button
                    class="delete-btn"

                    onclick="
                    deleteInventory(
                    ${item.id}
                    )
                    "

                    >

                    Delete

                    </button>

                </td>

            </tr>

            `;

        });

    } catch (error) {
        console.error(error);
    }
}


// SEARCH

inventorySearch.addEventListener(
    "input",
    loadInventory
);


// EDIT INVENTORY

function editInventory(item) {

    editId = item.id;

    document.getElementById(
        "station_name"
    ).value =
    item.station_name;

    document.getElementById(
        "fuel_type"
    ).value =
    item.fuel_type;

    document.getElementById(
        "quantity"
    ).value =
    item.quantity;

    document.getElementById(
        "minimum_level"
    ).value =
    item.minimum_level;

    document.getElementById(
        "last_updated"
    ).value =
    item.last_updated;

}


// DELETE INVENTORY

async function deleteInventory(id) {

    const confirmDelete =
    confirm(
        "Delete inventory record?"
    );

    if(!confirmDelete){
        return;
    }

    try{

        const response =
        await fetch(

            `http://127.0.0.1:5050/api/inventory/${id}`,

            {

                method:"DELETE",

                headers:
                getAuthHeaders()

            }

        );

        const result =
        await response.json();

        if(!response.ok){

            alert(
                result.error
            );

            return;

        }

        alert(
            result.message
        );

        loadInventory();

    }

    catch(error){

        console.error(
            error
        );

    }

}

exportInventoryBtn
.addEventListener(

"click",

exportInventoryCSV

);


async function exportInventoryCSV() {
    try {
        const response = await fetch(
            "http://127.0.0.1:5050/api/inventory",
            {
                headers: getAuthHeaders()
            }
        );

        const data = await response.json();

        let csv = "ID,Station,Fuel Type,Quantity,Minimum Level,Last Updated\n";

        data.forEach(item => {
            csv += `${item.id},"${item.station_name}","${item.fuel_type}",${item.quantity},${item.minimum_level},"${item.last_updated}"\n`;
        });

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "inventory.csv";
        a.click();

        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error(error);
    }
}