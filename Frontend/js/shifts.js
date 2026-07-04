const shiftForm = document.getElementById("shiftForm");
const staffSelect = document.getElementById("staffSelect");
const shiftTable = document.getElementById("shiftTable");
const shiftSearch = document.getElementById("shiftSearch");

let staffList = [];
let editId = null;

const loggedInUser =
    JSON.parse(localStorage.getItem("user"));

loadStaffDropdown();
loadShifts();


// LOAD STAFF INTO DROPDOWN

async function loadStaffDropdown() {
    try {
        const response = await fetch(
            "http://127.0.0.1:5050/api/staff",
            {
                headers: getAuthHeaders()
            }
        );

        staffList = await response.json();

        staffSelect.innerHTML = `
            <option value="">Select staff</option>
        `;

        staffList.forEach(staff => {
            staffSelect.innerHTML += `
                <option value="${staff.id}">
                    ${staff.full_name} - ${staff.role}
                </option>
            `;
        });

    } catch (error) {
        console.error(error);
    }
}


// AUTO FILL STAFF DETAILS

staffSelect.addEventListener("change", function () {
    const selectedStaff = staffList.find(
        staff => String(staff.id) === this.value
    );

    if (!selectedStaff) {
        document.getElementById("staff_id").value = "";
        document.getElementById("role").value = "";
        document.getElementById("station_name").value = "";
        return;
    }

    document.getElementById("staff_id").value =
        selectedStaff.staff_id;

    document.getElementById("role").value =
        selectedStaff.role;

    document.getElementById("station_name").value =
        selectedStaff.station_name;
});


// ADD OR UPDATE SHIFT

shiftForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const selectedStaff = staffList.find(
        staff => String(staff.id) === staffSelect.value
    );

    if (!selectedStaff) {
        alert("Please select a valid staff member");
        return;
    }

    const shiftData = {
        staff_id: selectedStaff.staff_id,
        staff_name: selectedStaff.full_name,
        role: selectedStaff.role,
        station_name: selectedStaff.station_name,
        shift_name: document.getElementById("shift_name").value,
        shift_date: document.getElementById("shift_date").value,
        assigned_by: loggedInUser.email
    };

    const url = editId
        ? `http://127.0.0.1:5050/api/shifts/${editId}`
        : "http://127.0.0.1:5050/api/shifts";

    const method = editId ? "PUT" : "POST";

    try {
        const response = await fetch(
            url,
            {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(shiftData)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Failed to save shift");
            return;
        }

        alert(result.message);

        shiftForm.reset();
        editId = null;

        loadShifts();

    } catch (error) {
        console.error(error);
        alert("Frontend could not connect to backend");
    }
});


// LOAD SHIFTS

async function loadShifts() {
    try {
        const response = await fetch(
            "http://127.0.0.1:5050/api/shifts",
            {
                headers: getAuthHeaders()
            }
        );

        const data = await response.json();

        const searchValue =
            shiftSearch.value.toLowerCase();

        const filtered = data.filter(item =>
            item.staff_name.toLowerCase().includes(searchValue) ||
            item.role.toLowerCase().includes(searchValue) ||
            item.station_name.toLowerCase().includes(searchValue) ||
            item.shift_name.toLowerCase().includes(searchValue)
        );

        shiftTable.innerHTML = "";

        filtered.forEach(item => {
            shiftTable.innerHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.staff_id}</td>
                    <td>${item.staff_name}</td>
                    <td>${item.role}</td>
                    <td>${item.station_name}</td>
                    <td>${item.shift_name}</td>
                    <td>${item.shift_date}</td>
                    <td>${item.assigned_by}</td>
                    <td>
                        <button
                            class="edit-btn"
                            onclick='editShift(${JSON.stringify(item)})'
                        >
                            Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteShift(${item.id})"
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


// SEARCH SHIFTS

shiftSearch.addEventListener(
    "input",
    loadShifts
);


// EDIT SHIFT

function editShift(item) {
    editId = item.id;

    const selectedStaff = staffList.find(
        staff => staff.staff_id === item.staff_id
    );

    if (selectedStaff) {
        staffSelect.value = selectedStaff.id;
    }

    document.getElementById("staff_id").value =
        item.staff_id;

    document.getElementById("role").value =
        item.role;

    document.getElementById("station_name").value =
        item.station_name;

    document.getElementById("shift_name").value =
        item.shift_name;

    document.getElementById("shift_date").value =
        item.shift_date;
}


// DELETE SHIFT

async function deleteShift(id) {
    const confirmDelete =
        confirm("Are you sure you want to delete this shift assignment?");

    if (!confirmDelete) return;

    try {
        const response = await fetch(
            `http://127.0.0.1:5050/api/shifts/${id}`,
            {
                method: "DELETE",
                headers: getAuthHeaders()
            }
        );

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Failed to delete shift");
            return;
        }

        alert(result.message);

        loadShifts();

    } catch (error) {
        console.error(error);
        alert("Frontend could not connect to backend");
    }
}