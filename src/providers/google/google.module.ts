import { Module } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { GoogleService } from './google.service';
import { GoogleCalendarStrategy } from './strategies/google.calendar.strategy';
import { GoogleMailStrategy } from './strategies/google.mail.strategy';

@Module({
  providers: [
    AuthService,
    GoogleService,
    GoogleMailStrategy,
    GoogleCalendarStrategy,
  ],
  exports: [GoogleService],
})
export class GoogleModule {}
