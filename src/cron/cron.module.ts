import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GoogleModule } from 'src/google/google.module';
import { CronService } from './cron.service';

@Module({
  imports: [ScheduleModule.forRoot(), GoogleModule],
  providers: [CronService],
})
export class CronModule {}
