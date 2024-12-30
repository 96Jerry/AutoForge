import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('auth/google/token')
  async redirectAndGetGoogleCode(@Res({ passthrough: true }) res: Response) {
    const url = await this.authService.getGoogleAuthUrl();

    res.redirect(url);
  }

  @Get('auth/google/callback')
  async getGoogleToken(@Query('code') code: string) {
    const tokens = await this.authService.getGoogleToken(code);

    return tokens;
  }
}
