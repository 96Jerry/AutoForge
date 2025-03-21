import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { exec } from 'child_process';
import * as notifier from 'node-notifier';
import { CrawlService } from 'src/crawl/crawl.service';
import { GoogleService } from 'src/google/google.service';

@Injectable()
export class CronService {
  constructor(
    private readonly googleService: GoogleService,
    private readonly crawlService: CrawlService,
  ) {}

  // 매일 | 8시 | 월~금
  @Cron('0 0 9 * * 1-5')
  async flexLogin(): Promise<void> {
    return this.crawlService.flexLogin();
  }

  // 매일 | 9시
  @Cron('0 * 9 * * *')
  async sendVacationEmail(): Promise<void> {
    return this.googleService.sendVacationEmail();
  }

  // 매주 | 월~금 | 9~12시,14~17시 | 정각
  @Cron('0 0 9-12,14-17 * * 1-5')
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

  // 매주 | 월~금 | 9시,14시 | 정각
  @Cron('0 0 9,14 * * 1-5')
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
}
