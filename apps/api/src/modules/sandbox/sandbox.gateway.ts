import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { SandboxService } from './sandbox.service';

interface AuthenticatedSocket extends Socket {
  data: { userId: string };
}

@WebSocketGateway({ namespace: '/sandbox', cors: { origin: '*' } })
export class SandboxGateway {
  constructor(private readonly sandboxService: SandboxService) {}

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: { content: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    const userId = client.data.userId;
    if (!userId) throw new WsException('Non authentifié');

    try {
      const result = await this.sandboxService.sendMessage(userId, data.content);
      client.emit('reply', result);
    } catch {
      client.emit('error', { message: 'Erreur lors du traitement du message' });
    }
  }
}
