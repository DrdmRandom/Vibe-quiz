import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuizzesService } from './quizzes.service';
import { QuizDto } from './dto';

@Controller('quizzes')
@UseGuards(AuthGuard('jwt'))
export class QuizzesController {
  constructor(private quizzes: QuizzesService) {}

  @Get()
  list(@Req() req: any) {
    return this.quizzes.list(req.user.userId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.quizzes.get(id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: QuizDto) {
    return this.quizzes.create(req.user.userId, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Req() req: any, @Body() dto: QuizDto) {
    return this.quizzes.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quizzes.remove(id);
  }
}
