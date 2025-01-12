import express from 'express';
import { saveEmailToSheets, sendEmails } from '../services/emailService';
import { generateResponse } from '../services/llmService';
import { sheets } from '../config';
import http from 'http';
import { getTotalSleepTime, getMentalPhysCheck, getWorkouts } from '../services/v9Service';
const router = express.Router();
const ipstack_key = process.env.IP_STACK_KEY

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

    // Setting the configuration for the request
    const options = {
        hostname: 'api.ipstack.com',
        path: `/${ip}?access_key=${ipstack_key}`,
        method: 'GET'
    };

    let parsed_ip_data: any = {};
    // Sending the request
    try {
        // Convert the HTTP request to a Promise
        const ipData = await new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.ipstack.com',
                path: `/${ip}?access_key=${ipstack_key}`,
                method: 'GET'
            };

            const req2 = http.request(options, (res2) => {
                let data = '';
                res2.on('data', (chunk) => data += chunk);
                res2.on('end', () => resolve(JSON.parse(data)));
            });

            req2.on('error', reject);
            req2.end();
        });

        parsed_ip_data = ipData;
    } catch (error) {
        console.error("Error fetching IP data:", error);
    }

    const userAgent = req.headers['user-agent'] || 'Unknown';
    const referer = req.headers.referer || 'Direct';
    const device = userAgent.match(/\((.*?)\)/)?.[1]?.split(';')[0] || 'Unknown Device';

    console.log(`${timestamp} | ${path} | ${ip} | ${parsed_ip_data.city}, ${parsed_ip_data.region_name}, ${parsed_ip_data.country_name} | ${device}`);
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

router.post('/validate-beacon-password', async (req: any, res: any) => {
    const { password } = req.body;

    // Get password from environment variable
    const correctPassword = process.env.BEACON_PASSWORD;

    if (!correctPassword) {
        return res.status(500).json({ success: false, message: 'Loser' });
    }

    const isValid = password === correctPassword;

    return res.status(isValid ? 200 : 401).json({ success: isValid });
});

router.get('/sleep-time', async (req: express.Request, res: express.Response) => {
    try {
        const sleepData = await getTotalSleepTime();
        res.json(sleepData);
    } catch (error) {
        console.error('Error fetching sleep time:', error);
        res.status(500).json({ error: 'Failed to fetch sleep data' });
    }
});

router.get('/mentalphys-check', async (req: express.Request, res: express.Response) => {
    try {
        const mentalData = await getMentalPhysCheck();
        res.json(mentalData);
    } catch (error) {
        console.error('Error fetching sleep time:', error);
        res.status(500).json({ error: 'Failed to fetch sleep data' });
    }
});

router.get('/workouts', async (req: express.Request, res: express.Response) => {
    try {
        const workoutData = await getWorkouts();
        res.json(workoutData);
    } catch (error) {
        console.error('Error fetching sleep time:', error);
        res.status(500).json({ error: 'Failed to fetch sleep data' });
    }
});

export default router; 