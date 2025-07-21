import { Controller, Get, Post } from '@nestjs/common';
import { CrawlService } from './crawl.service';

@Controller('crawl')
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) {}

  @Post('weekly-meal')
  async crawlWeeklyMeal() {
    try {
      const result = await this.crawlService.getWeeklyMeal();
      return {
        success: true,
        message: '식단표 크롤링 및 저장이 완료되었습니다.',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: '식단표 크롤링 중 오류가 발생했습니다.',
        error: error.message,
      };
    }
  }

  @Get('saved-meal-plans')
  async getSavedMealPlans() {
    try {
      const mealPlans = await this.crawlService.getSavedMealPlans();
      return {
        success: true,
        data: mealPlans,
      };
    } catch (error) {
      return {
        success: false,
        message: '저장된 식단표 조회 중 오류가 발생했습니다.',
        error: error.message,
      };
    }
  }

  @Get('current-week')
  async getCurrentWeekMealPlan() {
    try {
      const mealPlan = await this.crawlService.getCurrentWeekMealPlan();
      return {
        success: true,
        data: mealPlan,
      };
    } catch (error) {
      return {
        success: false,
        message: '현재 주 식단표 조회 중 오류가 발생했습니다.',
        error: error.message,
      };
    }
  }

  @Post('cleanup')
  async cleanupTempFiles() {
    try {
      await this.crawlService.cleanupTempFiles();
      return {
        success: true,
        message: '임시 파일 정리가 완료되었습니다.',
      };
    } catch (error) {
      return {
        success: false,
        message: '임시 파일 정리 중 오류가 발생했습니다.',
        error: error.message,
      };
    }
  }
}
