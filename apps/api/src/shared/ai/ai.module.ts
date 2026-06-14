import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { AIProvider } from '@ai-edu/shared';
import { AI_PROVIDER } from './ai-provider.token';
import { MistralProvider } from './providers/mistral.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AI_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): AIProvider =>
        new MistralProvider(
          config.getOrThrow<string>('MISTRAL_API_KEY'),
          config.get<string>('MISTRAL_MODEL') ?? 'mistral-small-latest',
        ),
    },
  ],
  exports: [AI_PROVIDER],
})
export class AIModule {}
