import { Injectable } from '@nestjs/common';
import { transformDate1, transformDate2 } from 'src/utils/date';
import { html } from '.';
import { GoogleStrategy } from './enums/google-strategy.enum';
import { GoogleCalendarStrategy } from './strategies/google.calendar.strategy';
import { GoogleMailStrategy } from './strategies/google.mail.strategy';
import {
  GoogleGeminiStrategy,
  WeeklyMenu,
} from 'src/google/strategies/google.gemini.strategy';

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

  private async getRecentVacationDate(): Promise<string> {
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

  async updateWeeklyCalender(
    weeklyMenu: WeeklyMenu,
    calendarId: string,
    weekStartDate?: Date,
  ) {
    console.log('🍽️  주간 식단 캘린더 업데이트 시작...');

    try {
      // 주의 시작 날짜 계산 (월요일 기준)
      const startDate = weekStartDate || this.getMondayOfCurrentWeek();

      // 주간 범위 계산 (월요일 ~ 금요일)
      const weekEndDate = new Date(startDate);
      weekEndDate.setDate(startDate.getDate() + 6); // 일요일까지

      console.log(
        `📅 주간 범위: ${startDate.toISOString().slice(0, 10)} ~ ${weekEndDate.toISOString().slice(0, 10)}`,
      );

      // 기존 식단 이벤트 삭제
      await this.deleteExistingMenuEvents(calendarId, startDate, weekEndDate);

      const dayMap = {
        monday: 0,
        tuesday: 1,
        wednesday: 2,
        thursday: 3,
        friday: 4,
      };

      let createdEvents = 0;

      // 각 요일별로 식단 이벤트 생성
      for (const [dayName, dayMenu] of Object.entries(weeklyMenu)) {
        if (!dayMenu || !dayMap.hasOwnProperty(dayName)) continue;

        const dayOffset = dayMap[dayName];
        const eventDate = new Date(startDate);
        eventDate.setDate(startDate.getDate() + dayOffset);

        const dayNameKr = this.getDayNameInKorean(dayName);

        // 점심 이벤트 생성
        if (dayMenu.lunch) {
          const lunchSummary = `🥗 ${dayNameKr} 점심 - 식단표`;
          const lunchDescription = this.formatLunchDescription(dayMenu.lunch);

          await this.createMealEvent(
            calendarId,
            eventDate,
            lunchSummary,
            lunchDescription,
            12, // 12시
            13, // 13시
          );
          createdEvents++;
        }

        // 저녁 이벤트 생성
        if (dayMenu.dinner) {
          const dinnerSummary = `🍽️ ${dayNameKr} 저녁 - 식단표`;
          const dinnerDescription = `메뉴: ${dayMenu.dinner}`;

          await this.createMealEvent(
            calendarId,
            eventDate,
            dinnerSummary,
            dinnerDescription,
            18, // 18시
            19, // 19시
          );
          createdEvents++;
        }
      }

      console.log(
        `✅ 주간 식단 캘린더 업데이트 완료! (${createdEvents}개 이벤트 생성)`,
      );
      return { success: true, createdEvents };
    } catch (error) {
      console.error('❌ 주간 식단 캘린더 업데이트 실패:', error);
      throw error;
    }
  }

  private getMondayOfCurrentWeek(): Date {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // 월요일 계산
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  private async deleteExistingMenuEvents(
    calendarId: string,
    startDate: Date,
    endDate: Date,
  ) {
    console.log('🗑️  기존 식단 이벤트 삭제 중...');

    const events = await this.getStrategy(
      GoogleStrategy.Calendar,
    ).findEventsByDateRange(calendarId, startDate, endDate);

    let deletedCount = 0;
    for (const event of events) {
      if (event.summary && event.summary.includes('식단표')) {
        await this.getStrategy(GoogleStrategy.Calendar).deleteEvent(
          calendarId,
          event.id,
        );
        deletedCount++;
      }
    }

    console.log(`🗑️  기존 식단 이벤트 ${deletedCount}개 삭제 완료`);
  }

  private async createMealEvent(
    calendarId: string,
    date: Date,
    summary: string,
    description: string,
    startHour: number,
    endHour: number,
  ) {
    const startTime = new Date(date);
    startTime.setHours(startHour, 0, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, 0, 0, 0);

    const eventData = {
      summary,
      description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'Asia/Seoul',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Asia/Seoul',
      },
    };

    await this.getStrategy(GoogleStrategy.Calendar).createEvent(
      calendarId,
      eventData,
    );
  }

  private formatLunchDescription(lunch: {
    course1: string;
    course2: string;
    course3: string;
  }): string {
    return `코스 1: ${lunch.course1}\n코스 2: ${lunch.course2}\n코스 3: ${lunch.course3}`;
  }

  private getDayNameInKorean(dayName: string): string {
    const dayMap = {
      monday: '월요일',
      tuesday: '화요일',
      wednesday: '수요일',
      thursday: '목요일',
      friday: '금요일',
    };
    return dayMap[dayName] || dayName;
  }

  async analyze(imagePath: string) {
    return this.getStrategy(GoogleStrategy.Gemini).analyze(imagePath);
  }
}
