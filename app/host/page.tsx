'use client';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { API_URL } from '@/lib/config';
import { useSocket } from '@/hooks/useSocket';
import type { QuestionForm, Quiz, RevealPayload, RoomState, ScoreboardEntry } from '@/lib/types';

export default function HostPage() {
  const socket = useSocket();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [room, setRoom] = useState<RoomState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionForm | null>(null);
  const [reveal, setReveal] = useState<RevealPayload | null>(null);
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]);
  const [status, setStatus] = useState<'idle' | 'lobby' | 'in-game' | 'ended'>('idle');
  const joinUrl = useMemo(() => (room ? `${typeof window !== 'undefined' ? window.location.origin : ''}/play?pin=${room.pin}` : ''), [room]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch(`${API_URL}/api/quizzes`);
        if (!res.ok) throw new Error('Failed to fetch quizzes');
        const data = await res.json();
        setQuizzes(data);
      } catch (error) {
        toast.error((error as Error).message);
      }
    };
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('room:update', (payload: RoomState) => {
      setRoom(payload);
      setStatus('lobby');
    });

    socket.on('game:question', (q: QuestionForm) => {
      setCurrentQuestion(q);
      setReveal(null);
      setStatus('in-game');
    });

    socket.on('game:reveal', (payload: RevealPayload) => {
      setReveal(payload);
    });

    socket.on('game:scoreboard', (entries: ScoreboardEntry[]) => {
      setScoreboard(entries);
    });

    socket.on('game:ended', () => {
      setStatus('ended');
      toast('Game ended');
    });

    return () => {
      socket.off('room:update');
      socket.off('game:question');
      socket.off('game:reveal');
      socket.off('game:scoreboard');
      socket.off('game:ended');
    };
  }, [socket]);

  const emitWithToast = (event: string, payload?: any) => {
    if (!socket) return;
    socket.emit(event, payload, (ack: { error?: string }) => {
      if (ack?.error) toast.error(ack.error);
    });
  };

  const createRoom = () => {
    if (!selectedQuiz) {
      toast.error('Select a quiz first');
      return;
    }
    emitWithToast('host:create_room', { quizId: selectedQuiz });
  };

  const startGame = () => emitWithToast('host:start');
  const nextQuestion = () => emitWithToast('host:next_question');
  const endGame = () => emitWithToast('host:end');

  const copyLink = async () => {
    if (!joinUrl) return;
    await navigator.clipboard.writeText(joinUrl);
    toast.success('Join link copied');
  };

  return (
    <main className="grid-panel">
      <section className="card p-6 lg:p-8 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="section-title">Host Console</h2>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">Socket live</span>
        </div>

        <div className="space-y-2">
          <label className="label">Quiz</label>
          <select
            className="input"
            value={selectedQuiz}
            onChange={(e) => setSelectedQuiz(e.target.value)}
          >
            <option value="">Select a quiz</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.title}
              </option>
            ))}
          </select>
          <button className="btn w-full" onClick={createRoom}>
            👥 Create room
          </button>
        </div>

        {room && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card border-white/5 bg-white/5 p-4">
              <p className="label">PIN</p>
              <p className="text-3xl font-bold text-white">{room.pin}</p>
            </div>
            <div className="card border-white/5 bg-white/5 p-4">
              <p className="label">Join link</p>
              <div className="flex items-center gap-2">
                <span className="truncate text-sm text-slate-200">{joinUrl}</span>
                <button className="btn px-3 py-2" onClick={copyLink}>
                  📋
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button className="btn bg-green-500" onClick={startGame}>
            ▶️ Start game
          </button>
          <button className="btn bg-sky-500" onClick={nextQuestion}>
            ⏭️ Next question
          </button>
          <button className="btn bg-red-600" onClick={endGame}>
            ⏹️ End game
          </button>
        </div>

        <div>
          <p className="label">Players</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {room?.players?.map((player) => (
              <div key={player.id} className="card border-white/5 bg-white/10 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{player.name}</span>
                  <span className="text-secondary">{player.score} pts</span>
                </div>
              </div>
            )) || <p className="text-slate-400">No players yet.</p>}
          </div>
        </div>
      </section>

      <section className="card p-6 lg:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="section-title">Live game</h3>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize text-slate-300">{status}</span>
        </div>

        {currentQuestion ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-300">Time: {currentQuestion.timeLimit}s</p>
            <p className="text-xl font-semibold text-white">{currentQuestion.prompt}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {currentQuestion.choices.map((choice, idx) => (
                <div key={idx} className="card border-white/5 bg-white/5 p-3">
                  <p className="text-sm text-slate-200">{choice}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-slate-400">No question live. Start the game to begin.</p>
        )}

        {reveal && (
          <div className="space-y-3">
            <p className="label">Reveal</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {currentQuestion?.choices.map((choice, idx) => (
                <div
                  key={idx}
                  className={`card p-3 ${reveal.correctIndex === idx ? 'border-secondary text-secondary' : ''}`}
                >
                  <p className="text-sm font-semibold">{choice}</p>
                  <p className="text-xs text-slate-300">{reveal.answerCounts[idx] || 0} answers</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="label">Scoreboard</p>
          <div className="mt-3 space-y-2">
            {scoreboard.length === 0 && <p className="text-slate-400">No scores yet.</p>}
            {scoreboard.map((entry, idx) => (
              <div key={entry.name + idx} className="card border-white/5 bg-white/5 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-white/10 px-2 py-1 text-xs">#{entry.rank ?? idx + 1}</span>
                    <p className="font-semibold text-white">{entry.name}</p>
                  </div>
                  <p className="text-secondary">{entry.score} pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
