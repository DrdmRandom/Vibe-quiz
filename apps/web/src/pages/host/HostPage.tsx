import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useToast } from '../../components/ToastProvider';
import { io, Socket } from 'socket.io-client';
import { QuizDTO, SessionStatus } from '@vibequiz/shared';

export default function HostPage() {
  const [quizzes, setQuizzes] = useState<QuizDTO[]>([]);
  const [pin, setPin] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const toast = useToast();

  const bindSocketEvents = (s: Socket) => {
    s.on('session:lobbyState', (payload) => {
      setPin(payload.pin);
      setStatus('LOBBY');
      toast({ title: 'Session ready', description: `PIN ${payload.pin}`, variant: 'success' });
    });
    s.on('session:question', (q) => {
      setStatus('RUNNING');
      toast({ title: 'Question started', description: q.text });
    });
    s.on('session:reveal', () => {
      setStatus('REVEAL');
      toast({ title: 'Reveal', description: 'Showing results' });
    });
    s.on('session:ended', () => {
      setStatus('ENDED');
      toast({ title: 'Session ended' });
    });
    s.on('connect_error', (err) => {
      toast({ title: 'Socket error', description: err.message, variant: 'error' });
    });
  };

  const getSocket = () => {
    if (socket) return socket;
    const token = localStorage.getItem('token');
    if (!token) {
      toast({ title: 'Login required', description: 'Sign in as admin to host', variant: 'error' });
      return null;
    }
    const s = io('/session', { auth: { token } });
    bindSocketEvents(s);
    setSocket(s);
    return s;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const s = io('/session', { auth: { token } });
    bindSocketEvents(s);
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    api
      .get('/quizzes')
      .then((res) => setQuizzes(res.data))
      .catch((err) => toast({ title: 'Failed to load quizzes', description: err.response?.data?.message, variant: 'error' }));
  }, []);

  const createSession = (quizId: string) => {
    const s = getSocket();
    if (!s) return;
    s.emit('host:createSession', { quizId });
  };

  const start = () => pin && socket?.emit('host:startSession', { pin });
  const reveal = () => pin && socket?.emit('host:revealNow', { pin });
  const next = () => pin && socket?.emit('host:nextQuestion', { pin });
  const end = () => pin && socket?.emit('host:endSession', { pin });
  const copyPin = async () => {
    if (!pin) return;
    await navigator.clipboard.writeText(pin);
    toast({ title: 'PIN copied', description: pin, variant: 'success' });
  };

  if (!localStorage.getItem('token')) {
    return <p className="text-sm text-slate-200">Sign in as an admin to host a session.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Host control</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {quizzes.map((q) => (
          <button
            key={q.id}
            onClick={() => createSession(q.id)}
            className="bg-slate-900 border border-slate-800 rounded p-3 text-left hover:border-lime-400 transition"
          >
            <p className="font-semibold">{q.title}</p>
            <p className="text-sm text-slate-300">{q.description}</p>
          </button>
        ))}
      </div>
      {pin && (
        <div className="bg-slate-900 border border-slate-800 rounded p-4 space-y-3">
          <div className="flex items-center gap-3">
            <p className="text-lg font-semibold">PIN: {pin}</p>
            <button onClick={copyPin} className="text-sm bg-slate-800 px-3 py-1 rounded border border-slate-700">
              Copy
            </button>
          </div>
          <p className="text-sm text-slate-300">Status: {status ?? 'LOBBY'}</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={start} className="bg-lime-500 text-black px-3 py-2 rounded" disabled={!pin}>
              Start
            </button>
            <button onClick={reveal} className="bg-blue-500 text-white px-3 py-2 rounded" disabled={!pin}>
              Reveal
            </button>
            <button onClick={next} className="bg-amber-500 text-black px-3 py-2 rounded" disabled={!pin}>
              Next
            </button>
            <button onClick={end} className="bg-red-500 text-white px-3 py-2 rounded" disabled={!pin}>
              End
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
