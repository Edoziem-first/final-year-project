const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const db = require("../db");

const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");


// EMAIL SETUP

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// REGISTER USER - ADMIN ONLY

router.post(
    "/register",
    verifyToken,
    allowRoles("Admin"),
    async (req, res) => {

        const {
            full_name,
            email,
            password,
            role
        } = req.body;

        if (!full_name || !email || !password || !role) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            const sql = `
                INSERT INTO users
                (full_name, email, password, role)
                VALUES (?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    full_name,
                    email,
                    hashedPassword,
                    role
                ],
                async (err, result) => {

                    if (err) {
                        return res.status(500).json({
                            error: err.message
                        });
                    }

                   try {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Oil Management System Login Details",
        html: `
            <h2>Welcome to Oil Management System</h2>

            <p>Hello ${full_name},</p>

            <p>Your account has been created successfully.</p>

            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p><strong>Role:</strong> ${role}</p>

            <p>Please login and change your password after first login.</p>
        `
    });
} catch (emailError) {
    console.error("Email failed:", emailError.message);
}

                    res.status(201).json({
                        message: "User registered and email sent successfully",
                        id: result.insertId
                    });
                }
            );

        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }
);


// LOGIN USER

router.post("/login", (req, res) => {

    const {
        email,
        password
    } = req.body;

    const sql = `
        SELECT *
        FROM users
        WHERE email = ?
    `;

    db.query(sql, [email], async (err, results) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const user = results[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }
        });
    });
});

// CHANGE OWN PASSWORD

router.put(
    "/change-password",
    verifyToken,
    async (req, res) => {

        const userId = req.user.id;

        const {
            oldPassword,
            newPassword
        } = req.body;

        const sql = `
            SELECT *
            FROM users
            WHERE id = ?
        `;

        db.query(sql, [userId], async (err, results) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            const user = results[0];

            const passwordMatch = await bcrypt.compare(
                oldPassword,
                user.password
            );

            if (!passwordMatch) {
                return res.status(401).json({
                    error: "Old password is incorrect"
                });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            db.query(
                "UPDATE users SET password = ? WHERE id = ?",
                [hashedPassword, userId],
                (err) => {

                    if (err) {
                        return res.status(500).json({
                            error: err.message
                        });
                    }

                    res.json({
                        message: "Password changed successfully"
                    });

                }
            );

        });

    }
);


// ADMIN RESET USER PASSWORD

router.put(
    "/admin-reset-password",
    verifyToken,
    allowRoles("Admin"),
    async (req, res) => {

        const {
            email,
            newPassword
        } = req.body;

        const hashedPassword =
        await bcrypt.hash(newPassword, 10);

        db.query(
            "UPDATE users SET password = ? WHERE email = ?",
            [hashedPassword, email],
            (err, result) => {

                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        error: "User not found"
                    });
                }

                res.json({
                    message: "User password reset successfully"
                });

            }
        );

    }
);




module.exports = router;