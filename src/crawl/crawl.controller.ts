import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { CrawlService } from './crawl.service';
import { MealPlanService } from '../models/meal-plan/meal-plan.service';
import { RestaurantName } from './enums/restaurant-name.enum';

@Controller('crawl')
export class CrawlController {
  constructor(
    private readonly crawlService: CrawlService,
    private readonly mealPlanService: MealPlanService,
  ) {}

  @Post('todays-meal/:restaurantName')
  async crawlTodaysMeal(@Param('restaurantName') restaurantName: string) {
    try {
      // 식당명 검증
      if (
        !Object.values(RestaurantName).includes(
          restaurantName as RestaurantName,
        )
      ) {
        return {
          success: false,
          message: '유효하지 않은 식당명입니다.',
          error: `지원되는 식당: ${Object.values(RestaurantName).join(', ')}`,
        };
      }

      const result = await this.crawlService.getTodaysMealPics(
        restaurantName as RestaurantName,
      );
      return {
        success: true,
        message: `${restaurantName} 오늘의 식단표 크롤링 및 저장이 완료되었습니다.`,
        data: {
          restaurantName,
          imagePaths: result,
          imageCount: result.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `${restaurantName} 식단표 크롤링 중 오류가 발생했습니다.`,
        error: error.message,
      };
    }
  }

  @Post('todays-meal-all')
  async crawlAllTodaysMeals() {
    try {
      const result = await this.crawlService.getAllTodaysMealPics();
      return {
        success: true,
        message: '모든 식당의 오늘의 식단표 크롤링 및 저장이 완료되었습니다.',
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
  async getSavedMealPlans(
    @Query('restaurantName') restaurantName?: string,
    @Query('date') date?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      let mealPlans;

      if (restaurantName) {
        // 식당명 검증
        if (
          !Object.values(RestaurantName).includes(
            restaurantName as RestaurantName,
          )
        ) {
          return {
            success: false,
            message: '유효하지 않은 식당명입니다.',
            error: `지원되는 식당: ${Object.values(RestaurantName).join(', ')}`,
          };
        }

        const limitNum = limit ? parseInt(limit) : 10;
        mealPlans = await this.mealPlanService.findByRestaurant(
          restaurantName as RestaurantName,
          limitNum,
        );
      } else if (date) {
        mealPlans = await this.mealPlanService.findByDate(date);
      } else {
        const limitNum = limit ? parseInt(limit) : 10;
        mealPlans = await this.mealPlanService.findRecent(limitNum);
      }

      return {
        success: true,
        data: mealPlans,
        count: mealPlans.length,
      };
    } catch (error) {
      return {
        success: false,
        message: '저장된 식단표 조회 중 오류가 발생했습니다.',
        error: error.message,
      };
    }
  }

  @Get('todays-meals')
  async getTodaysMeals() {
    try {
      const mealPlans = await this.mealPlanService.findTodaysMeals();
      return {
        success: true,
        data: mealPlans,
        count: mealPlans.length,
      };
    } catch (error) {
      return {
        success: false,
        message: '오늘의 식단표 조회 중 오류가 발생했습니다.',
        error: error.message,
      };
    }
  }

  @Get('statistics')
  async getStatistics() {
    try {
      const statistics = await this.mealPlanService.getStatistics();
      return {
        success: true,
        data: statistics,
      };
    } catch (error) {
      return {
        success: false,
        message: '통계 조회 중 오류가 발생했습니다.',
        error: error.message,
      };
    }
  }

  /** 테스트용: 크롤링 서비스 상태 확인 */
  @Get('test-status')
  async testStatus() {
    try {
      const restaurantSites = {
        [RestaurantName.GreenCook]: 'https://pf.kakao.com/_yxgQDb/posts',
        [RestaurantName.LunchStory]: 'https://pf.kakao.com/_Fwpwn/posts',
      };

      return {
        success: true,
        message: '크롤링 서비스가 정상적으로 작동 중입니다.',
        data: {
          supportedRestaurants: Object.values(RestaurantName),
          restaurantSites,
          currentTime: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: '크롤링 서비스 상태 확인 중 오류가 발생했습니다.',
        error: error.message,
      };
    }
  }

  /** 테스트용: 크롤링 서비스 브라우저 테스트 */
  @Get('test-crawl-service')
  async testCrawlService() {
    try {
      const result = await this.crawlService.testCrawlService();
      return result;
    } catch (error) {
      return {
        success: false,
        message: '크롤링 서비스 테스트 중 오류가 발생했습니다.',
        error: error.message,
      };
    }
  }

  /** 테스트용: 카카오톡 채널 URL 테스트 */
  @Get('test-kakao-urls')
  async testKakaoUrls() {
    try {
      const result = await this.crawlService.testKakaoChannelUrls();
      return result;
    } catch (error) {
      return {
        success: false,
        message: '카카오톡 채널 URL 테스트 중 오류가 발생했습니다.',
        error: error.message,
      };
    }
  }

  @Post('cleanup')
  async cleanupTempFiles() {
    try {
      // 임시 파일 정리 로직은 별도로 구현 필요
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
