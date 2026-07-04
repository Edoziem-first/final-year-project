const db = require("../db");

function createNotification(title, message, type) {
    const sql = `
        INSERT INTO notifications
        (
            title,
            message,
            type
        )
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [
            title,
            message,
            type
        ],
        (err) => {
            if (err) {
                console.error(
                    "Notification error:",
                    err.message
                );
            }
        }
    );
}

module.exports = createNotification;