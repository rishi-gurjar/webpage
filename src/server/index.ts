import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({
    origin: [
        'https://rishigurjar.com',
        'http://localhost:3001',
        'https://wrctkehcvd0y.share.zrok.io'
    ],
    credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const { method, url, headers } = req;
    const userAgent = headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.socket.remoteAddress || 'Unknown';
    const referer = headers.referer || 'Direct';

    // Pretty console logging
    console.log('\n=== New Request ===');
    console.log(`Time: ${timestamp}`);
    console.log(`Method: ${method}`);
    console.log(`URL: ${url}`);
    console.log(`IP: ${ip}`);
    console.log(`Referer: ${referer}`);
    console.log(`User Agent: ${userAgent}`);
    console.log('=================\n');

    next();
});

const credentials = require('../../blog-441622-f450efc783d0.json');
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

interface SubscribeRequest {
    email: string;
}

const subscribeHandler = async (
    req: Request<{}, {}, SubscribeRequest>,
    res: Response
): Promise<void> => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        res.status(400).json({ error: 'Please provide a valid email address' });
        return;
    }

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.SHEET_ID,
            range: 'A:B', // Save emails to the first sheet
            valueInputOption: 'RAW',
            requestBody: {
                values: [[email, new Date().toISOString()]],
            },
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        res.status(500).json({ error: 'Failed to subscribe. Please try again later.' });
    }
};

app.post('/api/subscribe', subscribeHandler);

// Simple endpoint for tracking page views
app.get('/api/track', (req: Request, res: Response) => {
    res.status(200).json({ success: true });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 