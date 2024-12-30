import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class GoogleCalendarStrategy {
  constructor(private readonly authService: AuthService) {}

  async checkCalendar(id: string) {
    const client = await this.authService.getGoogleClient();
    const calendar = google.calendar({ version: 'v3', auth: client });

    try {
      const res = await calendar.events.list({
        calendarId: id,
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
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
