import { Module } from '@nestjs/common';
import { AikoService } from './aiko.service';
import { AikoController } from './aiko.controller';
import { RedisModule } from '../../shared/redis/redis.module';

@Module({
  imports:     [RedisModule],
  providers:   [AikoService],
  controllers: [AikoController],
})
export class AikoModule {}
