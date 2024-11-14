import express, { Request, Response } from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Only use text parser since we're only accepting plaintext
app.use(express.text());

// Debug logging
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.method === 'POST') {
        console.log('Content-Type:', req.headers['content-type']);
        console.log('Raw Body:', req.body);
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

// Test endpoint
app.get('/api/test', (req: Request, res: Response) => {
    console.log('Test endpoint hit');
    res.status(200).send('OK');  // Simple text response
});

// Email subscription endpoint - expecting plaintext only
app.post('/api/subscribe', async (req: Request, res: Response) => {
    const email = req.body;  // Body is already text
    console.log('Received email:', email);

    if (!email || typeof email !== 'string' || !email.includes('@')) {
        res.status(200).send('Invalid');  // Always 200 for no-cors
        return;
    }

    try {
        await saveEmailToSheets(email);
        console.log(`Subscribed: ${email}`);
        res.status(200).send('OK');  // Simple text response
    } catch (error) {
        console.error('Error:', error);
        res.status(200).send('Error');  // Always 200 for no-cors
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\n=== Server Started ===`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Port: ${PORT}`);
    console.log(`Mode: Plaintext only, no-cors responses`);
    console.log('===================\n');
}); 