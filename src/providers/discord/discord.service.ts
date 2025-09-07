import { Injectable } from '@nestjs/common';
import { WebhookClient, EmbedBuilder } from 'discord.js';
import { DISCORD_WEBHOOK_URL } from 'config';

@Injectable()
export class DiscordService {
  private readonly webhookClient: WebhookClient;

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
    files?: { attachment: string; name: string }[],
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
        files,
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
  async sendTodayMenu(
    imageUrls: string[],
    restaurantNames?: string[],
  ): Promise<void> {
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

      let content = `🌅 좋은 아침입니다! 오늘의 메뉴를 알려드립니다. (${dayName})`;

      if (restaurantNames && restaurantNames.length > 0) {
        content += `\n📋 제공 식당: ${restaurantNames.join(', ')}`;
      }

      await this.webhookClient.send({
        content,
        files: imageUrls.map((url) => ({
          attachment: url,
          name: url.split('/').pop(),
        })),
      });
      console.log('오늘의 메뉴 디스코드 전송 완료');
    } catch (error) {
      console.error('오늘의 메뉴 디스코드 전송 실패:', error);
      throw new Error(`오늘의 메뉴 디스코드 전송 실패: ${error.message}`);
    }
  }
}
