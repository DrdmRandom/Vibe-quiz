import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, QuizzesModule, SessionsModule],
  providers: [PrismaService],
})
export class AppModule {}
