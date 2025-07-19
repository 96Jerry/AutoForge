import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { exec } from 'child_process';
import { GOOGLE_CALENDAR_ID } from 'config';
import * as notifier from 'node-notifier';
import { CrawlService } from 'src/crawl/crawl.service';
import { DiscordService } from 'src/discord/discord.service';
import { GoogleService } from 'src/google/google.service';
import { WeeklyMenu } from 'src/google/strategies/google.gemini.strategy';

@Injectable()
export class CronService {
  constructor(
    private readonly googleService: GoogleService,
    private readonly crawlService: CrawlService,
    private readonly discordService: DiscordService,
  ) {}

  /**
   * WeeklyMenu 객체를 읽기 쉬운 문자열로 변환
   */
  private formatWeeklyMenuToString(weeklyMenu: WeeklyMenu): string {
    if (!weeklyMenu) {
      return '식단 정보를 찾을 수 없습니다.';
    }

    const days = [
      { key: 'monday', name: '월요일' },
      { key: 'tuesday', name: '화요일' },
      { key: 'wednesday', name: '수요일' },
      { key: 'thursday', name: '목요일' },
      { key: 'friday', name: '금요일' },
    ];

    let result = '';

    for (const day of days) {
      const dayMenu = weeklyMenu[day.key as keyof WeeklyMenu];
      if (dayMenu) {
        result += `\n**${day.name}**\n`;

        if (dayMenu.lunch) {
          result += `🍽️ **점심**\n`;
          if (dayMenu.lunch.course1)
            result += `1코스: ${dayMenu.lunch.course1}\n`;
          if (dayMenu.lunch.course2)
            result += `2코스: ${dayMenu.lunch.course2}\n`;
          if (dayMenu.lunch.course3)
            result += `3코스: ${dayMenu.lunch.course3}\n`;
        }

        if (dayMenu.dinner) {
          result += `🌙 **저녁**: ${dayMenu.dinner}\n`;
        }

        result += '\n';
      }
    }

    return result || '식단 정보가 없습니다.';
  }

  /**
   * 오늘의 메뉴만 추출
   */
  private getTodayMenuFromWeekly(weeklyMenu: WeeklyMenu): string {
    if (!weeklyMenu) {
      return '오늘의 메뉴 정보를 찾을 수 없습니다.';
    }

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: 일요일, 1: 월요일, ...

    const dayKeys = [
      '',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
    ];
    const dayNames = [
      '일요일',
      '월요일',
      '화요일',
      '수요일',
      '목요일',
      '금요일',
      '토요일',
    ];

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return '주말에는 식당이 운영되지 않습니다.';
    }

    const todayKey = dayKeys[dayOfWeek] as keyof WeeklyMenu;
    const todayMenu = weeklyMenu[todayKey];

    if (!todayMenu) {
      return `${dayNames[dayOfWeek]}의 메뉴 정보를 찾을 수 없습니다.`;
    }

    let result = '';

    if (todayMenu.lunch) {
      result += `🍽️ **점심**\n`;
      if (todayMenu.lunch.course1)
        result += `1코스: ${todayMenu.lunch.course1}\n`;
      if (todayMenu.lunch.course2)
        result += `2코스: ${todayMenu.lunch.course2}\n`;
      if (todayMenu.lunch.course3)
        result += `3코스: ${todayMenu.lunch.course3}\n`;
    }

    if (todayMenu.dinner) {
      result += `🌙 **저녁**: ${todayMenu.dinner}\n`;
    }

    return result || '오늘의 메뉴 정보가 없습니다.';
  }

  @Cron('0 0 9 * * 1-5') // 매일 | 8시 | 월~금
  async flexLogin(): Promise<void> {
    return this.crawlService.flexLogin();
  }

  @Cron('0 * 9 * * *') // 매일 | 9시
  async sendVacationEmail(): Promise<void> {
    return this.googleService.sendVacationEmail();
  }

  @Cron('0 0 9-12,14-17 * * 1-5') // 매주 | 월~금 | 9~12시,14~17시 | 정각
  async alarmCheckDiscordEveryHour(): Promise<void> {
    notifier.notify(
      {
        title: '커스텀 알람',
        message: '디스코드 알림 확인 필요!',
        closeLabel: '닫기',
        wait: true,
        timeout: 3600,
      },
      function (err, res, meta) {
        console.log(res, meta);
      },
    );

    notifier.on('click', () => {
      exec('open /Applications/Discord.app', (err) => {
        if (err) {
          console.error(err);
          return;
        }

        console.log('App opened');
      });
    });
  }

  @Cron('0 0 9,14 * * 1-5') // 매주 | 월~금 | 9시,14시 | 정각
  async alarmCheckEmailTwiceADay(): Promise<void> {
    notifier.notify(
      {
        title: '커스텀 알람',
        message: '이메일 확인 필요!',
        closeLabel: '닫기',
        timeout: 3600,
      },
      function (err, res, meta) {
        console.log(res, meta);
      },
    );
  }

  /**
   * 일주일 식단표 -> 구글 캘린더 업데이트 (알림 설정). 일주일치 식단표 매일 확인하기 귀찮아서.
   * - 식단표 크롤링
   * - 식단표 분석
   * - 캘린더 업데이트
   */
  @Cron('0 0 11 * * 1') // 매주 | 월 | 11시 | 정각
  async updateGoogleCalendarWithWeeklyMeal() {
    // 식단표 크롤링
    const weeklyMealImage = await this.crawlService.getWeeklyMeal();

    // 식단표 분석
    const data = await this.googleService.analyze(weeklyMealImage);

    // 캘린더 업데이트
    await this.googleService.updateWeeklyCalender(data, GOOGLE_CALENDAR_ID);
  }

  /**
   * 매일 아침 8시에 오늘의 메뉴를 Discord로 전송
   */
  @Cron('0 0 8 * * 1-5') // 매일 | 월~금 | 8시 | 정각
  async sendTodayMenuToDiscord(): Promise<void> {
    try {
      console.log('오늘의 메뉴 Discord 전송 시작...');

      // 식단표 크롤링
      const weeklyMealImage = await this.crawlService.getWeeklyMeal();

      // 식단표 분석
      const weeklyMenuData = await this.googleService.analyze(weeklyMealImage);

      // 오늘의 메뉴 추출
      const todayMenu = this.getTodayMenuFromWeekly(weeklyMenuData);

      // Discord로 오늘의 메뉴 전송
      await this.discordService.sendTodayMenu(todayMenu);

      console.log('오늘의 메뉴 Discord 전송 완료');
    } catch (error) {
      console.error('오늘의 메뉴 Discord 전송 중 오류 발생:', error);

      // 오류 발생 시 간단한 메시지라도 전송
      try {
        await this.discordService.sendMessage(
          '⚠️ 오늘의 메뉴를 가져오는 중 오류가 발생했습니다. 나중에 다시 시도해주세요.',
        );
      } catch (discordError) {
        console.error('Discord 오류 메시지 전송 실패:', discordError);
      }
    }
  }

  /**
   * 매주 월요일 아침 8시에 주간 메뉴를 Discord로 전송
   */
  @Cron('0 30 8 * * 1') // 매주 | 월 | 8시 30분 | 정각
  async sendWeeklyMenuToDiscord(): Promise<void> {
    try {
      console.log('주간 식단표 Discord 전송 시작...');

      // 식단표 크롤링
      const weeklyMealImage = await this.crawlService.getWeeklyMeal();

      // 식단표 분석
      const weeklyMenuData = await this.googleService.analyze(weeklyMealImage);

      // 주간 메뉴를 문자열로 변환
      const menuString = this.formatWeeklyMenuToString(weeklyMenuData);

      // Discord로 주간 식단표 전송
      await this.discordService.sendWeeklyMenu(menuString);

      console.log('주간 식단표 Discord 전송 완료');
    } catch (error) {
      console.error('주간 식단표 Discord 전송 중 오류 발생:', error);

      // 오류 발생 시 간단한 메시지라도 전송
      try {
        await this.discordService.sendMessage(
          '⚠️ 주간 식단표를 가져오는 중 오류가 발생했습니다. 나중에 다시 시도해주세요.',
        );
      } catch (discordError) {
        console.error('Discord 오류 메시지 전송 실패:', discordError);
      }
    }
  }
}
