import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SandboxService } from './sandbox.service';
import { SandboxController } from './sandbox.controller';
import { SandboxGateway } from './sandbox.gateway';
import { UserEntity } from '../users/entities/user.entity';
import { MistralModule } from '../../shared/mistral/mistral.module';
import { RedisModule } from '../../shared/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), MistralModule, RedisModule],
  providers: [SandboxService, SandboxGateway],
  controllers: [SandboxController],
})
export class SandboxModule {}
