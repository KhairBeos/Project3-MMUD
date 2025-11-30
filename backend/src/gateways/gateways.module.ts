import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
  imports: [UsersModule, AuthModule, MessagesModule],
  providers: [ChatGateway],
})
export class GatewaysModule {}
