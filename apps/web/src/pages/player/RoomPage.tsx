import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useToast } from '../../components/ToastProvider';

export default function RoomPage() {
  const { pin } = useParams();
  const [params] = useSearchParams();
  const nickname = params.get('nickname') || 'Player';
  const [socket, setSocket] = useState<Socket | null>(null);
  const [question, setQuestion] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const s = io('/session');
    setSocket(s);
    s.emit('player:join', { pin, nickname });
    s.on('session:question', setQuestion);
    s.on('session:leaderboard', (payload) => setLeaderboard(payload.leaderboard));
    s.on('session:reveal', () => toast({ title: 'Reveal', description: 'Check the correct answer' }));
    s.on('session:ended', () => navigate(`/room/${pin}/results`));
    s.on('player:joined', (data) => localStorage.setItem(`reconnect-${pin}`, data.reconnectToken));
    return () => {
      s.disconnect();
    };
  }, [pin, nickname]);

  const answer = (choiceId: string) => {
    if (!socket || !question) return;
    socket.emit('player:answer', { pin, questionId: question.questionId, choiceId, answerMs: 5000 });
    toast({ title: 'Answer sent' });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Room {pin}</h1>
      {question ? (
        <div className="bg-slate-900 border border-slate-800 rounded p-4 space-y-3">
          <p className="font-semibold">{question.text}</p>
          <div className="grid grid-cols-2 gap-2">
            {question.choices.map((c: any) => (
              <button key={c.id} onClick={() => answer(c.id)} className="bg-slate-800 rounded p-3 text-left">
                {c.text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p>Waiting for host...</p>
      )}
      {leaderboard.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded p-3">
          <p className="font-semibold mb-2">Leaderboard</p>
          <ul className="space-y-1 text-sm">
            {leaderboard.map((p, idx) => (
              <li key={p.nickname} className="flex justify-between">
                <span>
                  {idx + 1}. {p.nickname}
                </span>
                <span>{p.totalPoints} pts</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
