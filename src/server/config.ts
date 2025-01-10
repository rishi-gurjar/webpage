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
export const PORT = process.env.PORT || 3001;
export const BLOG_DIR = path.join(process.cwd(), 'src', 'blog-content');

// MLX Model constants
export const MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.2";
export const BASE_DIRECTORY = "/Users/rishigurjar/Documents/GitHub/webpage/models";
export const MLX_DIRECTORY = `${BASE_DIRECTORY}/mlx`;
export const MLX_MODEL_DIRECTORY = `${MLX_DIRECTORY}/${MODEL_NAME}`; 