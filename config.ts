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
