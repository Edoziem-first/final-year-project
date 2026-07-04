const registerUserForm =
document.getElementById("registerUserForm");

registerUserForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const userData = {
        full_name: document.getElementById("full_name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        role: document.getElementById("role").value
    };

    try {
        const response = await fetch(
            "http://127.0.0.1:5050/api/auth/register",
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(userData)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Failed to register user");
            return;
        }

        alert(result.message);

        registerUserForm.reset();

    } catch (error) {
        console.error(error);
        alert("Frontend could not connect to backend");
    }
});