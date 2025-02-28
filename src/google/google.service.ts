import { Injectable } from '@nestjs/common';
import { transformDate1, transformDate2 } from 'src/utils/date';
import { html } from '.';
import { GoogleStrategy } from './enums/google-strategy.enum';
import { GoogleCalendarStrategy } from './strategies/google.calendar.strategy';
import { GoogleMailStrategy } from './strategies/google.mail.strategy';

@Injectable()
export class GoogleService {
  constructor(
    private readonly googleMailStrategy: GoogleMailStrategy,
    private readonly googleCalendarStrategy: GoogleCalendarStrategy,
  ) {}

  getStrategy(name: GoogleStrategy.Mail): GoogleMailStrategy;
  getStrategy(name: GoogleStrategy.Calendar): GoogleCalendarStrategy;

  getStrategy(name: GoogleStrategy) {
    if (name === GoogleStrategy.Mail) {
      return this.googleMailStrategy;
    } else if (name === GoogleStrategy.Calendar) {
      return this.googleCalendarStrategy;
    }
  }

  private async checkPublicHoliday(date: Date) {
    const publicHolidays = await this.getHolidays();

    return publicHolidays.includes(
      new Intl.DateTimeFormat('en-CA').format(date),
    );
  }

  private async checkHoliday(date: Date) {
    const isSaturday = date.getDay() === 6;
    const isSunday = date.getDay() === 0;
    const isPublicHoliday = await this.checkPublicHoliday(date);

    return isSaturday || isSunday || isPublicHoliday;
  }

  async sendVacationEmail() {
    const today = new Date();
    console.log(`Cron Job is running...${today}`);

    const isHoliday = await this.checkHoliday(today);
    if (isHoliday) {
      console.log('휴일엔 작동하지 않습니다...');
      return '휴일엔 작동하지 않습니다...';
    }

    const vacationDate = await this.getRecentVacationDate();
    if (!vacationDate) {
      console.log('휴가 없음');
      return '휴가 없음';
    }

    const oneDay = 24 * 60 * 60 * 1000;
    let nextDay = new Date(today.getTime() + oneDay);

    const isNextDayHoliday = await this.checkHoliday(nextDay);
    while (isNextDayHoliday) {
      nextDay = new Date(nextDay.getTime() + oneDay);
    }

    if (nextDay.toISOString().slice(0, 10) !== vacationDate) {
      console.log('아직 때가 아닙니다...');
      return '아직 때가 아닙니다...';
    }

    const date1 = transformDate2(vacationDate);
    const date2 = transformDate1(vacationDate);

    const emailData = {
      from: 'Jay Lim <jay@madsq.net>',
      to: 'junmate12@gmail.com',
      subject: `Personal Leave - Jay (${date1})`,
      html: html(date2),
    };

    const result = await this.getStrategy(GoogleStrategy.Mail).sendEmail(
      emailData,
    );

    console.log('Email sent');
    return result;
  }

  private async getHolidays() {
    const holidayEvent = await this.getStrategy(
      GoogleStrategy.Calendar,
    ).checkCalendar('en.south_korea#holiday@group.v.calendar.google.com');

    const holidays = [];
    for (const item of holidayEvent.items) {
      if (item.description === 'Public holiday') {
        holidays.push(item.start.date);
      }
    }

    return holidays;
  }

  private async getRecentVacationDate() {
    const vacationEvent = await this.getStrategy(
      GoogleStrategy.Calendar,
    ).checkCalendar(
      'madsq.net_rdahdb3dsksr1p3jm93o63lbgs@group.calendar.google.com',
    );

    let date: string = null;
    for (const item of vacationEvent.items) {
      if (item.summary.includes('Jay')) {
        date = item.start.date;
        break;
      }
    }

    return date;
  }
}
