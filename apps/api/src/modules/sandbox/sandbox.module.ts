import { Module } from '@nestjs/common';
import { SandboxService } from './sandbox.service';
import { SandboxController } from './sandbox.controller';
import { SandboxGateway } from './sandbox.gateway';
import { RedisModule } from '../../shared/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [SandboxService, SandboxGateway],
  controllers: [SandboxController],
})
export class SandboxModule {}
