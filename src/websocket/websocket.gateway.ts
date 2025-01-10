import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class WebSocketGatewayService
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log('Client connected to WebSocket.');
  }

  handleDisconnect(client: any) {
    console.log('Client disconnected from WebSocket.');
  }

  broadcast(event: string, payload: any) {
    this.server.emit(event, payload);
  }
}
