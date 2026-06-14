import { Module } from '@nestjs/common';
import { SandboxService } from './sandbox.service';
import { SandboxController } from './sandbox.controller';
import { SandboxGateway } from './sandbox.gateway';
import { RedisModule } from '../../shared/redis/redis.module';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [RedisModule, ProgressModule],
  providers: [SandboxService, SandboxGateway],
  controllers: [SandboxController],
})
export class SandboxModule {}
