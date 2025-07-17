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
        maxResults: 14,
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

  async createEvent(
    calendarId: string,
    eventData: {
      summary: string;
      description?: string;
      start: { dateTime: string; timeZone: string };
      end: { dateTime: string; timeZone: string };
    },
  ) {
    const client = await this.authService.getGoogleClient();
    const calendar = google.calendar({ version: 'v3', auth: client });

    try {
      const res = await calendar.events.insert({
        calendarId,
        requestBody: eventData,
      });

      console.log('이벤트 생성 성공:', res.data.summary);
      return res.data;
    } catch (err) {
      console.error('이벤트 생성 실패:', err.name, err.message);
      throw err;
    }
  }

  async updateEvent(
    calendarId: string,
    eventId: string,
    eventData: {
      summary: string;
      description?: string;
      start: { dateTime: string; timeZone: string };
      end: { dateTime: string; timeZone: string };
    },
  ) {
    const client = await this.authService.getGoogleClient();
    const calendar = google.calendar({ version: 'v3', auth: client });

    try {
      const res = await calendar.events.update({
        calendarId,
        eventId,
        requestBody: eventData,
      });

      console.log('이벤트 업데이트 성공:', res.data.summary);
      return res.data;
    } catch (err) {
      console.error('이벤트 업데이트 실패:', err.name, err.message);
      throw err;
    }
  }

  async findEventsByDateRange(
    calendarId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const client = await this.authService.getGoogleClient();
    const calendar = google.calendar({ version: 'v3', auth: client });

    try {
      const res = await calendar.events.list({
        calendarId,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return res.data.items || [];
    } catch (err) {
      console.error('이벤트 조회 실패:', err.name, err.message);
      throw err;
    }
  }

  async deleteEvent(calendarId: string, eventId: string) {
    const client = await this.authService.getGoogleClient();
    const calendar = google.calendar({ version: 'v3', auth: client });

    try {
      await calendar.events.delete({
        calendarId,
        eventId,
      });

      console.log('이벤트 삭제 성공:', eventId);
    } catch (err) {
      console.error('이벤트 삭제 실패:', err.name, err.message);
      throw err;
    }
  }
}
