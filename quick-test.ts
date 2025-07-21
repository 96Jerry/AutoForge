// 이 파일은 데이터베이스 의존성으로 인해 현재 사용할 수 없습니다.
// 대신 다음 방법을 사용하세요:
// 1. pnpm run start:dev 로 서버 실행
// 2. POST /crawl/weekly-meal 엔드포인트 호출

/*
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
console.log('예시:');
console.log('curl -X POST http://localhost:3000/crawl/weekly-meal');
console.log('');
