import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsGateway } from './sessions.gateway';
import { SessionsController } from './sessions.controller';
import { PrismaService } from '../../common/prisma.service';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [QuizzesModule, AuthModule],
  providers: [SessionsService, SessionsGateway, PrismaService],
  controllers: [SessionsController],
})
export class SessionsModule {}
