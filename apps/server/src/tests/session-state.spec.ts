import { SessionStatus } from '@prisma/client';
import { transitionStatus } from '../modules/sessions/state-machine';

describe('session state transitions', () => {
  it('follows LOBBY -> RUNNING -> REVEAL -> RUNNING -> ENDED', () => {
    let status: SessionStatus = SessionStatus.LOBBY;
    status = transitionStatus(status, 'start');
    expect(status).toBe(SessionStatus.RUNNING);
    status = transitionStatus(status, 'reveal');
    expect(status).toBe(SessionStatus.REVEAL);
    status = transitionStatus(status, 'next');
    expect(status).toBe(SessionStatus.RUNNING);
    status = transitionStatus(status, 'end');
    expect(status).toBe(SessionStatus.ENDED);
  });
});
