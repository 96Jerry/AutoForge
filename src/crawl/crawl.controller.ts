import { Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { promises as fs } from 'fs';
import { CrawlService } from './crawl.service';

@Controller('crawl')
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) {}

  @Get('test')
  async testCrawling(@Res() res: Response) {
    try {
      console.log('=== API를 통한 크롤링 테스트 시작 ===');

      const startTime = Date.now();
      const imagePath = await this.crawlService.getWeeklyMeal();
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      const stats = await fs.stat(imagePath);

      return res.json({
        success: true,
        message: '크롤링 성공',
        data: {
          imagePath,
          duration: `${duration}초`,
          fileSize: `${(stats.size / 1024).toFixed(2)} KB`,
        },
      });
    } catch (error) {
      console.error('크롤링 실패:', error);
      return res.status(500).json({
        success: false,
        message: '크롤링 실패',
        error: error.message,
      });
    }
  }

  @Post('cleanup')
  async cleanupTempFiles(@Res() res: Response) {
    try {
      await this.crawlService.cleanupTempFiles();
      return res.json({
        success: true,
        message: '임시 파일 정리 완료',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: '임시 파일 정리 실패',
        error: error.message,
      });
    }
  }
}
