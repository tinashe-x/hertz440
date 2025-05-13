const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { Mailchimp } = require('@mailchimp/mailchimp_marketing');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Mailchimp
const mailchimp = new Mailchimp({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER_PREFIX
});

// Email subscription endpoint
app.post('/api/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email || !email.includes('@')) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide a valid email address' 
            });
        }

        // Add subscriber to Mailchimp list
        await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
            email_address: email,
            status: 'subscribed'
        });

        // Send confirmation email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to Hertz440!',
            html: `
                <h1>Welcome to Hertz440!</h1>
                <p>Thank you for subscribing to our newsletter. You'll be the first to know about new releases and updates.</p>
                <p>Stay tuned!</p>
            `
        });

        res.json({ 
            success: true, 
            message: 'Successfully subscribed!' 
        });

    } catch (error) {
        console.error('Subscription error:', error);
        
        // Handle specific error cases
        if (error.response?.body?.title === 'Member Exists') {
            return res.status(400).json({ 
                success: false, 
                message: 'This email is already subscribed' 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'An error occurred. Please try again later.' 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 