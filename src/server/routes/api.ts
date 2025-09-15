import express from 'express';
import { saveEmailToSheets, sendEmails } from '../services/emailService';
import { generateResponse } from '../services/llmService';
import { sheets } from '../config';
import { fetchIpInfo } from '../services/ipInfoService';
import { createClient } from '@supabase/supabase-js';
import { getBooksCached } from '../services/goodreadsService';
const router = express.Router();
const supabaseUrl = process.env.SUPA_URL
const supabaseKey = process.env.SUPA_KEY;

function log(endpoint: string) {
    const timestamp = new Date().toLocaleString();
    console.log(`${timestamp} | ${endpoint} endpoint`);
}

router.get('/subscribers', async (req, res) => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID,
        range: 'F1',
    });

    const currentValue = parseInt(response.data.values?.[0]?.[0] || '0');
    res.json({ count: currentValue });
});

// Uses service fetchIpInfo (ipwho.is/ipapi.co with puppeteer fallback)

router.post('/track', async (req, res) => {
    const path = req.body;
    const timestamp = new Date().toLocaleString();

    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.ip ||
        req.socket.remoteAddress ||
        'Unknown';

    let parsed_ip_data: any = {};
    try {
        parsed_ip_data = await fetchIpInfo(ip);
    } catch (error) {
        console.error("Error fetching IP data:", error);
    }

    const userAgent = req.headers['user-agent'] || 'Unknown';
    const referer = req.headers.referer || 'Direct';
    const device = userAgent.match(/\((.*?)\)/)?.[1]?.split(';')[0] || 'Unknown Device';

    const pieces = [] as string[];
    if (parsed_ip_data?.city) pieces.push(parsed_ip_data.city);
    if (parsed_ip_data?.region) pieces.push(parsed_ip_data.region);
    if (parsed_ip_data?.country) pieces.push(parsed_ip_data.country);
    if (parsed_ip_data?.isp) pieces.push(parsed_ip_data.isp);
    const locationStr = pieces.length ? `${pieces.join(', ')} | ` : '';
    console.log(`${timestamp} | ${path} | ${ip} | ${locationStr}${device}`);
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
    // log('/validate-beacon-password')
    const { password } = req.body;

    // Get password from environment variable
    const correctPassword = process.env.BEACON_PASSWORD;

    if (!correctPassword) {
        return res.status(500).json({ success: false, message: 'Loser' });
    }

    const isValid = password === correctPassword;

    return res.status(isValid ? 200 : 401).json({ success: isValid });
});

router.post('/validate-nudge-dash-password', async (req: any, res: any) => {
    // log('/validate-beacon-password')
    const { password } = req.body;

    // Get password from environment variable
    const correctPassword = process.env.NUDGE_DASH_PASSWORD;

    if (!correctPassword) {
        return res.status(500).json({ success: false, message: 'Loser' });
    }

    const isValid = password === correctPassword;

    return res.status(isValid ? 200 : 401).json({ success: isValid });
});


router.get('/ping', (req: express.Request, res: express.Response) => {
    console.log('Ping received from:', req.headers.origin);
    res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

// Goodreads books
router.get('/books', async (_req: express.Request, res: express.Response) => {
    try {
        const books = await getBooksCached();
        console.log(`/api/books served: ${books.length}`);
        res.json({ updatedAt: new Date().toISOString(), count: books.length, books });
    } catch (e) {
        console.error('Error fetching books:', e);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

// Get all psych profile data
router.get('/nudge/psych-profiles', async (req: any, res: any) => {

    try {

        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({ error: 'Supabase credentials not configured' });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error, count } = await supabase
            .from('psych_profiles')
            .select('*', { count: 'exact' });

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        res.json({ data, count });
    } catch (error) {
        console.error('Error fetching psych profiles:', error);
        res.status(500).json({
            error: 'Failed to fetch psych profiles',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// Consolidate user growth and active users into a single endpoint
router.get('/nudge/user-data', async (req: any, res: any) => {
    try {

        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({ error: 'Supabase credentials not configured' });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get all user data in one request
        const { data, error } = await supabase
            .from('profiles')
            .select('id, created_at, updated_at');

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        res.json({ data });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({
            error: 'Failed to fetch user data',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

export default router; 