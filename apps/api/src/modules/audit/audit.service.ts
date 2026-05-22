import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';

interface AuditEntry {
  userId?: string;
  action: string;
  resource: string;
  /** CNIL: always SHA-256 hash — never the raw IP */
  ipHash: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.dataSource.query(
        `INSERT INTO audit_logs (user_id, action, resource, ip_hash, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [entry.userId ?? null, entry.action, entry.resource, entry.ipHash],
      );
    } catch {
      // Audit log failure must never crash the main request
    }
  }
}
