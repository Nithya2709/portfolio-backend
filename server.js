const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and message are required.'
            });
        }

        console.log('──────────────────────────────────────');
        console.log('��� New Contact Form Submission');
        console.log('──────────────────────────────────────');
        console.log(`Name    : ${name}`);
        console.log(`Email   : ${email}`);
        console.log(`Subject : ${subject || '(no subject)'}`);
        console.log(`Message : ${message}`);
        console.log('──────────────────────────────────────');

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                replyTo: email,
                subject: `Portfolio Contact: ${subject || name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
                            New Portfolio Contact
                        </h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px; font-weight: bold; color: #555; width: 100px;">Name</td>
                                <td style="padding: 8px;">${name}</td>
                            </tr>
                            <tr style="background: #f9f9f9;">
                                <td style="padding: 8px; font-weight: bold; color: #555;">Email</td>
                                <td style="padding: 8px;"><a href="mailto:${email}">${email}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; font-weight: bold; color: #555;">Subject</td>
                                <td style="padding: 8px;">${subject || '(no subject)'}</td>
                            </tr>
                            <tr style="background: #f9f9f9;">
                                <td style="padding: 8px; font-weight: bold; color: #555; vertical-align: top;">Message</td>
                                <td style="padding: 8px; white-space: pre-wrap;">${message}</td>
                            </tr>
                        </table>
                        <p style="color: #888; font-size: 12px; margin-top: 20px;">
                            Sent from your portfolio contact form.
                        </p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully to', process.env.EMAIL_USER);
        } else {
            console.log('ℹ️  Email not configured.');
        }

        res.json({
            success: true,
            message: 'Thank you! Your message has been received.'
        });

    } catch (error) {
        console.error('❌ Error in /api/contact:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error sending message. Please try again later.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`\n��� Server is running on http://localhost:${PORT}`);
    console.log(`��� Health check: http://localhost:${PORT}/api/health\n`);
});
