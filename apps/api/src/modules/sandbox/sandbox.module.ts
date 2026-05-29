import { Module } from '@nestjs/common';
import { SandboxService } from './sandbox.service';
import { SandboxController } from './sandbox.controller';
import { SandboxGateway } from './sandbox.gateway';
import { MistralModule } from '../../shared/mistral/mistral.module';
import { RedisModule } from '../../shared/redis/redis.module';

@Module({
  imports: [MistralModule, RedisModule],
  providers: [SandboxService, SandboxGateway],
  controllers: [SandboxController],
})
export class SandboxModule {}
