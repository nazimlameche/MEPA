import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import type { JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('NEXTAUTH_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<{ id: string; role: string }> {
    try {
      await this.usersService.findById(payload.sub);
    } catch {
      throw new UnauthorizedException('Utilisateur introuvable');
    }
    return { id: payload.sub, role: payload.role };
  }
}
