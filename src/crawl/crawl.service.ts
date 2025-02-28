import { Injectable } from '@nestjs/common';

@Injectable()
export class CrawlService {
  async flexLogin() {
    const date = new Date();
    console.log(`Cron job is running...${date}`);
  }
}
