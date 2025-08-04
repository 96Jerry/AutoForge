import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { MealPlanService } from '../models/meal-plan/meal-plan.service';
import { RestaurantName } from './enums/restaurant-name.enum';
import * as dayjs from 'dayjs';

@Injectable()
export class CrawlService {
  private readonly restaurantSites: { [key in RestaurantName]: string } = {
    [RestaurantName.GreenCook]: 'https://pf.kakao.com/_yxgQDb/posts',
    [RestaurantName.LunchStory]: 'https://pf.kakao.com/_Fwpwn/posts',
  };

  constructor(private readonly mealPlanService: MealPlanService) {}

  /** 특정 식당의 오늘의 식단표 크롤링 */
  async getTodaysMealPics(restaurantName: RestaurantName): Promise<string[]> {
    // 오늘의 식단표가 이미 있는지 확인
    const existingMealPlan =
      await this.mealPlanService.findTodaysMealsByRestaurant(restaurantName);
    if (existingMealPlan) {
      console.log(
        `이미 ${restaurantName} 오늘의 식단표가 존재합니다:`,
        existingMealPlan,
      );
      return existingMealPlan.imagePaths;
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();

      // 화면 크기 설정
      await page.setViewport({ width: 1920, height: 1080 });

      // 식당 사이트 URL
      const restaurantUrl = this.restaurantSites[restaurantName];
      if (!restaurantUrl) {
        throw new Error(`${restaurantName} 사이트 URL이 설정되지 않았습니다.`);
      }

      console.log(`${restaurantName} 사이트 접속: ${restaurantUrl}`);

      await page.goto(restaurantUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // 페이지 로딩 완료 대기
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 첫 번째 게시글 찾기 및 클릭
      console.log(`${restaurantName} 첫 번째 게시글 찾는 중...`);

      // 페이지 구조 디버깅
      const pageStructure = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const linkInfo = links
          .map((link, index) => ({
            index,
            href: link.getAttribute('href'),
            text: link.textContent?.trim() || link.innerText?.trim() || '',
            className: link.className,
          }))
          .filter((link) => link.href && link.text.length > 0)
          .slice(0, 15); // 처음 15개만

        // link_title 클래스를 가진 링크들만 필터링
        const titleLinks = linkInfo.filter(
          (link) => link.className === 'link_title',
        );

        return {
          totalLinks: links.length,
          linkInfo,
          titleLinks,
          bodyHTML: document.body.innerHTML.substring(0, 500), // 처음 500자만
        };
      });

      console.log(
        `${restaurantName} 페이지 구조:`,
        JSON.stringify(pageStructure, null, 2),
      );

      // 페이지 구조에서 첫 번째 게시글 링크 찾기
      let firstPostLink;
      if (pageStructure.titleLinks && pageStructure.titleLinks.length > 0) {
        // titleLinks에서 첫 번째 링크 선택
        const firstTitleLink = pageStructure.titleLinks[0];
        console.log(
          `${restaurantName} 첫 번째 게시글 링크 발견:`,
          firstTitleLink,
        );

        firstPostLink = await page.evaluateHandle((linkInfo) => {
          const links = Array.from(document.querySelectorAll('a'));
          return links.find(
            (link) =>
              link.getAttribute('href') === linkInfo.href &&
              link.textContent?.trim() === linkInfo.text,
          );
        }, firstTitleLink);
      } else {
        // 기존 로직으로 찾기
        firstPostLink = await page.evaluateHandle((restaurantNameParam) => {
          const links = Array.from(document.querySelectorAll('a'));

          const postLink = links.find((link) => {
            const href = link.getAttribute('href');
            const text = link.textContent || link.innerText || '';
            const className = link.className;

            return (
              href &&
              href.match(/\/[a-zA-Z0-9]+\/\d+$/) &&
              className === 'link_title' &&
              text.trim().length > 0
            );
          });

          if (!postLink) {
            throw new Error(
              `${restaurantNameParam} 첫 번째 게시글을 찾을 수 없습니다.`,
            );
          }

          return postLink;
        }, restaurantName);
      }

      // 찾은 링크가 유효한지 확인
      const isLinkValid = await firstPostLink.evaluate((link) => link !== null);
      if (!isLinkValid) {
        throw new Error(`${restaurantName} 첫 번째 게시글을 찾을 수 없습니다.`);
      }

      // 첫 번째 게시글 클릭
      console.log(`${restaurantName} 첫 번째 게시글 클릭`);
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
        (firstPostLink as any).click(),
      ]);

      console.log(`${restaurantName} 게시글 페이지로 이동 완료`);

      // 페이지 로딩 완료 대기
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 게시글 내의 모든 이미지 찾기
      const imageSelectors = [
        '.content img', // 게시글 컨텐츠 내 이미지
        '.post-content img', // 게시글 내용 내 이미지
        '.board-content img', // 게시판 내용 내 이미지
        '.article-content img', // 아티클 내용 내 이미지
        '.view-content img', // 보기 내용 내 이미지
        '.text-content img', // 텍스트 내용 내 이미지
        'img', // 모든 이미지
      ];

      let imageUrls: string[] = [];

      console.log(`${restaurantName} 게시글 내 이미지 찾는 중...`);
      for (const selector of imageSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });

          // 모든 이미지 URL 추출
          const images = await page.$$eval(
            selector,
            (imgs: HTMLImageElement[]) => {
              return imgs
                .filter((img) => img.src && !img.src.includes('data:image')) // data URL 제외
                .filter((img) => !img.src.includes('/qrcodes/image')) // QR 코드 이미지 제외
                .map((img) => ({
                  src: img.src,
                  alt: img.alt || '',
                  width: img.naturalWidth || img.width,
                  height: img.naturalHeight || img.height,
                }))
                .filter((img) => img.width > 100 && img.height > 100); // 너무 작은 이미지 제외
            },
          );

          if (images.length > 0) {
            // 모든 이미지 URL 수집
            imageUrls = images.map((img) => img.src);
            console.log(
              `${restaurantName} 이미지 ${imageUrls.length}개 발견: ${selector}`,
            );
            break;
          }
        } catch (error) {
          console.log(
            `${restaurantName} 이미지 선택자 ${selector} 찾기 실패, 다음 선택자 시도...`,
          );
          continue;
        }
      }

      if (imageUrls.length === 0) {
        throw new Error(
          `${restaurantName} 게시글 내에서 이미지를 찾을 수 없습니다.`,
        );
      }

      // 이미지 URL들을 수집
      console.log(
        `${restaurantName} 이미지 URL 수집 완료: ${imageUrls.length}개`,
      );

      if (imageUrls.length === 0) {
        throw new Error(`${restaurantName} 이미지를 찾을 수 없습니다.`);
      }

      // 이미지 URL들을 그대로 사용
      const imagePaths = imageUrls;

      // 오늘 날짜
      const today = dayjs().format('YYYY-MM-DD');

      // 데이터베이스에 저장
      const mealPlan = await this.mealPlanService.create({
        date: today,
        imagePaths: imagePaths,
        restaurantName: restaurantName,
      });

      console.log(
        `${restaurantName} 식단표 데이터베이스 저장 완료: ID ${mealPlan.id}`,
      );

      return imagePaths;
    } catch (error) {
      console.error(`${restaurantName} 식단표 크롤링 중 오류 발생:`, error);
      throw new Error(`${restaurantName} 식단표 크롤링 실패: ${error.message}`);
    } finally {
      await browser.close();
    }
  }

  /** 모든 식당의 오늘의 식단표 크롤링 */
  async getAllTodaysMealPics(): Promise<{ [key in RestaurantName]: string[] }> {
    const results: { [key in RestaurantName]: string[] } = {
      [RestaurantName.GreenCook]: [],
      [RestaurantName.LunchStory]: [],
    };

    for (const restaurantName of Object.values(RestaurantName)) {
      try {
        const imagePaths = await this.getTodaysMealPics(restaurantName);
        results[restaurantName] = imagePaths;
      } catch (error) {
        console.error(`${restaurantName} 크롤링 실패:`, error);
        results[restaurantName] = [];
      }
    }

    return results;
  }

  /** 이미지 확장자 추출 */
  private getImageExtension(url: string): string {
    const urlWithoutQuery = url.split('?')[0];
    const extension = urlWithoutQuery.split('.').pop()?.toLowerCase();

    // 지원되는 이미지 확장자 확인
    const supportedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

    if (extension && supportedExtensions.includes(extension)) {
      return extension;
    }

    // 기본값으로 jpg 사용
    return 'jpg';
  }

  /** 테스트용: 크롤링 서비스 상태 확인 */
  async testCrawlService(): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      // 브라우저 시작 테스트
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });

      // 간단한 페이지 접속 테스트
      await page.goto('https://www.google.com', {
        waitUntil: 'networkidle2',
        timeout: 10000,
      });

      const title = await page.title();
      await browser.close();

      return {
        success: true,
        message: '크롤링 서비스가 정상적으로 작동합니다.',
        data: {
          browserTest: 'PASSED',
          pageTitle: title,
          restaurantSites: this.restaurantSites,
          supportedRestaurants: Object.values(RestaurantName),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: '크롤링 서비스 테스트 중 오류가 발생했습니다.',
        data: {
          error: error.message,
          restaurantSites: this.restaurantSites,
          supportedRestaurants: Object.values(RestaurantName),
        },
      };
    }
  }

  /** 테스트용: 카카오톡 채널 URL 접속 테스트 */
  async testKakaoChannelUrls(): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    const results: { [key: string]: any } = {};

    for (const [restaurantName, url] of Object.entries(this.restaurantSites)) {
      try {
        const browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        console.log(`${restaurantName} URL 테스트: ${url}`);

        await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 30000,
        });

        // 페이지 정보 수집
        const pageInfo = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a'));
          const linkInfo = links
            .map((link, index) => ({
              index,
              href: link.getAttribute('href'),
              text: link.textContent?.trim() || link.innerText?.trim() || '',
              className: link.className,
            }))
            .filter((link) => link.href && link.text.length > 0)
            .slice(0, 5);

          return {
            title: document.title,
            totalLinks: links.length,
            linkInfo,
            url: window.location.href,
          };
        });

        await browser.close();

        results[restaurantName] = {
          success: true,
          url: url,
          pageInfo,
        };

        console.log(`${restaurantName} 테스트 성공:`, pageInfo);
      } catch (error) {
        results[restaurantName] = {
          success: false,
          url: url,
          error: error.message,
        };
        console.error(`${restaurantName} 테스트 실패:`, error.message);
      }
    }

    return {
      success: true,
      message: '카카오톡 채널 URL 테스트 완료',
      data: results,
    };
  }
}
