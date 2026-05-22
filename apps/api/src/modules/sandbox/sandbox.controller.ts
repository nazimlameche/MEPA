import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { IsString, MinLength, MaxLength } from 'class-validator';
import { SandboxService } from './sandbox.service';
import { JwtAuthGuard } from '../../core/guards/auth.guard';

class SendMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;
}

interface JwtRequest {
  user: { id: string };
}

@Controller('sandbox')
@UseGuards(JwtAuthGuard)
export class SandboxController {
  constructor(private readonly sandboxService: SandboxService) {}

  @Post('message')
  sendMessage(@Request() req: JwtRequest, @Body() dto: SendMessageDto) {
    return this.sandboxService.sendMessage(req.user.id, dto.content);
  }
}
