'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useSocket } from '@/hooks/useSocket';
import type { QuestionForm, RevealPayload, ScoreboardEntry } from '@/lib/types';

export default function PlayerPage() {
  const search = useSearchParams();
  const initialPin = search.get('pin') ?? '';
  const initialName = search.get('name') ?? '';
  const [pin, setPin] = useState(initialPin);
  const [name, setName] = useState(initialName);
  const [joined, setJoined] = useState(false);
  const socket = useSocket('', pin.length > 0);
  const [question, setQuestion] = useState<QuestionForm | null>(null);
  const [reveal, setReveal] = useState<RevealPayload | null>(null);
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]);
  const [answerIndex, setAnswerIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<'form' | 'waiting' | 'answering' | 'ended'>('form');

  const disabled = useMemo(() => answerIndex !== null || status === 'waiting', [answerIndex, status]);

  useEffect(() => {
    if (!socket) return;

    socket.on('game:question', (q: QuestionForm) => {
      setQuestion(q);
      setReveal(null);
      setAnswerIndex(null);
      setStatus('answering');
    });

    socket.on('game:reveal', (payload: RevealPayload) => {
      setReveal(payload);
      setStatus('waiting');
    });

    socket.on('game:scoreboard', (entries: ScoreboardEntry[]) => setScoreboard(entries));

    socket.on('game:ended', () => {
      setStatus('ended');
      toast('Game finished');
    });

    socket.on('room:update', () => {
      toast.success('Joined room');
      setStatus('waiting');
      setJoined(true);
    });

    socket.on('connect_error', (err) => {
      toast.error(err.message || 'Unable to connect');
      setStatus('form');
    });

    return () => {
      socket.off('game:question');
      socket.off('game:reveal');
      socket.off('game:scoreboard');
      socket.off('room:update');
      socket.off('game:ended');
      socket.off('connect_error');
    };
  }, [socket]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || !name) {
      toast.error('Enter a PIN and name');
      return;
    }
    if (!socket) return;
    socket.emit('player:join', { pin, name }, (ack: { error?: string }) => {
      if (ack?.error) {
        toast.error(ack.error);
        setStatus('form');
        return;
      }
      setJoined(true);
      setStatus('waiting');
    });
  };

  const sendAnswer = (choiceIndex: number) => {
    if (!socket || !question) return;
    setAnswerIndex(choiceIndex);
    socket.emit('player:answer', { pin, answerIndex: choiceIndex }, (ack: { error?: string }) => {
      if (ack?.error) toast.error(ack.error);
    });
  };

  const currentRank = scoreboard.find((s) => s.name === name)?.rank;

  return (
    <main className="card p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-secondary">Player</p>
        <h2 className="text-2xl font-semibold text-white">Join and answer fast</h2>
      </div>

      <form onSubmit={handleJoin} className="grid gap-4 md:grid-cols-3 md:items-end">
        <div>
          <label className="label">PIN</label>
          <input
            className="input mt-2"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="123456"
          />
        </div>
        <div>
          <label className="label">Name</label>
          <input
            className="input mt-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <button type="submit" className="btn" disabled={joined && status !== 'form'}>
          {joined ? 'Update name' : 'Join game'}
        </button>
      </form>

      {status === 'waiting' && <p className="text-slate-300">Waiting for host...</p>}

      {question && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-slate-300">Time left: {question.timeLimit}s</p>
            {currentRank && <span className="rounded-full bg-white/10 px-3 py-1 text-xs">Rank #{currentRank}</span>}
          </div>
          <h3 className="text-xl font-semibold text-white">{question.prompt}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {question.choices.map((choice, idx) => (
              <button
                key={idx}
                className={`btn w-full py-5 text-left text-lg sm:py-6 ${
                  answerIndex === idx ? 'bg-secondary text-slate-900' : ''
                }`}
                type="button"
                disabled={disabled}
                onClick={() => sendAnswer(idx)}
              >
                {choice || `Choice ${idx + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {reveal && (
        <div className="space-y-3">
          <p className="label">Reveal</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {question?.choices.map((choice, idx) => (
              <div
                key={idx}
                className={`card p-3 ${reveal.correctIndex === idx ? 'border-secondary text-secondary' : ''}`}
              >
                <p className="text-sm font-semibold">{choice}</p>
                <p className="text-xs text-slate-300">{reveal.answerCounts[idx] || 0} answers</p>
              </div>
            ))}
          </div>
          <div className="card border-white/5 bg-white/5 p-3">
            <p className="text-sm text-slate-300">Points and leaderboard</p>
            <div className="mt-2 space-y-1">
              {scoreboard.map((entry, idx) => (
                <div key={entry.name + idx} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="rounded bg-white/10 px-2 py-1 text-xs">#{entry.rank ?? idx + 1}</span>
                    {entry.name}
                  </span>
                  <span className="text-secondary">{entry.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {status === 'ended' && <p className="text-slate-300">Game ended. Check the final leaderboard above.</p>}
    </main>
  );
}
