import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as notifier from 'node-notifier';
import { GoogleService } from 'src/google/google.service';

@Injectable()
export class CronService {
  constructor(private readonly googleService: GoogleService) {}

  // 매일 9시
  @Cron('0 0 9 * * *')
  async sendVacationEmail() {
    this.googleService.sendVacationEmail();
  }

  // 매주 월~금, 9시 ~ 18시 매 시간 정각 마다
  @Cron('0 0 9-18 * * 1-5')
  async alarmCheckDiscordEveryHour() {
    notifier.notify(
      {
        title: '커스텀 알람',
        message: '디스코드 알림 확인 필요!',
        closeLabel: '닫기',
        timeout: 3600,
      },
      function (err, res, meta) {
        console.log(res, meta);
      },
    );
  }

  // 매주 월~금, 9시, 14시 정각 마다
  @Cron('0 0 9,14 * * 1-5')
  async alarmCheckEmailTwiceADay() {
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
}
