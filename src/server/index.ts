import express, { Request, Response } from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Broader CORS setup for no-cors requests
app.use(cors({
    origin: '*',  // Allow all origins since client is using no-cors
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.text());
app.use(express.json());

// Debug logging
app.use((req, res, next) => {
    console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.method === 'POST') console.log('Body:', req.body);
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
    res.status(200).send('CORS is working!');  // Simplified response for no-cors
});

// Single endpoint for email subscriptions
app.post('/api/subscribe', async (req: Request, res: Response) => {
    const email = req.body;

    if (!email || !email.includes('@')) {
        res.status(200).send('Invalid email');  // Plain text response
        return;
    }

    try {
        await saveEmailToSheets(email);
        console.log(`Subscribed: ${email}`);
        res.status(200).send('Success');  // Plain text response
    } catch (error) {
        console.error('Error:', error);
        res.status(200).send('Error');  // Plain text response
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\n=== Server Started ===`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Port: ${PORT}`);
    console.log(`CORS: Allowing all origins (no-cors mode)`);
    console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
    console.log('===================\n');
}); 