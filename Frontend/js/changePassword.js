document.addEventListener("DOMContentLoaded", function () {
    const changePasswordForm = document.getElementById("changePasswordForm");
    const adminResetSection = document.getElementById("adminResetSection");
    const adminResetForm = document.getElementById("adminResetForm");

    const user = JSON.parse(localStorage.getItem("user"));

    if (user && user.role === "Admin") {
        adminResetSection.style.display = "block";
    }

    changePasswordForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        const passwordData = {
            oldPassword: document.getElementById("oldPassword").value,
            newPassword: document.getElementById("newPassword").value
        };

        const response = await fetch(
            "http://127.0.0.1:5050/api/auth/change-password",
            {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(passwordData)
            }
        );

        const result = await response.json();
        alert(result.message || result.error);

        if (response.ok) {
            changePasswordForm.reset();
        }
    });

    adminResetForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        const resetData = {
            email: document.getElementById("resetEmail").value,
            newPassword: document.getElementById("resetPassword").value
        };

        const response = await fetch(
            "http://127.0.0.1:5050/api/auth/admin-reset-password",
            {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(resetData)
            }
        );

        const result = await response.json();
        alert(result.message || result.error);

        if (response.ok) {
            adminResetForm.reset();
        }
    });
});