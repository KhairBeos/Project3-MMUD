import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { RoomsModule } from '../rooms/rooms.module';
import { MessagesModule } from '../messages/messages.module';
import { GatewaysModule } from '../gateways/gateways.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    RoomsModule,
    MessagesModule,
    GatewaysModule,
    // CallModule,
  ],
})
export class ChatModule {}