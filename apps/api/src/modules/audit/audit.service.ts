import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { AuditLog } from './audit-log.entity';

export interface AuditEntry {
  userId?:     string | null;
  action:      string;
  resource?:   string;
  resourceId?: string;
  ip?:         string;   // raw IP — jamais stockée, hashée dans ce service
  userAgent?:  string;   // raw UA — jamais stockée, hashée dans ce service
  metadata?:   Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  // CNIL: hash SHA-256 — l'IP brute n'est jamais persistée
  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  async log(entry: AuditEntry): Promise<void> {
    try {
      const log = this.repo.create({
        userId:        entry.userId ?? null,
        action:        entry.action,
        resource:      entry.resource ?? null,
        resourceId:    entry.resourceId ?? null,
        ipHash:        entry.ip        ? this.hash(entry.ip)        : null,
        userAgentHash: entry.userAgent ? this.hash(entry.userAgent) : null,
        metadata:      entry.metadata ?? {},
      });
      await this.repo.save(log);
    } catch {
      // Audit non-bloquant — une erreur d'audit ne doit pas faire échouer la requête
    }
  }
}
