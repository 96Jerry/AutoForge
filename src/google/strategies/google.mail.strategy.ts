import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class GoogleMailStrategy {
  constructor(private readonly authService: AuthService) {}

  async sendEmail({
    from,
    to,
    subject,
    html,
  }: {
    from: string;
    to: string;
    subject: string;
    html: string;
  }) {
    const client = await this.authService.getGoogleClient();

    const gmail = google.gmail({ version: 'v1', auth: client });

    const data = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset="UTF-8"',
      '',
      html,
    ].join('\r\n');

    const base64EncodedEmail = Buffer.from(data)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    try {
      const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: base64EncodedEmail,
        },
      });

      return res.data;
    } catch (err) {
      console.error('Error Name:', err.name);
      console.error('Error Message:', err.message);
      console.error('Error Stack:', err.stack);
      console.error(
        'Error Response:',
        err.response?.data || err.response || 'No response data',
      );
    }
  }
}
