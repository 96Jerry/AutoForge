import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { GEMINI_API_KEY } from 'config';

@Injectable()
export class GoogleGeminiStrategy {
  async analyze(data: any) {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const res = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: data,
    });

    console.log(res.text);
  }
}
