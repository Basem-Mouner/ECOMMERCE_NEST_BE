import { OnModuleInit, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Types } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { Auth } from 'src/common/decorators/auth.compose.decorator';
import { AuthenticationGuard } from 'src/common/guard/authentication/authentication.guard';
import { TokenService } from 'src/common/security/service/token.service';
import {
  RoleTypes,
  socketUserConnections,
  UserDocument,
} from 'src/DB/models/user.model';
export interface IClientAuthSocket extends Socket {
  user: UserDocument;
}

@WebSocketGateway(
  // 3000, // Port number
  {
    transports: ['websocket'],
    cors: { origin: '*' },
    namespace: 'chat',
  },
)
export class RealTimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server; // Server instance equivalent to io in socket.io
  constructor(private tokenService: TokenService) {}
  // onModuleInit() {
  //   this.server.on('connection', (socket: Socket) => {
  //     console.log('Client connected:', socket.id);
  //     socket.on('disconnect', () => {
  //       console.log('Client disconnected:', socket.id);
  //     });
  //   });
  // }

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized start chat');
  }
  destructAuthorization(client: Socket): string {
    return (
      client.handshake.auth?.authorization ||
      client.handshake.headers?.authorization
    );
  }
  async handleConnection(client: Socket): Promise<void> {
    try {
      console.log('Client connected:', client.id);
      const authorization: string = this.destructAuthorization(client);
      console.log({ authorization });
      const user = await this.tokenService.verify({ authorization });
      console.log({ user });
      client['user'] = user;
      socketUserConnections.set(user._id.toString(), client.id);
      console.log({ socketUserConnections });
    } catch (error) {
      const err = error as Error;
      client.emit('exception', err.message || 'Unauthorized fail to connect');
    }
  }
  handleDisconnect(client: IClientAuthSocket) {
    console.log('Client disconnected:', client.id);
    socketUserConnections.delete(client.user._id.toString());
  }

  @Auth([RoleTypes.user])
  @SubscribeMessage('sayHi') //EVENT NAME  sayHi
  sayHi(@MessageBody() body: any, @ConnectedSocket() client: Socket): void {
    try {
      console.log('Client connected');
      console.log('Body:', body);
      // this.server.emit('sayHi', { message: 'Hello from server' }); // Emit to all clients
      client.emit('sayHi', { message: 'Hello from server' }); // Emit to the specific client
      // client.broadcast.emit('sayHi', { message: 'Hello from server' }); // Emit to all clients except the sender
      // this.server.to(client.id).emit('sayHi', { message: 'Hello from server' }); // Emit to the specific client
    } catch (error) {
      const err = error as Error;
      client.emit('exception', err.message || 'fail');
    }
  }
  emitSocketChanges(
    data:
      | { productId: Types.ObjectId; quantity: number }
      | { productId: Types.ObjectId; quantity: number }[],
  ): void {
    try {
      this.server.emit('stockChanges', data);
    } catch (error) {
      const err = error as Error;
      this.server.emit('exception', err.message || 'fail');
    }
  }
}
//   handleConnection(client: any, ...args: any[]) {
//     console.log('Client connected:', client.id);
//   }

//   handleDisconnect(client: any) {
//     console.log('Client disconnected:', client.id);
//   }

//   handleMessage(client: any, message: string) {
//     console.log('Message received from client:', message);
//     client.send(`Server received your message: ${message}`);
//   }
