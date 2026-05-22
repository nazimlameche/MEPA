import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import * as crypto from 'crypto';
import { AuditService } from '../../modules/audit/audit.service';

interface RequestWithUser {
  method: string;
  url: string;
  ip: string;
  headers: Record<string, string>;
  user?: { id: string };
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (!MUTATING_METHODS.has(request.method)) {
      return next.handle();
    }

    const rawIp = request.headers['x-forwarded-for'] ?? request.ip ?? 'unknown';
    // CNIL: IP jamais stockée en clair — SHA-256 obligatoire
    const ipHash = crypto.createHash('sha256').update(rawIp).digest('hex');
    const userId = request.user?.id;
    const action = `${request.method} ${request.url}`;

    return next.handle().pipe(
      tap(() => {
        void this.auditService.log({
          userId,
          action,
          resource: request.url,
          ipHash,
        });
      }),
    );
  }
}
