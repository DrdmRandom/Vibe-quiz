import { Module } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { PrismaService } from '../../common/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [JwtModule.register({}), AuthModule],
  controllers: [QuizzesController],
  providers: [QuizzesService, PrismaService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
