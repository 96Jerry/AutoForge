import { configDotenv } from 'dotenv';

configDotenv();

export const SEND_EMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
export const CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar'];
export const SCOPES = [...SEND_EMAIL_SCOPES, ...CALENDAR_SCOPES];

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
export const GOOGLE_ACCESS_TOKEN = process.env.GOOGLE_ACCESS_TOKEN;
export const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const MENU_SITE_URL = process.env.MENU_SITE_URL;
export const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
export const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Database configuration
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = parseInt(process.env.DB_PORT) || 5432;
export const DB_USERNAME = process.env.DB_USERNAME || 'paradise';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
export const DB_DATABASE = process.env.DB_DATABASE || 'auto_forge';
