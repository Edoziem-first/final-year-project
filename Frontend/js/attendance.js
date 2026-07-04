const attendanceForm = document.getElementById("attendanceForm");
const attendanceTable = document.getElementById("attendanceTable");
const attendanceSearch = document.getElementById("attendanceSearch");

const user =
    JSON.parse(localStorage.getItem("user"));

loadAttendance();


// ADD ATTENDANCE WITH LOCATION

attendanceForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!navigator.geolocation) {
        await submitAttendance(null, null);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async function (position) {
            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            await submitAttendance(latitude, longitude);
        },

        async function () {
            alert(
                "Location permission denied. Attendance will be marked absent."
            );

            await submitAttendance(null, null);
        }
    );
});


async function submitAttendance(latitude, longitude) {
    const attendanceData = {
        staff_name: document.getElementById("staff_name").value,
        station_name: document.getElementById("station_name").value,
        shift_name: document.getElementById("shift_name").value,
        check_in: document.getElementById("check_in").value,
        check_out: document.getElementById("check_out").value,
        attendance_date: document.getElementById("attendance_date").value,
        status: document.getElementById("status").value,
        user_lat: latitude,
        user_lng: longitude
    };

    try {
        const response = await fetch(
            "http://127.0.0.1:5050/api/attendance",
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(attendanceData)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Failed to add attendance");
            return;
        }

        alert(result.message);

        attendanceForm.reset();

        loadAttendance();

    } catch (error) {
        console.error(error);
        alert("Frontend could not connect to backend");
    }
}


// LOAD ATTENDANCE

async function loadAttendance() {
    try {
        const response = await fetch(
            "http://127.0.0.1:5050/api/attendance",
            {
                headers: getAuthHeaders()
            }
        );

        const data = await response.json();

        const searchValue =
            attendanceSearch.value.toLowerCase();

        const filtered = data.filter(item =>
            item.staff_name.toLowerCase().includes(searchValue) ||
            item.station_name.toLowerCase().includes(searchValue) ||
            item.shift_name.toLowerCase().includes(searchValue) ||
            item.status.toLowerCase().includes(searchValue) ||
            (item.location_status || "").toLowerCase().includes(searchValue)
        );

        attendanceTable.innerHTML = "";

        filtered.forEach(item => {
            attendanceTable.innerHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.staff_name}</td>
                    <td>${item.station_name}</td>
                    <td>${item.shift_name}</td>
                    <td>
                        <input
                            type="time"
                            id="checkin-${item.id}"
                            value="${item.check_in || ""}"
                        >
                    </td>
                    <td>
                        <input
                            type="time"
                            id="checkout-${item.id}"
                            value="${item.check_out || ""}"
                        >
                    </td>
                    <td>${item.attendance_date}</td>
                    <td>
                        <select id="status-${item.id}">
                            <option value="Present" ${item.status === "Present" ? "selected" : ""}>
                                Present
                            </option>

                            <option value="Late" ${item.status === "Late" ? "selected" : ""}>
                                Late
                            </option>

                            <option value="Absent" ${item.status === "Absent" ? "selected" : ""}>
                                Absent
                            </option>

                            <option value="On Leave" ${item.status === "On Leave" ? "selected" : ""}>
                                On Leave
                            </option>
                        </select>
                    </td>
                    <td>
                        ${item.location_status || "Not Checked"}
                    </td>
                    <td>
                        <button
                            class="edit-btn"
                            onclick="updateAttendance(${item.id})"
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


// UPDATE ATTENDANCE

async function updateAttendance(id) {
    const status = document.getElementById(`status-${id}`).value;
    const check_in = document.getElementById(`checkin-${id}`).value;
    const check_out = document.getElementById(`checkout-${id}`).value;

    try {
        const response = await fetch(
            `http://127.0.0.1:5050/api/attendance/${id}`,
            {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    status,
                    check_in,
                    check_out
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Failed to update attendance");
            return;
        }

        alert(result.message);

        loadAttendance();

    } catch (error) {
        console.error(error);
        alert("Frontend could not connect to backend");
    }
}


// SEARCH ATTENDANCE

attendanceSearch.addEventListener(
    "input",
    loadAttendance
);