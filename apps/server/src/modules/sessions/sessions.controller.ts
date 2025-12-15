import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private sessions: SessionsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Req() req: any, @Body() body: { quizId: string }) {
    return this.sessions.createSession(req.user.userId, body.quizId);
  }

  @Get(':pin/results')
  async download(@Param('pin') pin: string) {
    const { session, answers } = await this.sessions.downloadResults(pin);
    return { session, answers };
  }
}
