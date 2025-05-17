import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadX } from 'src/auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessageWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messageWsService: MessageWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authorization || '';
    let payload: JwtPayloadX;

    try {
      payload = this.jwtService.verify(token);
      await this.messageWsService.registerClient(client, payload.id);
    } catch (error) {
      console.error(error);
      client.disconnect();
      return;
    }

    this.wss.emit(
      'clients-updated',
      this.messageWsService.getConnectedClients(),
    );

    //! ------------ CONSOLE LOGS ------------
    //? SHOW CLIENT - SOCKET console.log("🚀 ~ handleConnection ~ client:", client)
    console.log({
      users_connected_ids: this.messageWsService.getConnectedClients(),
    });
    //! ------------- ------------- -------------
  }

  handleDisconnect(client: Socket) {
    this.messageWsService.removeClient(client.id);
  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto) {
    console.log('-----AAA----\n', { payload, clientId: client.id });

    //! ONLY SEND TO THE CLIENT THAT SENT THE MESSAGE
    /* client.emit('message-from-server', {
      fullName: client.id,
      message: payload.message || 'No message',
    }); */

    //! SEND TO ALL CLIENTS EXCEPT THE ONE THAT SENT THE MESSAGE
    /* client.broadcast.emit('message-from-server', {
      fullName: client.id,
      message: payload.message || 'No message',
    }); */

    //! SEND TO ALL CLIENTS INCLUDING THE ONE THAT SENT THE MESSAGE
    this.wss.emit('message-from-server', {
      fullName: this.messageWsService.getUserFullName(client.id),
      message: payload.message || 'No message',
    });
  }
}

// Doc. WebSockets: https://docs.nestjs.com/websockets/gateways
