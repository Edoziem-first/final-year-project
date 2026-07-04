loadNotificationsPage();

async function loadNotificationsPage() {
    try {
        const response = await fetch(
            "http://127.0.0.1:5050/api/notifications",
            {
                headers: getAuthHeaders()
            }
        );

        const notifications = await response.json();

        const table = document.getElementById("notificationsTable");

        table.innerHTML = "";

        if (notifications.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="4">No notifications found</td>
                </tr>
            `;
            return;
        }

        notifications.forEach(item => {
            table.innerHTML += `
                <tr>
                    <td>${item.title}</td>
                    <td>${item.message}</td>
                    <td>${item.type}</td>
                    <td>${item.created_at}</td>
                </tr>
            `;
        });

        await fetch(
            "http://127.0.0.1:5050/api/notifications/mark-all-read",
            {
                method: "PUT",
                headers: getAuthHeaders()
            }
        );

    } catch (error) {
        console.error(error);
    }
}