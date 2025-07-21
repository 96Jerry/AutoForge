import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { CrawlModule } from './crawl/crawl.module';
import { CronModule } from './cron/cron.module';
import { DiscordController } from './discord/discord.controller';
import { DiscordModule } from './discord/discord.module';
import { GoogleController } from './google/google.controller';
import { GoogleModule } from './google/google.module';
import { MealPlanModule } from './models/meal-plan/meal-plan.module';
import {
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
} from '../config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // 개발 환경에서만 true, 프로덕션에서는 false
      logging: true,
    }),
    GoogleModule,
    AuthModule,
    CrawlModule,
    CronModule,
    DiscordModule,
    MealPlanModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'assets'),
    }),
  ],
  controllers: [
    AppController,
    GoogleController,
    AuthController,
    DiscordController,
  ],
  providers: [AppService],
})
export class AppModule {}
