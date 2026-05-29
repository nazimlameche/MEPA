import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { AIProvider } from '@ai-edu/shared';
import { AI_PROVIDER } from './ai-provider.token';
import { GeminiProvider } from './providers/gemini.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AI_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): AIProvider =>
        new GeminiProvider(
          config.getOrThrow<string>('GEMINI_API_KEY'),
          config.get<string>('GEMINI_MODEL') ?? 'gemini-2.0-flash',
        ),
    },
  ],
  exports: [AI_PROVIDER],
})
export class AIModule {}
