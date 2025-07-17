import { CrawlService } from './src/crawl/crawl.service';
import { promises as fs } from 'fs';

async function testCrawling() {
  console.log('=== 식단표 크롤링 테스트 시작 ===');

  const crawlService = new CrawlService();

  try {
    console.log('환경 변수 확인:');
    console.log('MENU_SITE_URL:', process.env.MENU_SITE_URL);

    if (!process.env.MENU_SITE_URL) {
      console.error('❌ MENU_SITE_URL 환경 변수가 설정되지 않았습니다.');
      console.log(
        '📝 .env 파일에 MENU_SITE_URL=https://your-site.com 을 추가해주세요.',
      );
      return;
    }

    console.log('\n🚀 크롤링 시작...');
    const startTime = Date.now();

    const imagePath = await crawlService.getWeeklyMeal();

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log('\n✅ 크롤링 성공!');
    console.log(`📄 저장된 파일: ${imagePath}`);
    console.log(`⏱️ 소요 시간: ${duration}초`);

    // 파일 정보 확인
    const stats = await fs.stat(imagePath);
    console.log(`📊 파일 크기: ${(stats.size / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('\n❌ 크롤링 실패:', error.message);
    console.error('상세 오류:', error);
  }

  console.log('\n=== 테스트 완료 ===');
}

// 스크립트 실행
testCrawling();
