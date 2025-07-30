import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { GEMINI_API_KEY } from '../../../config';
import * as fs from 'fs';

export interface MenuCourse {
  course1: string;
  course2: string;
  course3: string;
}

export interface DailyMenu {
  lunch: MenuCourse;
}

export interface WeeklyMenu {
  monday?: DailyMenu;
  tuesday?: DailyMenu;
  wednesday?: DailyMenu;
  thursday?: DailyMenu;
  friday?: DailyMenu;
}

@Injectable()
export class GoogleGeminiStrategy {
  /** @deprecated */
  async analyze(imagePath: string): Promise<WeeklyMenu> {
    try {
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
      if (!text) throw new Error('Gemini API 응답이 없습니다');

      console.log('Gemini API 응답:', text);

      // JSON 파싱
      try {
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        const menuData = JSON.parse(cleanedText);

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
}
