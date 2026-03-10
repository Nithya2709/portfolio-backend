const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and message are required.'
            });
        }

        // Log submission to console (always works even without email setup)
        console.log('──────────────────────────────────────');
        console.log('📩 New Contact Form Submission');
        console.log('──────────────────────────────────────');
        console.log(`Name    : ${name}`);
        console.log(`Email   : ${email}`);
        console.log(`Subject : ${subject || '(no subject)'}`);
        console.log(`Message : ${message}`);
        console.log('──────────────────────────────────────');

        // ── Email sending (only runs if EMAIL_USER & EMAIL_PASS are set in .env) ──
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,        // Sends to yourself
                replyTo: email,                    // Reply goes to the sender
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
            console.log('ℹ️  Email not configured — set EMAIL_USER and EMAIL_PASS in .env to enable emails.');
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

// Portfolio data endpoint
app.get('/api/portfolio', (req, res) => {
    const portfolioData = {
        personalInfo: {
            name: 'Nithya Sree',
            role: 'Frontend Developer / CSE Student',
            description: 'Crafting clean, functional web experiences. Passionate about React, front-end development, and building things that matter.',
            email: 'your.email@example.com',
            phone: '+91 12345 67890',
            location: 'Hyderabad, India'
        },
        socialLinks: {
            linkedin: '#',
            github: '#',
            instagram: '#',
            email: 'mailto:your.email@example.com'
        },
        skills: [
            { name: 'HTML5',       icon: 'fab fa-html5',    level: 90, category: 'frontend'   },
            { name: 'CSS3',        icon: 'fab fa-css3-alt', level: 85, category: 'frontend'   },
            { name: 'JavaScript',  icon: 'fab fa-js',       level: 80, category: 'languages'  },
            { name: 'React JS',    icon: 'fab fa-react',    level: 70, category: 'frameworks' },
            { name: 'Java',        icon: 'fab fa-java',     level: 75, category: 'languages'  },
            { name: 'Git/GitHub',  icon: 'fab fa-git-alt',  level: 80, category: 'backend'    },
            { name: 'MySQL',       icon: 'fas fa-database', level: 75, category: 'backend'    },
            { name: 'Node.js',     icon: 'fas fa-cube',     level: 70, category: 'backend'    },
            { name: 'Tailwind',    icon: 'fas fa-wind',     level: 80, category: 'frameworks' },
            { name: 'REST APIs',   icon: 'fas fa-layer-group', level: 75, category: 'backend' }
        ]
    };

    res.json(portfolioData);
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
});