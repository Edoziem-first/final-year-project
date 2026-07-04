const staffForm = document.getElementById("staffForm");
const staffTable = document.getElementById("staffTable");
const staffSearch = document.getElementById("staffSearch");

const createLogin = document.getElementById("create_login");
const loginFields = document.getElementById("loginFields");

let editId = null;

loadStaff();


// SHOW / HIDE LOGIN FIELDS

createLogin.addEventListener("change", function () {
    loginFields.style.display = this.checked ? "grid" : "none";
});


// ADD OR UPDATE STAFF

staffForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const staffData = {
        staff_id: document.getElementById("staff_id").value,
        full_name: document.getElementById("full_name").value,
        role: document.getElementById("role").value,
        station_name: document.getElementById("station_name").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        employment_status: document.getElementById("employment_status").value,
        office_lat: document.getElementById("office_lat").value,
        office_lng: document.getElementById("office_lng").value,
        allowed_radius: document.getElementById("allowed_radius").value || 200
    };

    const url = editId
        ? `http://127.0.0.1:5050/api/staff/${editId}`
        : "http://127.0.0.1:5050/api/staff";

    const method = editId ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify(staffData)
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Failed to save staff");
            return;
        }


        if (!editId && createLogin.checked) {
            const loginEmail =
                document.getElementById("login_email").value;

            const loginPassword =
                document.getElementById("login_password").value;

            if (!loginEmail || !loginPassword) {
                alert("Staff saved, but login email/password was not provided.");
            } else {
                const loginData = {
                    full_name: staffData.full_name,
                    email: loginEmail,
                    password: loginPassword,
                    role: staffData.role
                };

                const loginResponse = await fetch(
                    "http://127.0.0.1:5050/api/auth/register",
                    {
                        method: "POST",
                        headers: getAuthHeaders(),
                        body: JSON.stringify(loginData)
                    }
                );

                const loginResult = await loginResponse.json();

                if (!loginResponse.ok) {
                    alert(
                        "Staff saved, but login account failed: " +
                        (loginResult.error || "Unknown error")
                    );
                } else {
                    alert(
                        "Staff saved and login account created successfully"
                    );
                }
            }

        } else {
            alert(result.message);
        }


        staffForm.reset();
        loginFields.style.display = "none";
        createLogin.checked = false;
        editId = null;

        loadStaff();

    } catch (error) {
        console.error(error);
        alert("Frontend could not connect to backend");
    }
});


// LOAD STAFF

async function loadStaff() {
    try {
        const response = await fetch(
            "http://127.0.0.1:5050/api/staff",
            {
                headers: getAuthHeaders()
            }
        );

        const data = await response.json();

        const searchValue = staffSearch.value.toLowerCase();

        const filtered = data.filter(item =>
            item.staff_id.toLowerCase().includes(searchValue) ||
            item.full_name.toLowerCase().includes(searchValue) ||
            item.role.toLowerCase().includes(searchValue) ||
            item.station_name.toLowerCase().includes(searchValue) ||
            item.employment_status.toLowerCase().includes(searchValue)
        );

        staffTable.innerHTML = "";

        filtered.forEach(item => {
            staffTable.innerHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.staff_id}</td>
                    <td>${item.full_name}</td>
                    <td>${item.role}</td>
                    <td>${item.station_name}</td>
                    <td>${item.phone}</td>
                    <td>${item.email}</td>
                    <td>${item.employment_status}</td>
                    <td>${item.office_lat || "-"}</td>
                    <td>${item.office_lng || "-"}</td>
                    <td>${item.allowed_radius || 200}m</td>
                    <td>
                        <button
                            class="edit-btn"
                            onclick='editStaff(${JSON.stringify(item)})'
                        >
                            Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteStaff(${item.id})"
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


// SEARCH STAFF

staffSearch.addEventListener("input", loadStaff);


// EDIT STAFF

function editStaff(item) {
    editId = item.id;

    document.getElementById("staff_id").value = item.staff_id;
    document.getElementById("full_name").value = item.full_name;
    document.getElementById("role").value = item.role;
    document.getElementById("station_name").value = item.station_name;
    document.getElementById("phone").value = item.phone;
    document.getElementById("email").value = item.email;
    document.getElementById("employment_status").value = item.employment_status;

    document.getElementById("office_lat").value =
        item.office_lat || "";

    document.getElementById("office_lng").value =
        item.office_lng || "";

    document.getElementById("allowed_radius").value =
        item.allowed_radius || 200;

    createLogin.checked = false;
    loginFields.style.display = "none";
}


// DELETE STAFF

async function deleteStaff(id) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this staff member?"
    );

    if (!confirmDelete) return;

    try {
        const response = await fetch(
            `http://127.0.0.1:5050/api/staff/${id}`,
            {
                method: "DELETE",
                headers: getAuthHeaders()
            }
        );

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Failed to delete staff");
            return;
        }

        alert(result.message);
        loadStaff();

    } catch (error) {
        console.error(error);
        alert("Frontend could not connect to backend");
    }
}