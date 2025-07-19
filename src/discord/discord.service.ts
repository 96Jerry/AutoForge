import { Injectable } from '@nestjs/common';
import { WebhookClient, EmbedBuilder } from 'discord.js';
import { DISCORD_WEBHOOK_URL } from 'config';

@Injectable()
export class DiscordService {
  private webhookClient: WebhookClient;

  constructor() {
    if (!DISCORD_WEBHOOK_URL) {
      throw new Error(
        'DISCORD_WEBHOOK_URL is not set in environment variables',
      );
    }
    this.webhookClient = new WebhookClient({ url: DISCORD_WEBHOOK_URL });
  }

  /**
   * 디스코드 채널에 일반 메시지 전송
   */
  async sendMessage(content: string): Promise<void> {
    try {
      await this.webhookClient.send({
        content,
        username: '식단표 봇',
        avatarURL: 'https://example.com/bot-avatar.png', // 필요시 봇 아바타 URL로 변경
      });
      console.log('디스코드 메시지 전송 완료');
    } catch (error) {
      console.error('디스코드 메시지 전송 실패:', error);
      throw new Error(`디스코드 메시지 전송 실패: ${error.message}`);
    }
  }

  /**
   * 디스코드 채널에 임베드 메시지 전송 (더 예쁜 형태)
   */
  async sendEmbedMessage(
    title: string,
    description: string,
    color?: number,
  ): Promise<void> {
    try {
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color || 0x0099ff) // 기본 파란색
        .setTimestamp()
        .setFooter({ text: '식단표 알림 봇' });

      await this.webhookClient.send({
        embeds: [embed],
        username: '식단표 봇',
        avatarURL: 'https://example.com/bot-avatar.png', // 필요시 봇 아바타 URL로 변경
      });
      console.log('디스코드 임베드 메시지 전송 완료');
    } catch (error) {
      console.error('디스코드 임베드 메시지 전송 실패:', error);
      throw new Error(`디스코드 임베드 메시지 전송 실패: ${error.message}`);
    }
  }

  /**
   * 오늘의 메뉴를 디스코드로 전송
   */
  async sendTodayMenu(menuData: string): Promise<void> {
    try {
      const today = new Date();
      const dayNames = [
        '일요일',
        '월요일',
        '화요일',
        '수요일',
        '목요일',
        '금요일',
        '토요일',
      ];
      const dayName = dayNames[today.getDay()];
      const dateStr = today.toLocaleDateString('ko-KR');

      const embed = new EmbedBuilder()
        .setTitle(`🍽️ 오늘의 메뉴 (${dayName})`)
        .setDescription(menuData)
        .setColor(0x00ff00) // 초록색
        .setTimestamp()
        .setFooter({ text: `${dateStr} 식단표 알림` });

      await this.webhookClient.send({
        content: '🌅 좋은 아침입니다! 오늘의 메뉴를 알려드립니다.',
        embeds: [embed],
        username: '식단표 봇',
        avatarURL: 'https://example.com/bot-avatar.png',
      });
      console.log('오늘의 메뉴 디스코드 전송 완료');
    } catch (error) {
      console.error('오늘의 메뉴 디스코드 전송 실패:', error);
      throw new Error(`오늘의 메뉴 디스코드 전송 실패: ${error.message}`);
    }
  }

  /**
   * 주간 메뉴를 디스코드로 전송
   */
  async sendWeeklyMenu(menuData: string): Promise<void> {
    try {
      const today = new Date();
      const dateStr = today.toLocaleDateString('ko-KR');

      const embed = new EmbedBuilder()
        .setTitle('📅 이번 주 식단표')
        .setDescription(menuData)
        .setColor(0xff9900) // 주황색
        .setTimestamp()
        .setFooter({ text: `${dateStr} 주간 식단표` });

      await this.webhookClient.send({
        content: '📋 이번 주 식단표를 공유합니다!',
        embeds: [embed],
        username: '식단표 봇',
        avatarURL: 'https://example.com/bot-avatar.png',
      });
      console.log('주간 식단표 디스코드 전송 완료');
    } catch (error) {
      console.error('주간 식단표 디스코드 전송 실패:', error);
      throw new Error(`주간 식단표 디스코드 전송 실패: ${error.message}`);
    }
  }
}
