import { Controller, Post, Get, Body } from '@nestjs/common';
import { DiscordService } from './discord.service';

@Controller('discord')
export class DiscordController {
  constructor(private readonly discordService: DiscordService) {}

  /**
   * 간단한 메시지 테스트
   */
  @Post('test-message')
  async testMessage(@Body('message') message: string) {
    try {
      await this.discordService.sendMessage(message || '테스트 메시지입니다!');
      return { success: true, message: 'Discord 메시지 전송 완료' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 임베드 메시지 테스트
   */
  @Post('test-embed')
  async testEmbed(
    @Body('title') title: string,
    @Body('description') description: string,
  ) {
    try {
      await this.discordService.sendEmbedMessage(
        title || '테스트 제목',
        description || '테스트 설명입니다.',
      );
      return { success: true, message: 'Discord 임베드 메시지 전송 완료' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 오늘의 메뉴 테스트
   */
  @Post('test-today-menu')
  async testTodayMenu() {
    try {
      const testMenu = `🍽️ **점심**
1코스: 김치찌개, 흰쌀밥
2코스: 제육볶음, 흰쌀밥
3코스: 생선구이, 흰쌀밥

🌙 **저녁**: 치킨까스, 돈까스`;

      await this.discordService.sendTodayMenu(testMenu);
      return { success: true, message: '오늘의 메뉴 테스트 전송 완료' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 주간 메뉴 테스트
   */
  @Post('test-weekly-menu')
  async testWeeklyMenu() {
    try {
      const testWeeklyMenu = `
**월요일**
🍽️ **점심**
1코스: 김치찌개, 흰쌀밥
2코스: 제육볶음, 흰쌀밥
3코스: 생선구이, 흰쌀밥
🌙 **저녁**: 치킨까스

**화요일**
🍽️ **점심**
1코스: 된장찌개, 흰쌀밥
2코스: 불고기, 흰쌀밥
3코스: 갈치조림, 흰쌀밥
🌙 **저녁**: 돈까스

**수요일**
🍽️ **점심**
1코스: 순두부찌개, 흰쌀밥
2코스: 닭볶음탕, 흰쌀밥
3코스: 고등어구이, 흰쌀밥
🌙 **저녁**: 함박스테이크`;

      await this.discordService.sendWeeklyMenu(testWeeklyMenu);
      return { success: true, message: '주간 메뉴 테스트 전송 완료' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Discord 연결 상태 확인
   */
  @Get('health')
  async healthCheck() {
    try {
      // 간단한 테스트 메시지 전송으로 연결 확인
      await this.discordService.sendMessage('🟢 Discord 연결 상태 확인 완료');
      return { success: true, message: 'Discord 연결 정상' };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Discord 연결 실패',
      };
    }
  }
}
