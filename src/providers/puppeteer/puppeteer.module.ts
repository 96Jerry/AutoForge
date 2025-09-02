import { Module } from '@nestjs/common';
import { PuppeteerManagerService } from './puppeteer.service';

@Module({
  providers: [PuppeteerManagerService],
  exports: [PuppeteerManagerService],
})
export class PuppeteerModule {}
