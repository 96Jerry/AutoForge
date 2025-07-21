// 이 파일은 데이터베이스 의존성으로 인해 현재 사용할 수 없습니다.
// 대신 다음 방법을 사용하세요:
// 1. pnpm run start:dev 로 서버 실행
// 2. POST /crawl/weekly-meal 엔드포인트 호출

/*
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

    const result = await crawlService.getWeeklyMeal();

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log('\n✅ 크롤링 성공!');
    console.log(`📄 저장된 파일: ${result.imagePath}`);
    console.log(`🆔 데이터베이스 ID: ${result.id}`);
    console.log(`⏱️ 소요 시간: ${duration}초`);

    // 파일 정보 확인
    const stats = await fs.stat(result.imagePath);
    console.log(`📊 파일 크기: ${(stats.size / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('\n❌ 크롤링 실패:', error.message);
    console.error('상세 오류:', error);
  }

  console.log('\n=== 테스트 완료 ===');
}

// 스크립트 실행
testCrawling();
*/

console.log('');
console.log(
  '📌 이 파일은 데이터베이스 의존성으로 인해 현재 사용할 수 없습니다.',
);
console.log('');
console.log('대신 다음 방법을 사용하세요:');
console.log('1. pnpm run start:dev 로 서버 실행');
console.log('2. POST http://localhost:3000/crawl/weekly-meal 엔드포인트 호출');
console.log('');
console.log('API 테스트 예시:');
console.log('curl -X POST http://localhost:3000/crawl/weekly-meal');
console.log('curl -X GET http://localhost:3000/crawl/current-week');
console.log('curl -X GET http://localhost:3000/meal-plans/statistics');
console.log('');
