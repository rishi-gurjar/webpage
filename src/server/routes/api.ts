import express from 'express';
import { saveEmailToSheets, sendEmails } from '../services/emailService';
import { generateResponse } from '../services/llmService';
import { sheets } from '../config';

const router = express.Router();

router.get('/subscribers', async (req, res) => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID,
        range: 'F1',
    });

    const currentValue = parseInt(response.data.values?.[0]?.[0] || '0');
    res.json({ count: currentValue });
});

router.post('/track', async (req, res) => {
    const path = req.body;
    const timestamp = new Date().toLocaleString();

    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.ip ||
        req.socket.remoteAddress ||
        'Unknown';

    const userAgent = req.headers['user-agent'] || 'Unknown';
    const referer = req.headers.referer || 'Direct';
    const device = userAgent.match(/\((.*?)\)/)?.[1]?.split(';')[0] || 'Unknown Device';

    console.log(`${timestamp} | ${path} | ${ip} | ${device}`);
    res.status(200).send('OK');
});

router.post('/subscribe', async (req, res) => {
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

router.post('/llm', async (req, res) => {
    const timestamp = new Date().toISOString();
    const { prompt, philosopher, history } = req.body;
    
    if (!prompt || !philosopher) {
        console.error('Invalid request received:', req.body);
        res.status(400).json({ text: 'Invalid request' });
        return;
    }

    console.log(`\nUser to ${philosopher}: "${prompt}" | Time: ${timestamp}`);

    try {
        const response = await generateResponse(philosopher, prompt, history);
        console.log(`\n${philosopher} to user: "${response.slice(0, 100)}"`);
        res.json({ text: response });
    } catch (error) {
        console.error('\nError occurred:', error);
        res.status(500).json({ 
            text: error instanceof Error ? `Error: ${error.message}` : 'An unknown error occurred' 
        });
    }
});

router.get('/test', (req, res) => {
    res.json({ message: 'Express server is running!' });
});

export default router; 