import { Controller, Post } from '@nestjs/common';
import { CronService } from './cron.service';

@Controller('cron')
export class CronController {
  constructor(private readonly cronService: CronService) {}

  /**
   * 휴가 이메일 전송 테스트
   */
  @Post('test-vacation-email')
  async testVacationEmail() {
    try {
      await this.cronService.sendVacationEmail();
      return {
        success: true,
        message: '휴가 이메일 전송 테스트가 완료되었습니다.',
      };
    } catch (error) {
      return {
        success: false,
        message: '휴가 이메일 전송 테스트 중 오류가 발생했습니다.',
        error: error.message,
      };
    }
  }

  /**
   * 오늘의 메뉴 Discord 전송 테스트
   */
  @Post('test-today-menu-discord')
  async testTodayMenuToDiscord() {
    try {
      await this.cronService.sendTodayMenuToDiscord();
      return {
        success: true,
        message: '오늘의 메뉴 Discord 전송 테스트가 완료되었습니다.',
      };
    } catch (error) {
      return {
        success: false,
        message: '오늘의 메뉴 Discord 전송 테스트 중 오류가 발생했습니다.',
        error: error.message,
      };
    }
  }

  /**
   * 전체 크롤링 및 Discord 전송 테스트
   */
  @Post('test-full-pipeline')
  async testFullPipeline() {
    try {
      console.log('전체 파이프라인 테스트 시작...');

      // 1단계: 크롤링
      console.log('1단계: 크롤링 시작...');
      const allMealResults =
        await this.cronService['crawlService'].getAllTodaysMealPics();
      console.log('크롤링 결과:', allMealResults);

      // 2단계: Discord 전송
      console.log('2단계: Discord 전송 시작...');
      await this.cronService.sendTodayMenuToDiscord();

      return {
        success: true,
        message: '전체 파이프라인 테스트가 완료되었습니다.',
        data: {
          crawlResults: allMealResults,
          discordSent: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: '전체 파이프라인 테스트 중 오류가 발생했습니다.',
        error: error.message,
      };
    }
  }
}
