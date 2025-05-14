const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();

// Enable CORS for all routes
app.use(cors());

// Add detailed request logging
app.use((req, res, next) => {
    console.log('----------------------------------------');
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('----------------------------------------');
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));

// Parse JSON bodies
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Email subscription endpoint
app.post('/api/subscribe', async (req, res) => {
    console.log('----------------------------------------');
    console.log('Subscription request received');
    console.log('Request body:', req.body);
    console.log('Environment variables check:', {
        hasEmailOctopusKey: !!process.env.EMAILOCTOPUS_API_KEY,
        hasEmailOctopusList: !!process.env.EMAILOCTOPUS_LIST_ID,
        hasEmailUser: !!process.env.EMAIL_USER,
        hasEmailPass: !!process.env.EMAIL_PASS,
        emailUser: process.env.EMAIL_USER // Log the actual email (without password)
    });
    
    try {
        const { email } = req.body;

        // Basic validation
        if (!email) {
            console.log('No email provided');
            return res.status(400).json({ 
                success: false, 
                message: 'Email is required' 
            });
        }

        if (!email.includes('@')) {
            console.log('Invalid email format:', email);
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email format' 
            });
        }

        // Check if EmailOctopus credentials are configured
        if (!process.env.EMAILOCTOPUS_API_KEY || !process.env.EMAILOCTOPUS_LIST_ID) {
            console.error('Missing EmailOctopus configuration');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error. Please contact support.'
            });
        }

        // Add subscriber to EmailOctopus
        console.log('Adding subscriber to EmailOctopus...');
        try {
            const response = await axios.post(
                `https://emailoctopus.com/api/1.6/lists/${process.env.EMAILOCTOPUS_LIST_ID}/contacts`,
                {
                    api_key: process.env.EMAILOCTOPUS_API_KEY,
                    email_address: email,
                    status: 'SUBSCRIBED'
                }
            );
            console.log('EmailOctopus response:', response.data);
        } catch (emailOctopusError) {
            console.error('EmailOctopus error:', {
                message: emailOctopusError.message,
                response: emailOctopusError.response?.data,
                status: emailOctopusError.response?.status
            });

            // Handle specific EmailOctopus errors
            if (emailOctopusError.response?.data?.error?.code === 'MEMBER_EXISTS') {
                return res.status(400).json({
                    success: false,
                    message: 'This email is already subscribed'
                });
            }

            throw emailOctopusError;
        }

        // Send confirmation email if Gmail credentials are configured
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                console.log('Setting up email transporter...');
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    },
                    debug: true // Enable debug logging
                });

                // Verify transporter configuration
                await transporter.verify();
                console.log('Email transporter verified successfully');

                console.log('Sending confirmation email...');
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'Welcome to Hertz440!',
                    html: `
                        <h1>Welcome to Hertz440!</h1>
                        <p>Thank you for subscribing to our newsletter. You'll be the first to know about new releases and updates.</p>
                        <p>Stay tuned!</p>
                    `
                };

                const info = await transporter.sendMail(mailOptions);
                console.log('Confirmation email sent successfully:', info);
            } catch (emailError) {
                console.error('Detailed email sending error:', {
                    message: emailError.message,
                    code: emailError.code,
                    command: emailError.command,
                    responseCode: emailError.responseCode,
                    response: emailError.response,
                    stack: emailError.stack
                });
                // Continue even if email fails
            }
        } else {
            console.log('Email credentials not configured, skipping confirmation email');
        }

        console.log('Subscription successful for:', email);
        return res.json({ 
            success: true, 
            message: 'Successfully subscribed!' 
        });

    } catch (error) {
        console.error('Error in subscription process:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'An error occurred. Please try again later.' 
        });
    }
});

// Serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('----------------------------------------');
    console.log(`Server started on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view your site`);
    console.log('Environment check:', {
        hasEmailOctopusKey: !!process.env.EMAILOCTOPUS_API_KEY,
        hasEmailOctopusList: !!process.env.EMAILOCTOPUS_LIST_ID,
        hasEmailUser: !!process.env.EMAIL_USER,
        hasEmailPass: !!process.env.EMAIL_PASS
    });
    console.log('----------------------------------------');
}); 