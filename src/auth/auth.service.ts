import { Injectable } from '@nestjs/common';
import {
  GOOGLE_ACCESS_TOKEN,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_REFRESH_TOKEN,
  SCOPES,
} from 'config';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

@Injectable()
export class AuthService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      redirectUri: GOOGLE_REDIRECT_URI,
    });
  }

  async getGoogleAuthUrl() {
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    return url;
  }

  async getGoogleToken(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);

    return tokens;
  }

  async getGoogleClient() {
    this.oauth2Client.setCredentials({
      access_token: GOOGLE_ACCESS_TOKEN,
      refresh_token: GOOGLE_REFRESH_TOKEN,
    });

    return this.oauth2Client;
  }
}
