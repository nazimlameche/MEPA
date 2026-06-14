import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
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
import { AIModule } from './shared/ai/ai.module';
import { PromptingModule } from './modules/prompting/prompting.module';
import { UserEntity } from './modules/users/entities/user.entity';
import { Course } from './modules/courses/entities/course.entity';
import { AuditLog } from './modules/audit/audit-log.entity';
import { UserProgress } from './modules/progress/user-progress.entity';
import { UserStats } from './modules/progress/user-stats.entity';
import { QuizAttempt } from './modules/prompting/quiz-attempt.entity';
import { AuditInterceptor } from './core/interceptors/audit.interceptor';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:    true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type:        'postgres',
        url:         config.getOrThrow<string>('DATABASE_URL'),
        entities:    [UserEntity, Course, AuditLog, UserProgress, UserStats, QuizAttempt],
        synchronize: config.get('NODE_ENV') === 'development',
        logging:     config.get('NODE_ENV') === 'development',
        ssl:         config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
    ModuleRegistryModule,
    DatabaseModule,
    RedisModule,
    AIModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    ProgressModule,
    PromptingModule,
    SandboxModule,
    CustomCourseModule,
    AuditModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide:  APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
