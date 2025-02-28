import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { CrawlModule } from './crawl/crawl.module';
import { CronModule } from './cron/cron.module';
import { GoogleController } from './google/google.controller';
import { GoogleModule } from './google/google.module';

@Module({
  imports: [
    GoogleModule,
    AuthModule,
    CrawlModule,
    CronModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'assets'),
    }),
  ],
  controllers: [AppController, GoogleController, AuthController],
  providers: [AppService],
})
export class AppModule {}
