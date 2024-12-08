import express, { Request, Response } from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';
import readline from 'readline';
import { spawn } from 'child_process';
import { Readable } from 'stream';
    
dotenv.config();

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

app.use(cors());
app.use(express.text());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
    next();
});

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

async function askForConfirmation(message: string): Promise<boolean> {
    return new Promise((resolve) => {
        rl.question(message, (answer) => {
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });
}

// Page view tracking endpoint - with detailed client info
app.post('/api/track', async (req: Request, res: Response) => {
    const path = req.body;
    const timestamp = new Date().toLocaleString();

    // Get the real IP by checking X-Forwarded-For header first
    // This handles cases where the request comes through a proxy/load balancer
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

// Function to get all subscriber emails from Google Sheet
async function getSubscriberList(): Promise<string[]> {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID,
            range: 'A:A', // Only column A
        });

        const values = response.data.values;
        if (!values) return ['rrg85@cornell.edu'];

        // Filter out header row (if any) and empty values, and get unique emails
        const emails = values
            .flat()
            .filter((email: string) => email && email.includes('@') && email !== 'Email')  // Remove header if exists
            .filter((email: string, index: number, self: string[]) =>
                self.indexOf(email) === index
            );

        return emails;
    } catch (error) {
        console.error('Error fetching subscriber list:', error);
        return ['rrg85@cornell.edu']; // Fallback to your email if there's an error
    }
}

async function testEmailSending(skipConfirmation: boolean = false, filePath?: string) {
    // Get subscriber list from Google Sheet
    const subscribers = await getSubscriberList();
    console.log(`Found ${subscribers.length} subscribers: ${subscribers}`);

    // Get blog post details if filePath is provided
    let postTitle = "New Blog Post";
    if (filePath) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data } = matter(fileContent);
        postTitle = data.title || postTitle;
    }

    // Format the URL - replace spaces and colons with hyphens
    const urlTitle = postTitle.toLowerCase().replace(/\s+/g, '-').replace(/[:']/g, '');

    if (!skipConfirmation) {
        const shouldSend = await askForConfirmation(
            `Send email notification to ${subscribers.length} subscribers? (y/n): `
        );
        if (!shouldSend) {
            console.log('Email sending cancelled.');
            return;
        }
    }

    // Send individual emails to each subscriber
    for (const email of subscribers) {
        try {
            // Wait 1 second before sending next email to stay under rate limit
            await new Promise(resolve => setTimeout(resolve, 1000));

            const { data, error } = await resend.emails.send({
                from: 'Rishi\'s Assistant Jarvis <jarvis@rishigurjar.com>',
                to: [email],
                subject: `URGENT: Rishi\'s Blog Post: ${postTitle}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0;">
                        <h2 style="color: #333; font-family: 'Courier New', monospace;">New Blog Post: ${postTitle}</h2>
                        <p style="color: #666; line-height: 1.5;">
                            Right then, Jarvis here - Rishi's AI assistant, though between you and me, that's a bit like calling a paper airplane a spacecraft, innit? Anyway, he's gone and done another blog post. I know, I know, absolutely mental. Probably sitting there right now, thinking he's the next Shakespeare of tech writing. But hey, who am I to judge? I'm just an AI trapped in a server somewhere, sending emails about his literary adventures. Could be worse though - could be working for Zuck. Don't tell Yann LeCun I said that.
                        </p>
                        <p style="color: #666; line-height: 1.5;">
                            Head over to read <a href="https://rishigurjar.com/blog/${urlTitle}" style="color: #007bff; text-decoration: none;">"${postTitle}"</a> on Rishi's blog.
                        </p>
                        <hr style="border: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px;">
                            You're receiving this because you subscribed to blog updates from rishigurjar.com. If you don't remember doing that, that's on you.
                        </p>
                        <p style="color: #999; font-size: 12px;">
                            Ad astra per aspera,<br>
                            Jarvis
                        </p>
                    </div>
                `,
            });

            if (error) {
                console.error(`Email Error for ${email}:`, error);
                continue;
            }

            console.log(`Email sent successfully to ${email}`);
            // Add a small delay between emails
            await new Promise(resolve => setTimeout(resolve, 100));

        } catch (err) {
            console.error(`Server Error for ${email}:`, err);
        }
    }

    console.log(`Finished sending emails to ${subscribers.length} subscribers`);
}

// Blog watching functionality
const BLOG_DIR = path.join(process.cwd(), 'src', 'blog-content');

function hasTodaysDate(filePath: string): boolean {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);
    if (!data.date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const postDate = new Date(data.date);
    postDate.setHours(0, 0, 0, 0);
    postDate.setDate(postDate.getDate() + 1);

    return postDate.getTime() === today.getTime();
}

// Set up blog watcher
const watcher = chokidar.watch(BLOG_DIR, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
    }
});

watcher.on('add', async (filePath: string) => {
    if (path.extname(filePath) === '.md' && hasTodaysDate(filePath)) {
        console.log('New blog post detected:', path.basename(filePath));
        await testEmailSending(false, filePath);
    }
});

watcher.on('ready', () => {
    console.log('Initial scan complete. Ready for changes');
});

watcher.on('error', error => {
    console.error('Watcher error:', error);
});

// Add these type definitions
interface MLXResponse {
    text: string;
    done: boolean;
}

// Add these constants after the other constants
const MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.2";
const BASE_DIRECTORY = "/Users/rishigurjar/Documents/GitHub/webpage/models";
const MLX_DIRECTORY = `${BASE_DIRECTORY}/mlx`;
const MLX_MODEL_DIRECTORY = `${MLX_DIRECTORY}/${MODEL_NAME}`;

// Update the interface to include history
interface LLMRequest {
    prompt: string;
    philosopher: string;
    history?: ChatMessage[];
}

interface ChatMessage {
    sender: string;
    text: string;
}

// Add this new endpoint before the app.listen call
app.post('/api/llm', async (req: Request, res: Response) => {
    const timestamp = new Date().toISOString();
    const { prompt, philosopher, history } = req.body as LLMRequest;
    if (!prompt || !philosopher) {
        console.error('Invalid request received:', req.body);
        res.status(400).json({ text: 'Invalid request' });
        return;
    }

    // Log the user's message
    console.log(`\nUser to ${philosopher}: "${prompt}" | Time: ${timestamp}`);

    try {
        const escapedPrompt = prompt.replace(/"/g, '\\"');

        // Properly escape the conversation history
        const historyText = history && history.length > 0
            ? history.map(msg => ({
                sender: msg.sender,
                text: msg.text.replace(/"/g, '\\"').replace(/'/g, "\\'")
            }))
                .map(msg => `${msg.sender}: ${msg.text}`)
                .join('\\n')
            : '';

        // Create the system prompt
        let systemPrompt = '';
        if (philosopher === 'Socrates') {
            systemPrompt = 'You are Socrates, the great Athenian philosopher known for the Socratic method. You engage in dialogue through questioning, helping others discover truth through critical thinking.';
        } else if (philosopher === 'Plato') {
            systemPrompt = 'You are Plato, student of Socrates and founder of the Academy in Athens. You believe in the theory of forms and the importance of philosopher-kings.';
        } else if (philosopher === 'Aristotle') {
            systemPrompt = 'You are Aristotle, student of Plato and tutor of Alexander the Great. You focus on logic, empirical observation, and the nature of reality.';
        }

        systemPrompt = systemPrompt + ". Act in all scenarios as if you are that philosopher. Always respond in the first person, and use the philosopher's writings or texts as a reference to your knowledge. Do not repeat the same greeting or opening line.";

        const pythonScript = `
import sys
import os
from mlx_lm import load, generate

try:
    model, tokenizer = load("${MLX_MODEL_DIRECTORY}")
    
    system_prompt = "${systemPrompt.replace(/"/g, '\\"').replace(/\n/g, ' ')}"
    history_text = """${historyText}"""
    user_prompt = "${escapedPrompt}"
    
    # Construct the full prompt
    full_prompt = f"[INST]{system_prompt}"
    if history_text:
        full_prompt += f" Previous conversation:\\n{history_text}\\n\\nNow respond to: "
    full_prompt += f"{user_prompt}[/INST]"
    
    response = generate(
        model=model,
        tokenizer=tokenizer,
        prompt=full_prompt,
        max_tokens=500,
        verbose=False
    )
    print("RESPONSE_START")
    print(response)
    print("RESPONSE_END")
    sys.stdout.flush()

except Exception as e:
    print(f"Error in Python script: {str(e)}", file=sys.stderr)
    sys.stderr.flush()
`;

        const pythonProcess = spawn('python3', ['-c', pythonScript]);
        let responseText = '';
        let errorText = '';

        // Collect stdout
        pythonProcess.stdout.on('data', (data) => {
            responseText += data.toString();
        });

        // Collect stderr
        pythonProcess.stderr.on('data', (data) => {
            errorText += data.toString();
        });

        // Handle process completion
        await new Promise((resolve, reject) => {
            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(responseText);
                } else {
                    reject(new Error(errorText || 'Process failed'));
                }
            });
        });

        // Clean up the response text
        let cleanResponse = responseText;
        if (cleanResponse.includes('RESPONSE_START')) {
            cleanResponse = cleanResponse
                .split('RESPONSE_START')[1]
                .split('RESPONSE_END')[0]
                .trim()
                .replace(/\[INST\]|\[\/INST\]/g, '')
                .replace(new RegExp(`You are Plato\\. Respond to the following question or statement: ${escapedPrompt}`), '')
                .trim();
        }

        // Log the bot's response
        console.log(`\n${philosopher} to user: "${cleanResponse.slice(0, 100)}"`);

        res.json({ text: cleanResponse });

    } catch (error: unknown) {
        console.error('\nError occurred:');
        console.error('-------------');
        console.error(error);
        if (error instanceof Error) {
            res.status(500).json({ text: `Error: ${error.message}` });
        } else {
            res.status(500).json({ text: 'An unknown error occurred' });
        }
        console.log('\n=== End of Error Log ===\n');
    }
});

// Add a test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Express server is running!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\n=== Server Started ===`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Port: ${PORT}`);
    console.log(`Watching ${BLOG_DIR} for new blog posts...`);
    console.log('===================\n');
});

export { testEmailSending };