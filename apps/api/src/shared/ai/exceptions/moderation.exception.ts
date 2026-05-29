import { HttpException, HttpStatus } from '@nestjs/common';
import type { ModerationResult } from '@ai-edu/shared';

export class ModerationException extends HttpException {
  constructor(public readonly result: ModerationResult) {
    super(
      {
        message: 'Le contenu a été modéré et ne peut pas être traité',
        moderation: result,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
