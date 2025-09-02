import { Injectable } from '@nestjs/common';
import { MealPlanService } from '../models/meal-plan/meal-plan.service';
import { RestaurantName } from './enums/restaurant-name.enum';
import * as dayjs from 'dayjs';
import { PuppeteerManagerService } from 'src/providers/puppeteer/puppeteer.service';

@Injectable()
export class CrawlService {
  private readonly restaurantSites: { [key in RestaurantName]: string } = {
    [RestaurantName.GreenCook]: 'https://pf.kakao.com/_yxgQDb/posts',
    [RestaurantName.LunchStory]: 'https://pf.kakao.com/_Fwpwn/posts',
  };

  constructor(
    private readonly mealPlanService: MealPlanService,
    private readonly puppeteerManagerService: PuppeteerManagerService,
  ) {}

  /** 특정 식당의 오늘의 식단표 크롤링 */
  async getTodaysMealPics(restaurantName: RestaurantName): Promise<string[]> {
    const existingMealPlan =
      await this.mealPlanService.findTodaysMealsByRestaurant(restaurantName);
    if (existingMealPlan) return existingMealPlan.imagePaths;

    const restaurantUrl = this.restaurantSites[restaurantName];
    if (!restaurantUrl) {
      throw new Error(`${restaurantName} 사이트 URL이 설정되지 않았습니다.`);
    }

    await using browserResource =
      await this.puppeteerManagerService.getDisposableBrowser();
    const { browser } = browserResource;
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(restaurantUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    const titleLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links
        .map((link) => ({
          href: link.getAttribute('href'),
          text: link.textContent?.trim() || link.innerText?.trim() || '',
          className: link.className,
        }))
        .filter(
          (link) =>
            link.href &&
            link.text.length > 0 &&
            link.className === 'link_title',
        )
        .slice(0, 15);
    });
    if (!titleLinks || titleLinks.length === 0) {
      throw new Error(`${restaurantName} 게시글 링크를 찾을 수 없습니다.`);
    }

    const firstTitleLink = titleLinks[0];
    const firstPostLinkSelector = `a[href="${firstTitleLink.href}"].link_title`;
    const firstPostLink = await page.$(firstPostLinkSelector);
    if (!firstPostLink) {
      throw new Error(`${restaurantName} 첫 번째 게시글을 찾을 수 없습니다.`);
    }

    await firstPostLink.click();
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    const selector = 'img';
    await page.waitForSelector(selector, { timeout: 5000 });
    const images = await page.$$eval(selector, (imgs: HTMLImageElement[]) => {
      return imgs
        .filter((img) => img.src && !img.src.includes('data:image'))
        .filter((img) => !img.src.includes('/qrcodes/image'))
        .map((img) => ({
          src: img.src,
          alt: img.alt || '',
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
        }))
        .filter((img) => img.width > 100 && img.height > 100);
    });
    const imageUrls = images.map((img) => img.src);
    if (imageUrls.length === 0) {
      throw new Error(`${restaurantName} 이미지를 찾을 수 없습니다.`);
    }

    const today = dayjs().format('YYYY-MM-DD');
    await this.mealPlanService.create({
      date: today,
      imagePaths: imageUrls,
      restaurantName: restaurantName,
    });

    return imageUrls;
  }

  /** 모든 식당의 오늘의 식단표 크롤링 */
  async getAllTodaysMealPics(): Promise<{ [key in RestaurantName]: string[] }> {
    const results: { [key in RestaurantName]: string[] } = {
      [RestaurantName.GreenCook]: [],
      [RestaurantName.LunchStory]: [],
    };

    for (const restaurantName of Object.values(RestaurantName)) {
      const imagePaths = await this.getTodaysMealPics(restaurantName);
      results[restaurantName] = imagePaths;
    }

    return results;
  }
}
