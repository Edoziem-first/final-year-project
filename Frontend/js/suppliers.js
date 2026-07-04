const supplierForm = document.getElementById("supplierForm");
const supplierTable = document.getElementById("supplierTable");
const supplierSearch = document.getElementById("supplierSearch");

let editId = null;

loadSuppliers();


// ADD OR UPDATE SUPPLIER

supplierForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const supplierData = {
        supplier_name: document.getElementById("supplier_name").value,
        fuel_type: document.getElementById("fuel_type").value,
        contact_person: document.getElementById("contact_person").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        status: document.getElementById("status").value
    };

    const url = editId
        ? `http://127.0.0.1:5050/api/suppliers/${editId}`
        : "http://127.0.0.1:5050/api/suppliers";

    const method = editId ? "PUT" : "POST";

    try {
        const response = await fetch(
            url,
            {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(supplierData)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Failed to save supplier");
            return;
        }

        alert(result.message);

        supplierForm.reset();
        editId = null;

        loadSuppliers();

    } catch (error) {
        console.error(error);
        alert("Frontend could not connect to backend");
    }
});


// LOAD SUPPLIERS

async function loadSuppliers() {
    try {
        const response = await fetch(
            "http://127.0.0.1:5050/api/suppliers",
            {
                headers: getAuthHeaders()
            }
        );

        const data = await response.json();

        const searchValue = supplierSearch.value.toLowerCase();

        const filtered = data.filter(item =>
            item.supplier_name.toLowerCase().includes(searchValue) ||
            item.fuel_type.toLowerCase().includes(searchValue) ||
            item.contact_person.toLowerCase().includes(searchValue) ||
            item.status.toLowerCase().includes(searchValue)
        );

        supplierTable.innerHTML = "";

        filtered.forEach(item => {
            supplierTable.innerHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.supplier_name}</td>
                    <td>${item.fuel_type}</td>
                    <td>${item.contact_person}</td>
                    <td>${item.phone}</td>
                    <td>${item.email}</td>
                    <td>${item.status}</td>
                    <td>
                        <button
                            class="edit-btn"
                            onclick='editSupplier(${JSON.stringify(item)})'
                        >
                            Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteSupplier(${item.id})"
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


// SEARCH SUPPLIERS

supplierSearch.addEventListener(
    "input",
    loadSuppliers
);


// EDIT SUPPLIER

function editSupplier(item) {
    editId = item.id;

    document.getElementById("supplier_name").value = item.supplier_name;
    document.getElementById("fuel_type").value = item.fuel_type;
    document.getElementById("contact_person").value = item.contact_person;
    document.getElementById("phone").value = item.phone;
    document.getElementById("email").value = item.email;
    document.getElementById("status").value = item.status;
}


// DELETE SUPPLIER

async function deleteSupplier(id) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this supplier?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(
            `http://127.0.0.1:5050/api/suppliers/${id}`,
            {
                method: "DELETE",
                headers: getAuthHeaders()
            }
        );

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Failed to delete supplier");
            return;
        }

        alert(result.message);

        loadSuppliers();

    } catch (error) {
        console.error(error);
        alert("Frontend could not connect to backend");
    }
}