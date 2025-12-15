import { SessionStatus } from '@prisma/client';

export type HostAction = 'start' | 'reveal' | 'next' | 'end';

export function transitionStatus(current: SessionStatus, action: HostAction): SessionStatus {
  switch (action) {
    case 'start':
      return current === SessionStatus.LOBBY ? SessionStatus.RUNNING : current;
    case 'reveal':
      return current === SessionStatus.RUNNING ? SessionStatus.REVEAL : current;
    case 'next':
      return current === SessionStatus.REVEAL ? SessionStatus.RUNNING : current;
    case 'end':
      return SessionStatus.ENDED;
    default:
      return current;
  }
}
