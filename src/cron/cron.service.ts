import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CrawlService } from 'src/crawl/crawl.service';
import { DiscordService } from 'src/providers/discord/discord.service';
import { GoogleService } from 'src/providers/google/google.service';

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
      const allMealResults = await this.crawlService.getAllTodaysMealPics();

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

      await this.discordService.sendTodayMenu(allImageUrls, restaurantNames);
    } catch (error) {
      await this.discordService.sendMessage(
        `⚠️ 오늘의 메뉴를 가져오는 중 오류가 발생했습니다. (${error.message})`,
      );
    }
  }
}
