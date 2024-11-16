import express, { Request, Response } from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.text());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Google Sheets setup
const credentials = require('../../blog-441622-f450efc783d0.json');
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

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

// Page view tracking endpoint - just log to console
app.post('/api/track', async (req: Request, res: Response) => {
    const path = req.body;
    const timestamp = new Date().toLocaleString();
    console.log(`[${timestamp}] Page View: ${path}`);
    res.status(200).send('OK');
});

// Email subscription endpoint
app.post('/api/subscribe', async (req: Request, res: Response) => {
    const email = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
        res.status(200).send('Invalid');
        return;
    }

    try {
        await saveEmailToSheets(email);
        console.log(`Added to Sheets: ${email}`);
        res.status(200).send('OK');
    } catch (error) {
        console.error('Error saving to Sheets:', error);
        res.status(200).send('Error');
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\n=== Server Started ===`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Port: ${PORT}`);
    console.log('===================\n');
}); 