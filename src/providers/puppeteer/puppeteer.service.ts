import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class PuppeteerManagerService {
  constructor() {}

  async getDisposableBrowser() {
    const browser = await puppeteer.launch();
    return {
      browser,
      [Symbol.asyncDispose]: async () => {
        await browser.close();
      },
    };
  }
}
