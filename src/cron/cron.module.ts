import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CrawlModule } from 'src/crawl/crawl.module';
import { GoogleModule } from 'src/google/google.module';
import { CronService } from './cron.service';

@Module({
  imports: [ScheduleModule.forRoot(), GoogleModule, CrawlModule],
  providers: [CronService],
})
export class CronModule {}
