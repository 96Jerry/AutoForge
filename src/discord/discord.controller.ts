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

  // /**
  //  * 오늘의 메뉴 테스트 (더 이상 사용되지 않음 - 크롤링 서비스를 통해 처리)
  //  */
  // @Post('test-today-menu')
  // async testTodayMenu() {
  //   try {
  //     await this.discordService.sendTodayMenu();
  //     return { success: true, message: '오늘의 메뉴 테스트 전송 완료' };
  //   } catch (error) {
  //     return { success: false, error: error.message };
  //   }
  // }

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
