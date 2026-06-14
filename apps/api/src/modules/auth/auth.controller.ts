import {
  Controller, Post, Body, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ParentalConsentDto } from './dto/parental-consent.dto';

function extractIp(req: ExpressRequest): string | undefined {
  return (req.headers['x-forwarded-for'] as string | undefined) ?? req.socket.remoteAddress;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto, @Request() req: ExpressRequest) {
    return this.authService.register(dto, extractIp(req));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto, @Request() req: ExpressRequest) {
    return this.authService.login(dto, extractIp(req));
  }

  @Post('parental-consent')
  @HttpCode(HttpStatus.OK)
  parentalConsent(@Body() dto: ParentalConsentDto, @Request() req: ExpressRequest) {
    return this.authService.submitParentalConsent(dto.userId, dto.parentEmail, extractIp(req));
  }
}
