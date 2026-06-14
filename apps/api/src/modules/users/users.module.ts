import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserEntity } from './entities/user.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports:     [TypeOrmModule.forFeature([UserEntity]), AuditModule],
  providers:   [UsersService],
  controllers: [UsersController],
  exports:     [UsersService],
})
export class UsersModule {}
