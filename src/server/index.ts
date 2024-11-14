import express, { Request, Response } from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Simple CORS setup
app.use(cors({
    origin: 'https://rishigurjar.com',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Debug logging
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "https://rishigurjar.com");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");  
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
    res.json({ message: 'CORS is working!' });
});

// Single endpoint for email subscriptions
app.post('/api/subscribe', async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        res.status(400).json({ error: 'Please provide a valid email address' });
        return;
    }

    try {
        await saveEmailToSheets(email);
        console.log(`Subscribed: ${email}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\n=== Server Started ===`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Port: ${PORT}`);
    console.log(`CORS: Allowing rishigurjar.com`);
    console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
    console.log('===================\n');
}); 