import { Injectable } from '@nestjs/common';

@Injectable()
export class CrawlService {
  async flexLogin() {}

  /** 일주일 식단표 크롤링 */
  async getWeeklyMeal() {
    return '안녕';
  }
}
