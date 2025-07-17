import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import { join } from 'path';
import { MENU_SITE_URL } from '../../config';

@Injectable()
export class CrawlService {
  async flexLogin() {}

  /** 일주일 식단표 크롤링 */
  async getWeeklyMeal(): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();

      // 화면 크기 설정
      await page.setViewport({ width: 1920, height: 1080 });

      // 메인 사이트 URL
      const menuUrl = MENU_SITE_URL;
      if (!menuUrl) {
        throw new Error('MENU_SITE_URL is not set');
      }

      console.log(`메인 사이트 접속: ${menuUrl}`);

      await page.goto(menuUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // 페이지 로딩 완료 대기
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 이노밸리 구내식당 주간메뉴 게시글 찾기
      console.log('이노밸리 구내식당 주간메뉴 게시글 찾는 중...');

      const menuPostLink = await page.evaluateHandle(() => {
        // 모든 링크 요소 찾기
        const links = Array.from(document.querySelectorAll('a'));

        // 이노밸리 구내식당 주간메뉴 텍스트가 포함된 링크 찾기
        const menuLink = links.find((link) => {
          const text = link.textContent || link.innerText || '';
          return (
            text.includes('이노밸리 구내식당 주간메뉴') ||
            text.includes('구내식당 주간메뉴') ||
            text.includes('주간메뉴') ||
            /주간메뉴\[\d{2}\/\d{2}-\d{4}\]/.test(text)
          );
        });

        return menuLink;
      });

      // 찾은 링크가 유효한지 확인
      const isLinkValid = await menuPostLink.evaluate(
        (link: any) => link !== null,
      );

      if (!isLinkValid) {
        // 대안: 더 넓은 범위에서 찾기
        console.log('직접 텍스트 매칭 실패, XPath로 재시도...');

        const alternativeLink = await page.evaluateHandle(() => {
          // XPath 사용하여 텍스트 매칭
          const xpath =
            "//a[contains(text(), '주간메뉴') or contains(text(), '구내식당') or contains(text(), '식단')]";
          const result = document.evaluate(
            xpath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null,
          );
          return result.singleNodeValue;
        });

        const isAlternativeValid = await alternativeLink.evaluate(
          (link: any) => link !== null,
        );

        if (!isAlternativeValid) {
          throw new Error(
            '이노밸리 구내식당 주간메뉴 게시글을 찾을 수 없습니다.',
          );
        }

        // 대안 링크 사용
        console.log('XPath로 주간메뉴 게시글 발견');
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
          (alternativeLink as any).click(),
        ]);
      } else {
        // 원래 링크 사용
        console.log('이노밸리 구내식당 주간메뉴 게시글 발견');
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
          (menuPostLink as any).click(),
        ]);
      }

      console.log('주간메뉴 게시글 페이지로 이동 완료');

      // 페이지 로딩 완료 대기
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 게시글 내의 이미지 찾기
      const imageSelectors = [
        '.content img', // 게시글 컨텐츠 내 이미지
        '.post-content img', // 게시글 내용 내 이미지
        '.board-content img', // 게시판 내용 내 이미지
        '.article-content img', // 아티클 내용 내 이미지
        '.view-content img', // 보기 내용 내 이미지
        '.text-content img', // 텍스트 내용 내 이미지
        'img', // 모든 이미지
      ];

      let imageUrl = null;

      console.log('게시글 내 이미지 찾는 중...');
      for (const selector of imageSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });

          // 이미지 URL 추출
          const images = await page.$$eval(
            selector,
            (imgs: HTMLImageElement[]) => {
              return imgs
                .filter((img) => img.src && !img.src.includes('data:image')) // data URL 제외
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
            // 가장 큰 이미지 선택 (식단표일 가능성이 높음)
            const largestImage = images.reduce((prev, current) =>
              prev.width * prev.height > current.width * current.height
                ? prev
                : current,
            );

            imageUrl = largestImage.src;
            console.log(`이미지 발견: ${selector} - ${imageUrl}`);
            console.log(
              `이미지 크기: ${largestImage.width}x${largestImage.height}`,
            );
            break;
          }
        } catch (error) {
          console.log(
            `이미지 선택자 ${selector} 찾기 실패, 다음 선택자 시도...`,
          );
          continue;
        }
      }

      if (!imageUrl) {
        throw new Error('게시글 내에서 이미지를 찾을 수 없습니다.');
      }

      // 이미지 다운로드
      console.log('이미지 다운로드 중...');

      const imageResponse = await page.goto(imageUrl, {
        waitUntil: 'networkidle2',
      });

      if (!imageResponse) {
        throw new Error('이미지 다운로드 실패');
      }

      const imageBuffer = await imageResponse.buffer();

      // 이미지 파일 저장
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const imageExtension = this.getImageExtension(imageUrl);
      const filename = `weekly-menu-${timestamp}.${imageExtension}` as const;
      const imagePath = join(process.cwd(), 'temp', filename);

      // temp 디렉토리 생성
      await fs.mkdir(join(process.cwd(), 'temp'), { recursive: true });

      // 이미지 파일 저장
      await fs.writeFile(imagePath, imageBuffer);

      console.log(`식단표 이미지 저장 완료: ${imagePath}`);
      console.log(`파일 크기: ${imageBuffer.length} bytes`);

      return imagePath;
    } catch (error) {
      console.error('식단표 크롤링 중 오류 발생:', error);
      throw new Error(`식단표 크롤링 실패: ${error.message}`);
    } finally {
      await browser.close();
    }
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

  /** 임시 파일 정리 */
  async cleanupTempFiles(): Promise<void> {
    try {
      const tempDir = join(process.cwd(), 'temp');
      const files = await fs.readdir(tempDir);

      for (const file of files) {
        if (file.startsWith('weekly-menu-')) {
          await fs.unlink(join(tempDir, file));
          console.log(`임시 파일 삭제: ${file}`);
        }
      }
    } catch (error) {
      console.error('임시 파일 정리 중 오류:', error);
    }
  }
}
