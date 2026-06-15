import {
  Controller, Post, Body, Request, Headers, HttpCode, HttpStatus, UnauthorizedException,
} from '@nestjs/common';
import { IsEmail, IsString } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ParentalConsentDto } from './dto/parental-consent.dto';

class OAuthUpsertDto {
  @IsEmail()
  email!: string;

  @IsString()
  provider!: string;
}

function extractIp(req: ExpressRequest): string | undefined {
  return (req.headers['x-forwarded-for'] as string | undefined) ?? req.socket.remoteAddress;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

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

  /**
   * Server-to-server endpoint called by NextAuth signIn callback for Google OAuth.
   * Protected by x-oauth-secret header — never expose this to the browser.
   */
  @Post('oauth')
  @HttpCode(HttpStatus.OK)
  async oauthUpsert(
    @Body() dto: OAuthUpsertDto,
    @Headers('x-oauth-secret') secret: string | undefined,
    @Request() req: ExpressRequest,
  ) {
    const expected = this.configService.get<string>('AUTH_OAUTH_SECRET');
    if (!expected || secret !== expected) {
      throw new UnauthorizedException('Invalid OAuth secret');
    }
    return this.authService.oauthUpsert(dto.email, dto.provider, extractIp(req));
  }
}
