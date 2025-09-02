import { Injectable } from '@nestjs/common';
import { transformDate1, transformDate2 } from 'src/utils/date';
import { html } from '.';
import { GoogleStrategy } from './enums/google-strategy.enum';
import { GoogleCalendarStrategy } from './strategies/google.calendar.strategy';
import { GoogleMailStrategy } from './strategies/google.mail.strategy';
import { GoogleGeminiStrategy } from 'src/providers/google/strategies/google.gemini.strategy';

@Injectable()
export class GoogleService {
  constructor(
    private readonly googleMailStrategy: GoogleMailStrategy,
    private readonly googleCalendarStrategy: GoogleCalendarStrategy,
  ) {}

  private getStrategy(name: GoogleStrategy.Gemini): GoogleGeminiStrategy;
  private getStrategy(name: GoogleStrategy.Mail): GoogleMailStrategy;
  private getStrategy(name: GoogleStrategy.Calendar): GoogleCalendarStrategy;
  private getStrategy(name: GoogleStrategy) {
    if (name === GoogleStrategy.Mail) {
      return this.googleMailStrategy;
    } else if (name === GoogleStrategy.Calendar) {
      return this.googleCalendarStrategy;
    } else if (name === GoogleStrategy.Gemini) {
      return new GoogleGeminiStrategy();
    } else {
      throw new Error('Invalid strategy name');
    }
  }

  async sendVacationEmail(): Promise<void> {
    const today = new Date();
    console.log(`Cron Job is running...${today}`);

    const isHoliday = await this.checkHoliday(today);
    if (isHoliday) {
      console.log('휴일엔 작동하지 않습니다...');
      return;
    }

    const vacationDate = await this.getRecentVacationDate();
    if (!vacationDate) {
      console.log('휴가 없음');
      return;
    }

    const oneDay = 24 * 60 * 60 * 1000;
    let nextDay = new Date(today.getTime() + oneDay);

    const isNextDayHoliday = await this.checkHoliday(nextDay);
    while (isNextDayHoliday) {
      nextDay = new Date(nextDay.getTime() + oneDay);
    }

    if (nextDay.toISOString().slice(0, 10) !== vacationDate) {
      console.log('아직 때가 아닙니다...');
      return;
    }

    const date1 = transformDate1(vacationDate);
    const date2 = transformDate2(vacationDate);

    const emailData = {
      from: 'Jay Lim <jay@madsq.net>',
      to: 'junmate12@gmail.com',
      subject: `Personal Leave - Jay (${date1})`,
      html: html(date2),
    };

    const result = await this.getStrategy(GoogleStrategy.Mail).sendEmail(
      emailData,
    );

    console.log('Email sent', result);

    return;
  }

  private async checkHoliday(date: Date) {
    const isSaturday = date.getDay() === 6;
    const isSunday = date.getDay() === 0;
    const isPublicHoliday = await this.checkPublicHoliday(date);

    return isSaturday || isSunday || isPublicHoliday;
  }

  private async checkPublicHoliday(date: Date) {
    const publicHolidays = await this.getHolidays();

    return publicHolidays.includes(
      new Intl.DateTimeFormat('en-CA').format(date),
    );
  }

  private async getHolidays(): Promise<string[]> {
    const holidayEvents = await this.getStrategy(
      GoogleStrategy.Calendar,
    ).checkCalendar('en.south_korea#holiday@group.v.calendar.google.com');

    if (!holidayEvents || !holidayEvents.items || !holidayEvents.items.length) {
      throw new Error('Holiday events not found');
    }

    const holidays: string[] = [];
    for (const item of holidayEvents.items) {
      const description = item.description;
      const startDate = item.start?.date;

      if (!description || !startDate) continue;

      if (item.description === 'Public holiday') {
        holidays.push(startDate);
      }
    }

    return holidays;
  }

  private async getRecentVacationDate(): Promise<string> {
    const vacationEvents = await this.getStrategy(
      GoogleStrategy.Calendar,
    ).checkCalendar(
      'madsq.net_rdahdb3dsksr1p3jm93o63lbgs@group.calendar.google.com',
    );
    if (
      !vacationEvents ||
      !vacationEvents.items ||
      !vacationEvents.items.length
    ) {
      throw new Error('Vacation event not found');
    }

    let recentDate: string | undefined;
    for (const item of vacationEvents.items) {
      const summary = item.summary;
      const startDate = item.start?.date;
      if (!summary || !startDate) continue;

      if (summary.includes('Jay')) {
        recentDate = startDate;
        break;
      }
    }

    if (!recentDate) {
      throw new Error('Recent vacation date not found');
    }

    return recentDate;
  }

  async analyze(imagePath: string) {
    return this.getStrategy(GoogleStrategy.Gemini).analyze(imagePath);
  }
}
