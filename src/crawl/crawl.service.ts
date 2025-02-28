import { Injectable } from '@nestjs/common';

@Injectable()
export class CrawlService {
  async flexLogin() {
    const date = new Date();
    console.log(`Cron job is running...${date}`);

    // 컴퓨터가 켜질 때,시작
  }
}
