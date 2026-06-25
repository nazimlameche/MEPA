import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AikoService } from './aiko.service';
import { AikoChatDto } from './dto/aiko-chat.dto';
import { JwtAuthGuard } from '../../core/guards/auth.guard';

interface JwtRequest {
  user: { id: string };
}

@Controller('aiko')
@UseGuards(JwtAuthGuard)
export class AikoController {
  constructor(private readonly aikoService: AikoService) {}

  @Post('chat')
  chat(@Request() req: JwtRequest, @Body() dto: AikoChatDto) {
    return this.aikoService.chat(req.user.id, dto.messages, dto.context);
  }
}
