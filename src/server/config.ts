import dotenv from 'dotenv';
import { google } from 'googleapis';
import path from 'path';

dotenv.config();

// Google Sheets setup
const credentials = require('../../blog-441622-f450efc783d0.json');
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const sheets = google.sheets({ version: 'v4', auth });
export const PORT = process.env.PORT || 3000;
export const BLOG_DIR = path.join(process.cwd(), 'src', 'blog-content'); 