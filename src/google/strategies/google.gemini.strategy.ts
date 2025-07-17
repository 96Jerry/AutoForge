import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { GEMINI_API_KEY } from '../../../config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface MenuCourse {
  course1: string;
  course2: string;
  course3: string;
}

export interface DailyMenu {
  lunch: MenuCourse;
  dinner: string; // 저녁은 1개 코스만 있음
}

export interface WeeklyMenu {
  monday?: DailyMenu;
  tuesday?: DailyMenu;
  wednesday?: DailyMenu;
  thursday?: DailyMenu;
  friday?: DailyMenu;
}

interface CacheData {
  imageHash: string;
  imagePath: string;
  analyzedAt: string;
  result: WeeklyMenu;
}

@Injectable()
export class GoogleGeminiStrategy {
  private readonly cacheDir = path.join(process.cwd(), 'cache');
  private readonly cacheFile = path.join(
    this.cacheDir,
    'gemini-analysis-cache.json',
  );

  constructor() {
    // 캐시 디렉토리 생성
    this.ensureCacheDir();
  }

  async analyze(imagePath: string): Promise<WeeklyMenu> {
    try {
      // 이미지 파일 해시 계산
      const imageHash = this.calculateImageHash(imagePath);

      // 캐시된 결과 확인
      const cachedResult = this.getCachedResult(imageHash);
      if (cachedResult) {
        console.log('💾 캐시된 분석 결과 사용:', cachedResult.analyzedAt);
        return cachedResult.result;
      }

      console.log('🔍 새로운 이미지 분석 시작...');

      // 이미지 파일 읽기
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      // Gemini AI 초기화
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      // 프롬프트 생성
      const prompt = `
        이 이미지는 주간 식단표입니다. 다음 정보를 JSON 형태로 추출해주세요:
        
        - 월요일부터 금요일까지의 점심, 저녁 메뉴
        - 점심은 3가지 코스가 있습니다 (course1, course2, course3)
        - 저녁은 1가지 코스만 있습니다 (문자열로 반환)
        - 휴일인 경우 해당 요일은 제외해주세요
        
        다음 JSON 형태로 응답해주세요:
        {
          "monday": {
            "lunch": { "course1": "메뉴1", "course2": "메뉴2", "course3": "메뉴3" },
            "dinner": "저녁메뉴"
          },
          "tuesday": {
            "lunch": { "course1": "메뉴1", "course2": "메뉴2", "course3": "메뉴3" },
            "dinner": "저녁메뉴"
          },
          ... (나머지 요일도 동일한 형태)
        }
        
        만약 특정 요일이 휴일이라면 해당 요일은 응답에서 제외해주세요.
        JSON 형태로만 응답해주세요. 다른 텍스트는 포함하지 마세요.
      `;

      // 이미지와 프롬프트로 분석 요청
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: {
          parts: [
            {
              text: prompt,
            },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
              },
            },
          ],
        },
      });

      const text = result.text;

      console.log('Gemini API 응답:', text);

      // JSON 파싱
      try {
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        const menuData = JSON.parse(cleanedText);

        // 분석 결과 캐시에 저장
        this.saveToCache(imageHash, imagePath, menuData);

        return menuData;
      } catch (parseError) {
        console.error('JSON 파싱 에러:', parseError);
        console.error('원본 텍스트:', text);
        throw new Error('Gemini API 응답을 파싱할 수 없습니다');
      }
    } catch (error) {
      console.error('이미지 분석 에러:', error);
      throw error;
    }
  }

  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
      console.log('📁 캐시 디렉토리 생성:', this.cacheDir);
    }
  }

  private calculateImageHash(imagePath: string): string {
    const imageBuffer = fs.readFileSync(imagePath);
    return crypto.createHash('md5').update(imageBuffer).digest('hex');
  }

  private getCachedResult(imageHash: string): CacheData | null {
    try {
      if (!fs.existsSync(this.cacheFile)) {
        return null;
      }

      const cacheContent = fs.readFileSync(this.cacheFile, 'utf8');
      const cache: CacheData[] = JSON.parse(cacheContent);

      const cachedItem = cache.find((item) => item.imageHash === imageHash);
      if (cachedItem) {
        console.log('✅ 캐시 히트! 이전 분석 결과를 재사용합니다.');
        return cachedItem;
      }

      return null;
    } catch (error) {
      console.warn('캐시 읽기 실패:', error.message);
      return null;
    }
  }

  private saveToCache(
    imageHash: string,
    imagePath: string,
    result: WeeklyMenu,
  ): void {
    try {
      let cache: CacheData[] = [];

      // 기존 캐시 데이터 읽기
      if (fs.existsSync(this.cacheFile)) {
        const cacheContent = fs.readFileSync(this.cacheFile, 'utf8');
        cache = JSON.parse(cacheContent);
      }

      // 새로운 캐시 데이터 추가
      const newCacheItem: CacheData = {
        imageHash,
        imagePath,
        analyzedAt: new Date().toISOString(),
        result,
      };

      // 같은 해시의 기존 항목 제거
      cache = cache.filter((item) => item.imageHash !== imageHash);

      // 새 항목 추가
      cache.push(newCacheItem);

      // 캐시 파일 저장
      fs.writeFileSync(this.cacheFile, JSON.stringify(cache, null, 2));

      console.log('💾 분석 결과 캐시에 저장됨:', this.cacheFile);
    } catch (error) {
      console.warn('캐시 저장 실패:', error.message);
    }
  }

  // 캐시 관리 메서드들
  clearCache(): void {
    try {
      if (fs.existsSync(this.cacheFile)) {
        fs.unlinkSync(this.cacheFile);
        console.log('🗑️  캐시 삭제 완료');
      }
    } catch (error) {
      console.error('캐시 삭제 실패:', error);
    }
  }

  getCacheInfo(): { count: number; items: CacheData[] } {
    try {
      if (!fs.existsSync(this.cacheFile)) {
        return { count: 0, items: [] };
      }

      const cacheContent = fs.readFileSync(this.cacheFile, 'utf8');
      const cache: CacheData[] = JSON.parse(cacheContent);

      return { count: cache.length, items: cache };
    } catch (error) {
      console.warn('캐시 정보 조회 실패:', error.message);
      return { count: 0, items: [] };
    }
  }
}
