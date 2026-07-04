const priceForm = document.getElementById("priceForm");
const priceTable = document.getElementById("priceTable");

loadPrices();


// ADD PRICE RECORD

priceForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const priceData = {
        station_name: document.getElementById("station_name").value,
        fuel_type: document.getElementById("fuel_type").value,
        previous_price: Number(document.getElementById("previous_price").value),
        new_price: Number(document.getElementById("new_price").value),
        effective_date: document.getElementById("effective_date").value,
        approved_by: document.getElementById("approved_by").value
    };

    try {
        const response = await fetch(
            "http://127.0.0.1:5050/api/prices",
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(priceData)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Failed to add price");
            return;
        }

        alert(result.message);

        priceForm.reset();

        loadPrices();

    } catch (error) {
        console.error(error);
        alert("Frontend could not connect to backend");
    }
});


// LOAD PRICE RECORDS

async function loadPrices() {
    try {
        const response = await fetch(
            "http://127.0.0.1:5050/api/prices",
            {
                headers: getAuthHeaders()
            }
        );

        const data = await response.json();

        priceTable.innerHTML = "";

        data.forEach(item => {
            priceTable.innerHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.station_name}</td>
                    <td>${item.fuel_type}</td>
                    <td>₦${item.previous_price}</td>
                    <td>₦${item.new_price}</td>
                    <td>${item.effective_date}</td>
                    <td>${item.approved_by}</td>
                </tr>
            `;
        });

    } catch (error) {
        console.error(error);
    }
}