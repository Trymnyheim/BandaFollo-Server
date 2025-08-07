const express = require('express');
const emailRouter = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

// POST /send-email endpoint
emailRouter.post('/', async (req, res) => {
    const { subject, text } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject,
            text
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: "Email sent successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to send email", error });
    }
});

module.exports = emailRouter;