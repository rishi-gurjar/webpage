import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Updated CORS configuration for production
app.use(cors({
    origin: [
        'https://rishigurjar.com',
        'https://www.rishigurjar.com',
        'http://localhost:3000',
        'http://localhost:3001',
        'https://wrctkehcvd0y.share.zrok.io' // Add zrok URL
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: true
}));

app.use(express.json());

// Handle OPTIONS requests explicitly
app.options('*', cors());

// Enhanced request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const { method, url, headers, body } = req;
    const userAgent = headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.socket.remoteAddress || 'Unknown';
    const referer = headers.referer || 'Direct';

    // Pretty console logging with more details
    console.log('\n=== New Request ===');
    console.log(`Time: ${timestamp}`);
    console.log(`Method: ${method}`);
    console.log(`URL: ${url}`);
    console.log(`IP: ${ip}`);
    console.log(`Referer: ${referer}`);
    console.log(`User Agent: ${userAgent}`);
    if (method === 'POST') {
        console.log('Body:', body);
    }
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
            range: 'A:B',
            valueInputOption: 'RAW',
            requestBody: {
                values: [[email, new Date().toISOString()]],
            },
        });

        console.log(`Successfully subscribed: ${email}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        res.status(500).json({ error: 'Failed to subscribe. Please try again later.' });
    }
};

app.post('/api/subscribe', subscribeHandler);

// Enhanced tracking endpoint
app.get('/api/track', (req: Request, res: Response) => {
    const page = req.query.page || 'unknown';
    console.log(`Page view tracked: ${page}`);
    res.status(200).json({ success: true });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`\n=== Server Started ===`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Port: ${PORT}`);
    console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`CORS origins enabled for:`);
    console.log('- https://rishigurjar.com');
    console.log('- https://www.rishigurjar.com');
    console.log('- http://localhost:3000');
    console.log('- http://localhost:3001');
    console.log('- https://wrctkehcvd0y.share.zrok.io');
    console.log('===================\n');
}); 