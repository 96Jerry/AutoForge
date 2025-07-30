import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CrawlModule } from 'src/crawl/crawl.module';
import { DiscordModule } from 'src/discord/discord.module';
import { GoogleModule } from 'src/google/google.module';
import { CronService } from './cron.service';
import { CronController } from './cron.controller';

@Module({
  imports: [ScheduleModule.forRoot(), GoogleModule, CrawlModule, DiscordModule],
  controllers: [CronController],
  providers: [CronService],
})
export class CronModule {}
