import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { AuditModule } from '../audit/audit.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    AuditModule,
    PassportModule,
    JwtModule.registerAsync({
      imports:    [ConfigModule],
      inject:     [ConfigService],
      useFactory: (config: ConfigService) => ({
        // AUTH_SECRET (v5 name) with fallback to NEXTAUTH_SECRET (v4 name) for backward compat
        secret:      config.get<string>('AUTH_SECRET') ?? config.getOrThrow<string>('NEXTAUTH_SECRET'),
        signOptions: { expiresIn: 7 * 24 * 60 * 60 },
      }),
    }),
  ],
  providers:   [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports:     [AuthService, JwtModule],
})
export class AuthModule {}
