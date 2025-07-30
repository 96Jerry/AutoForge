import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CrawlService } from 'src/crawl/crawl.service';
import { DiscordService } from 'src/discord/discord.service';
import { GoogleService } from 'src/google/google.service';

@Injectable()
export class CronService {
  constructor(
    private readonly googleService: GoogleService,
    private readonly crawlService: CrawlService,
    private readonly discordService: DiscordService,
  ) {}

  @Cron('0 * 9 * * *') // 매일 | 9시
  async sendVacationEmail(): Promise<void> {
    return this.googleService.sendVacationEmail();
  }

  /**
   * 매일 점심 11시 30분에 오늘의 메뉴를 Discord로 전송.
   */
  @Cron('0 30 11 * * 1-5') // 매일 | 월~금 | 11시 30분 | 정각
  async sendTodayMenuToDiscord(): Promise<void> {
    try {
      console.log('오늘의 메뉴 Discord 전송 시작...');

      // 모든 식당의 식단표 크롤링
      const allMealResults = await this.crawlService.getAllTodaysMealPics();

      // 모든 이미지 URL 수집
      const allImageUrls: string[] = [];
      const restaurantNames: string[] = [];

      for (const [restaurantName, imageUrls] of Object.entries(
        allMealResults,
      )) {
        if (imageUrls.length > 0) {
          allImageUrls.push(...imageUrls);
          restaurantNames.push(restaurantName);
        }
      }

      if (allImageUrls.length === 0) {
        throw new Error('크롤링된 이미지가 없습니다.');
      }

      // Discord로 오늘의 메뉴 전송
      await this.discordService.sendTodayMenu(allImageUrls, restaurantNames);

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
}
