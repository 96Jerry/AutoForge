import { Module } from '@nestjs/common';
import { CrawlController } from './crawl.controller';
import { CrawlService } from './crawl.service';
import { MealPlanModule } from '../models/meal-plan/meal-plan.module';
import { PuppeteerModule } from 'src/providers/puppeteer/puppeteer.module';

@Module({
  imports: [MealPlanModule, PuppeteerModule],
  controllers: [CrawlController],
  providers: [CrawlService],
  exports: [CrawlService],
})
export class CrawlModule {}
