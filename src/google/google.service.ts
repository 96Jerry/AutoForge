import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
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

  // 매일 09:00 시
  @Cron('0 0 9 * * *')
  async sendVacationEmail() {
    const today = new Date();
    console.log(`Cron Job is running...${today}`);

    const holidays = await this.getHolidays();

    if (
      today.getDay() === 6 ||
      today.getDay() === 0 ||
      holidays.includes(new Intl.DateTimeFormat('en-CA').format(today))
    ) {
      console.log('휴일엔 작동하지 않습니다...');
      return '휴일엔 작동하지 않습니다...';
    }

    const vacationDate = await this.getRecentVacationDate();
    if (!vacationDate) {
      console.log('휴가 없음');
      return '휴가 없음';
    }

    let nextDay = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    // 토요일, 일요일, 공휴일
    while (
      nextDay.getDay() === 6 ||
      nextDay.getDay() === 0 ||
      holidays.includes(new Intl.DateTimeFormat('en-CA').format(nextDay))
    ) {
      nextDay = new Date(nextDay.getTime() + 24 * 60 * 60 * 1000);
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
