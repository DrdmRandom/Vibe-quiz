'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function HomePage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || !name) {
      toast.error('Enter a PIN and name to join');
      return;
    }
    router.push(`/play?pin=${encodeURIComponent(pin)}&name=${encodeURIComponent(name)}`);
  };

  return (
    <main className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
      <div className="card p-6 lg:p-8">
        <div className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-wide text-secondary">Lightning fast</p>
          <h2 className="text-3xl font-bold text-white">Host parties, classes, and remote hangouts.</h2>
          <p className="text-lg text-slate-300">
            Vibe Quiz blends real-time sockets with a clean, mobile-friendly UI. Create quizzes, share the PIN,
            and keep everyone synced with live scoreboards.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/host" className="btn">Host a Game</Link>
            <Link href="/admin" className="btn bg-white/10 text-white hover:scale-[1.02]">
              Build a Quiz
            </Link>
          </div>
        </div>
      </div>

      <div className="card p-6 lg:p-8">
        <h3 className="section-title mb-4">Jump into a game</h3>
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <div>
            <label className="label" htmlFor="pin">Game PIN</label>
            <input
              id="pin"
              className="input mt-2"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="123456"
            />
          </div>
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input
              id="name"
              className="input mt-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Player1"
            />
          </div>
          <button className="btn w-full" type="submit">Join a Game</button>
          <p className="text-sm text-slate-400">
            Works great on phones. Share the PIN and use the Player view to answer as soon as questions drop.
          </p>
        </form>
      </div>
    </main>
  );
}
