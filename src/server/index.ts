import express, { Request, Response } from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// CORS setup
app.use(cors({
    origin: '*',  // Allow all origins since client is using no-cors
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Add text parser before json parser
app.use(express.text());  // This will handle text/plain requests

// Debug logging
app.use((req, res, next) => {
    console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.method === 'POST') {
        console.log('Content-Type:', req.headers['content-type']);
        console.log('Body:', req.body);  // Will be plain text
    }
    next();
});

// Google Sheets setup
const credentials = require('../../blog-441622-f450efc783d0.json');
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

// Helper function to save email to Google Sheets
async function saveEmailToSheets(email: string): Promise<void> {
    await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.SHEET_ID,
        range: 'A:B',
        valueInputOption: 'RAW',
        requestBody: {
            values: [[email, new Date().toISOString()]],
        },
    });
}

// Test endpoint for CORS
app.get('/api/test', (req: Request, res: Response) => {
    console.log('Test endpoint hit');
    res.status(200).send('CORS is working!');
});

// Single endpoint for email subscriptions
app.post('/api/subscribe', async (req: Request, res: Response) => {
    console.log('Raw request body:', req.body);
    
    // Handle both text and JSON formats
    let email: string;
    if (typeof req.body === 'string') {
        email = req.body;
    } else if (typeof req.body === 'object' && req.body.email) {
        email = req.body.email;
    } else {
        console.log('Invalid body format:', req.body);
        res.status(200).send('Invalid format');
        return;
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
        console.log('Invalid email:', email);
        res.status(200).send('Invalid email');
        return;
    }

    try {
        await saveEmailToSheets(email);
        console.log(`Subscribed: ${email}`);
        res.status(200).send('Success');
    } catch (error) {
        console.error('Error:', error);
        res.status(200).send('Error');
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\n=== Server Started ===`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Port: ${PORT}`);
    console.log(`CORS: Allowing all origins (no-cors mode)`);
    console.log(`Content-Type: Expecting text/plain for POST requests`);
    console.log('===================\n');
}); 