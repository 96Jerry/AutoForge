import { Injectable } from '@nestjs/common';

@Injectable()
export class CrawlService {
  // 매분 0초
  // @Cron('0 * * * * *')
  async flexLogin() {
    const date = new Date();
    console.log(`Cron job is running...${date}`);
  }
}
