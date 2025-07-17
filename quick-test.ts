import { CrawlService } from './src/crawl/crawl.service';

// 빠른 테스트 함수
async function quickTest() {
  const crawlService = new CrawlService();

  try {
    console.log('🚀 빠른 테스트 시작...');
    const result = await crawlService.getWeeklyMeal();
    console.log('✅ 성공:', result);
  } catch (error) {
    console.error('❌ 실패:', error.message);
  }
}

quickTest();
