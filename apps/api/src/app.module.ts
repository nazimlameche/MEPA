import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleRegistryModule } from './core/module-registry/module-registry.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { ProgressModule } from './modules/progress/progress.module';
import { SandboxModule } from './modules/sandbox/sandbox.module';
import { CustomCourseModule } from './modules/custom-course/custom-course.module';
import { AuditModule } from './modules/audit/audit.module';
import { DatabaseModule } from './shared/database/database.module';
import { RedisModule } from './shared/redis/redis.module';
import { MistralModule } from './shared/mistral/mistral.module';
import { UserEntity } from './modules/users/entities/user.entity';
import { CourseEntity } from './modules/courses/entities/course.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('DATABASE_URL'),
        entities: [UserEntity, CourseEntity],
        synchronize: config.get('NODE_ENV') === 'development',
        logging: config.get('NODE_ENV') === 'development',
        ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
    ModuleRegistryModule,
    DatabaseModule,
    RedisModule,
    MistralModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    ProgressModule,
    SandboxModule,
    CustomCourseModule,
    AuditModule,
  ],
})
export class AppModule {}
