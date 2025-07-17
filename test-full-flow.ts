import { config } from 'dotenv';

// 환경변수 로드
config();

import { GoogleService } from './src/google/google.service';
import { GoogleCalendarStrategy } from './src/google/strategies/google.calendar.strategy';
import { GoogleMailStrategy } from './src/google/strategies/google.mail.strategy';
import { AuthService } from './src/auth/auth.service';
import * as path from 'path';
import * as fs from 'fs';

async function testFullFlow() {
  console.log('🚀 전체 플로우 테스트 시작...\n');

  // 서비스 인스턴스 생성
  const authService = new AuthService();
  const googleCalendarStrategy = new GoogleCalendarStrategy(authService);
  const googleMailStrategy = new GoogleMailStrategy(authService);
  const googleService = new GoogleService(
    googleMailStrategy,
    googleCalendarStrategy,
  );

  // 테스트용 캘린더 ID (개인 캘린더 또는 테스트 캘린더 사용)
  const TEST_CALENDAR_ID = 'primary'; // 기본 캘린더 사용

  const tempDir = path.join(__dirname, 'temp');

  try {
    // 1. 이미지 파일 찾기
    const files = fs.readdirSync(tempDir);
    const imageFiles = files.filter(
      (file) =>
        file.endsWith('.jpg') ||
        file.endsWith('.jpeg') ||
        file.endsWith('.png'),
    );

    if (imageFiles.length === 0) {
      console.log('❌ temp 폴더에 이미지 파일이 없습니다.');
      return;
    }

    console.log(`📁 발견된 이미지 파일: ${imageFiles.length}개`);
    console.log(`📝 테스트용 캘린더 ID: ${TEST_CALENDAR_ID}\n`);

    // 첫 번째 이미지로 테스트
    const testImageFile = imageFiles[0];
    const imagePath = path.join(tempDir, testImageFile);

    console.log(`🖼️  분석할 이미지: ${testImageFile}`);
    console.log(`📍 경로: ${imagePath}\n`);

    // 2. 이미지 분석 (Gemini API)
    console.log('🔍 Step 1: 이미지 분석 시작...');
    const analysisStartTime = Date.now();

    const weeklyMenu = await googleService.analyze(imagePath);

    const analysisEndTime = Date.now();
    console.log(`⏱️  분석 시간: ${analysisEndTime - analysisStartTime}ms`);
    console.log('📋 분석 결과:');
    console.log(JSON.stringify(weeklyMenu, null, 2));

    // 분석 결과 검증
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const foundDays = days.filter((day) => weeklyMenu[day]);

    console.log(
      `✅ 추출된 요일: ${foundDays.length}개 (${foundDays.join(', ')})\n`,
    );

    // 3. 캘린더 업데이트
    console.log('📅 Step 2: 캘린더 업데이트 시작...');
    const calendarStartTime = Date.now();

    const result = await googleService.updateWeeklyCalender(
      weeklyMenu,
      TEST_CALENDAR_ID,
    );

    const calendarEndTime = Date.now();
    console.log(
      `⏱️  캘린더 업데이트 시간: ${calendarEndTime - calendarStartTime}ms`,
    );
    console.log('📅 캘린더 업데이트 결과:', result);

    // 4. 결과 요약
    console.log('\n' + '='.repeat(60));
    console.log('📊 테스트 결과 요약:');
    console.log(`  - 분석된 이미지: ${testImageFile}`);
    console.log(`  - 추출된 요일: ${foundDays.length}개`);
    console.log(`  - 생성된 이벤트: ${result.createdEvents}개`);
    console.log(`  - 총 소요 시간: ${calendarEndTime - analysisStartTime}ms`);
    console.log('='.repeat(60));

    // 5. 생성된 이벤트 확인
    console.log('\n🔍 생성된 이벤트 확인...');
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // 월요일
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // 일요일
    weekEnd.setHours(23, 59, 59, 999);

    const events = await googleCalendarStrategy.findEventsByDateRange(
      TEST_CALENDAR_ID,
      weekStart,
      weekEnd,
    );

    const menuEvents = events.filter(
      (event) => event.summary && event.summary.includes('식단표'),
    );

    console.log(`📋 생성된 식단 이벤트: ${menuEvents.length}개`);
    menuEvents.forEach((event, index) => {
      const startTime = new Date(event.start.dateTime).toLocaleString('ko-KR');
      console.log(`  ${index + 1}. ${event.summary} (${startTime})`);
    });
  } catch (error) {
    console.error('❌ 전체 플로우 테스트 실패:', error);
    if (error.stack) {
      console.error('스택 트레이스:', error.stack);
    }
  }
}

// 테스트 실행
testFullFlow()
  .then(() => {
    console.log('\n🎉 전체 플로우 테스트 완료!');
  })
  .catch((error) => {
    console.error('\n❌ 전체 플로우 테스트 실행 실패:', error);
  });
