import { Controller, Post } from '@nestjs/common';
import { CrawlService } from './crawl.service';
import { ResponseSuccess } from 'src/common/dtos/success.dto';

@Controller('crawl')
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) {}

  @Post('todays-meal-all')
  async crawlAllTodaysMeals() {
    const result = await this.crawlService.getAllTodaysMealPics();
    return new ResponseSuccess(result);
  }
}
