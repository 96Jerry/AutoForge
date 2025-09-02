import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { CronService } from 'src/cron/cron.service';
import { GoogleService } from 'src/providers/google/google.service';

describe('CronService', () => {
  let cronService: CronService;
  // let crawlService: CrawlService;
  let googleService: GoogleService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    cronService = app.get<CronService>(CronService);
    // crawlService = app.get<CrawlService>(CrawlService);
    googleService = app.get<GoogleService>(GoogleService);
  });

  // mock
  beforeAll(async () => {
    jest
      .spyOn(googleService, 'updateWeeklyCalender')
      .mockImplementation(() => Promise.resolve());
  });

  // mock restore
  afterAll(async () => {
    jest.restoreAllMocks();
  });

  describe('식단표 캘린더 업데이트', () => {
    test('정상 플로우', async () => {
      const result = await cronService.updateGoogleCalendarWithWeeklyMeal();
      console.log(result);
    });
  });
});
