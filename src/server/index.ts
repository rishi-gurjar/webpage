import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Debug middleware - log all requests
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log('\n=== Request Debug ===');
    console.log('Time:', new Date().toISOString());
    console.log('Origin:', req.headers.origin);
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    if (req.method === 'POST') {
        console.log('Body:', req.body);
    }
    console.log('==================\n');
    next();
});

// Define allowed origins
const allowedOrigins = [
    'https://rishigurjar.com',
    'http://localhost:3001',
    'https://9ivizlis6cv5.share.zrok.io'
];

// Define CORS options with proper types
const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

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

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`\n=== Server Started ===`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Port: ${PORT}`);
    console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`CORS origins enabled for:`);
    console.log('- https://rishigurjar.com');
    console.log('- http://localhost:3001');
    console.log('- https://9ivizlis6cv5.share.zrok.io');
    console.log('===================\n');
}); 