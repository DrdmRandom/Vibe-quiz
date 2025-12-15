import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SessionsService } from './sessions.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({ namespace: '/session', cors: { origin: '*' } })
export class SessionsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private sessions: SessionsService, private jwt: JwtService, private config: ConfigService) {}

  async handleConnection(client: Socket) {
    // keep track
    client.emit('connected');
  }

  @SubscribeMessage('host:createSession')
  async create(@ConnectedSocket() client: any, @MessageBody() body: { quizId: string }) {
    const token = client.handshake.auth?.token as string | undefined;
    const decoded: any = token ? this.jwt.verify(token, { secret: this.config.get<string>('JWT_SECRET', 'changeme') }) : null;
    if (!decoded?.sub) throw new Error('Unauthorized');
    const res = await this.sessions.createSession(decoded.sub, body.quizId);
    client.emit('session:lobbyState', { pin: res.pin, players: [] });
  }

  @SubscribeMessage('player:join')
  async join(@ConnectedSocket() client: Socket, @MessageBody() body: { pin: string; nickname: string }) {
    const player = await this.sessions.addPlayer(body.pin, body.nickname);
    client.data.playerId = player.id;
    client.join(body.pin);
    this.server.to(body.pin).emit('session:lobbyState', { pin: body.pin, players: await this.sessions.getLeaderboard(body.pin) });
    client.emit('player:joined', { reconnectToken: player.reconnectToken, playerId: player.id });
  }

  @SubscribeMessage('player:reconnect')
  async reconnect(@ConnectedSocket() client: Socket, @MessageBody() body: { pin: string; reconnectToken: string }) {
    const player = await this.sessions.reconnectPlayer(body.pin, body.reconnectToken);
    client.data.playerId = player.id;
    client.join(body.pin);
    client.emit('player:joined', { reconnectToken: player.reconnectToken, playerId: player.id });
  }

  @SubscribeMessage('host:startSession')
  async start(@MessageBody() body: { pin: string }) {
    const q = await this.sessions.startSession(body.pin);
    if ('question' in q) {
      this.server.to(body.pin).emit('session:question', {
        questionId: q.question.id,
        text: q.question.text,
        choices: q.question.choices.map((c) => ({ id: c.id, text: c.text })),
        durationMs: q.durationMs,
        startedAt: q.startedAt,
      });
    }
  }

  @SubscribeMessage('host:revealNow')
  async reveal(@MessageBody() body: { pin: string }) {
    const res = await this.sessions.revealNow(body.pin);
    this.server.to(body.pin).emit('session:reveal', res);
    const leaderboard = await this.sessions.getLeaderboard(body.pin, 10);
    this.server.to(body.pin).emit('session:leaderboard', { leaderboard, status: 'REVEAL' });
  }

  @SubscribeMessage('host:nextQuestion')
  async next(@MessageBody() body: { pin: string }) {
    const q = await this.sessions.nextQuestion(body.pin);
    if ('question' in q) {
      this.server.to(body.pin).emit('session:question', {
        questionId: q.question.id,
        text: q.question.text,
        choices: q.question.choices.map((c) => ({ id: c.id, text: c.text })),
        durationMs: q.durationMs,
        startedAt: q.startedAt,
      });
    } else {
      const leaderboard = await this.sessions.getLeaderboard(body.pin, 10);
      this.server.to(body.pin).emit('session:ended', { finalLeaderboard: leaderboard, downloadableResultsUrl: `/api/sessions/${body.pin}/results` });
    }
  }

  @SubscribeMessage('host:endSession')
  async end(@MessageBody() body: { pin: string }) {
    await this.sessions.endSession(body.pin);
    const leaderboard = await this.sessions.getLeaderboard(body.pin, 10);
    this.server.to(body.pin).emit('session:ended', { finalLeaderboard: leaderboard, downloadableResultsUrl: `/api/sessions/${body.pin}/results` });
  }

  @SubscribeMessage('player:answer')
  async answer(@ConnectedSocket() client: Socket, @MessageBody() body: { pin: string; questionId: string; choiceId: string; answerMs?: number }) {
    const playerId = client.data.playerId as string;
    const result = await this.sessions.recordAnswer(body.pin, playerId, body.questionId, body.choiceId, body.answerMs ?? 0);
    client.emit('player:answer:result', result);
    const leaderboard = await this.sessions.getLeaderboard(body.pin, 10);
    this.server.to(body.pin).emit('session:leaderboard', { leaderboard, status: 'RUNNING' });
  }
}
