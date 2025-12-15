import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useToast } from '../../components/ToastProvider';
import { io, Socket } from 'socket.io-client';
import { QuizDTO } from '@vibequiz/shared';

export default function HostPage() {
  const [quizzes, setQuizzes] = useState<QuizDTO[]>([]);
  const [pin, setPin] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const toast = useToast();

  useEffect(() => {
    api.get('/quizzes')
      .then((res) => setQuizzes(res.data))
      .catch((err) => toast({ title: 'Failed to load quizzes', description: err.response?.data?.message, variant: 'error' }));
  }, []);

  const connectSocket = () => {
    const token = localStorage.getItem('token');
    const s = io('/session', { auth: { token } });
    setSocket(s);
    s.on('session:lobbyState', (payload) => {
      setPin(payload.pin);
      toast({ title: 'Session ready', description: `PIN ${payload.pin}`, variant: 'success' });
    });
    s.on('session:question', (q) => toast({ title: 'Question started', description: q.text }));
    s.on('session:reveal', () => toast({ title: 'Reveal', description: 'Showing results' }));
    s.on('session:ended', () => toast({ title: 'Session ended' }));
  };

  const createSession = (quizId: string) => {
    if (!socket) connectSocket();
    const activeSocket = socket ?? io('/session', { auth: { token: localStorage.getItem('token') } });
    activeSocket.emit('host:createSession', { quizId });
    setSocket(activeSocket);
  };

  const start = () => pin && socket?.emit('host:startSession', { pin });
  const reveal = () => pin && socket?.emit('host:revealNow', { pin });
  const next = () => pin && socket?.emit('host:nextQuestion', { pin });
  const end = () => pin && socket?.emit('host:endSession', { pin });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Host control</h1>
      <div className="grid grid-cols-2 gap-2">
        {quizzes.map((q) => (
          <button key={q.id} onClick={() => createSession(q.id)} className="bg-slate-900 border border-slate-800 rounded p-3 text-left">
            <p className="font-semibold">{q.title}</p>
            <p className="text-sm text-slate-300">{q.description}</p>
          </button>
        ))}
      </div>
      {pin && (
        <div className="bg-slate-900 border border-slate-800 rounded p-4 space-y-2">
          <p className="text-lg">PIN: {pin}</p>
          <div className="flex gap-2">
            <button onClick={start} className="bg-lime-500 text-black px-3 py-2 rounded">
              Start
            </button>
            <button onClick={reveal} className="bg-blue-500 text-white px-3 py-2 rounded">
              Reveal
            </button>
            <button onClick={next} className="bg-amber-500 text-black px-3 py-2 rounded">
              Next
            </button>
            <button onClick={end} className="bg-red-500 text-white px-3 py-2 rounded">
              End
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
