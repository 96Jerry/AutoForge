import { GoogleGeminiStrategy } from './src/google/strategies/google.gemini.strategy';
import * as path from 'path';
import * as fs from 'fs';

async function testGeminiAnalysis() {
  console.log('🔍 Gemini 식단표 분석 테스트 시작...\n');

  const geminiStrategy = new GoogleGeminiStrategy();
  const tempDir = path.join(__dirname, 'temp');

  try {
    // temp 폴더에서 이미지 파일 찾기
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
    imageFiles.forEach((file) => console.log(`  - ${file}`));
    console.log();

    // 각 이미지 파일에 대해 분석 수행
    for (const imageFile of imageFiles) {
      const imagePath = path.join(tempDir, imageFile);

      console.log(`🖼️  이미지 분석 중: ${imageFile}`);
      console.log(`📍 경로: ${imagePath}`);

      try {
        // 파일 존재 확인
        if (!fs.existsSync(imagePath)) {
          console.log(`❌ 파일이 존재하지 않습니다: ${imagePath}`);
          continue;
        }

        // 파일 크기 확인
        const stats = fs.statSync(imagePath);
        console.log(`📊 파일 크기: ${(stats.size / 1024).toFixed(2)} KB`);

        // Gemini API 호출
        const startTime = Date.now();
        const result = await geminiStrategy.analyze(imagePath);
        const endTime = Date.now();

        console.log(`⏱️  분석 시간: ${endTime - startTime}ms`);
        console.log('📋 분석 결과:');
        console.log(JSON.stringify(result, null, 2));

        // 결과 검증
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        const foundDays = days.filter((day) => result[day]);

        console.log(
          `✅ 추출된 요일: ${foundDays.length}개 (${foundDays.join(', ')})`,
        );

        foundDays.forEach((day) => {
          const dayMenu = result[day];
          if (dayMenu) {
            console.log(`  ${day}:`);
            console.log(
              `    점심: ${dayMenu.lunch?.course1}, ${dayMenu.lunch?.course2}, ${dayMenu.lunch?.course3}`,
            );
            console.log(`    저녁: ${dayMenu.dinner}`);
          }
        });
      } catch (error) {
        console.error(`❌ 분석 실패: ${imageFile}`);
        console.error('에러 내용:', error.message);
        if (error.stack) {
          console.error('스택 트레이스:', error.stack);
        }
      }

      console.log('\n' + '='.repeat(80) + '\n');
    }
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error);
  }
}

// 테스트 실행
testGeminiAnalysis()
  .then(() => {
    console.log('🎉 테스트 완료!');
  })
  .catch((error) => {
    console.error('❌ 테스트 실행 실패:', error);
  });
