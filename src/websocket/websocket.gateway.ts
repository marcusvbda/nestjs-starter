import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'events',
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private clients: string[] = [];

  handleConnection(client: Socket) {
    console.log(`✅ User ${client.id} connected to events namespace`);
    this.clients.push(client.id);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ User ${client.id} desconectado`);
    this.clients = this.clients.filter((id) => id !== client.id);
  }

  @SubscribeMessage('message')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    console.log('Mensagem recebida de', client.id, data);
    return { event: 'message', data: `Olá ${data.name}!` };
  }

  sendEventToUser(clientId: string, payload: any) {
    this.server.to(clientId).emit('event', payload);
  }
}
