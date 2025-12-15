import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../lib/api';
import { useToast } from '../components/ToastProvider';

type Tab = 'play' | 'admin';

export default function LandingPage({ initialTab }: { initialTab?: Tab }) {
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();
  const [pin, setPin] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('host@example.com');
  const [password, setPassword] = useState('password123');

  const derivedInitialTab = useMemo<Tab>(() => {
    if (initialTab) return initialTab;
    if (location.pathname.includes('admin')) return 'admin';
    return 'play';
  }, [initialTab, location.pathname]);

  const [tab, setTab] = useState<Tab>(derivedInitialTab);

  useEffect(() => {
    setTab(derivedInitialTab);
  }, [derivedInitialTab]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || !nickname) {
      toast({ title: 'Enter PIN and nickname', variant: 'error' });
      return;
    }
    navigate(`/room/${pin}?nickname=${encodeURIComponent(nickname)}`);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.accessToken);
      setAuthToken(res.data.accessToken);
      window.dispatchEvent(new Event('auth-changed'));
      toast({ title: 'Logged in', description: 'Welcome back', variant: 'success' });
      navigate('/admin/quizzes');
    } catch (err: any) {
      toast({ title: 'Login failed', description: err.response?.data?.message ?? 'Check credentials', variant: 'error' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex gap-3">
        <button
          onClick={() => setTab('play')}
          className={`px-4 py-2 rounded ${tab === 'play' ? 'bg-lime-500 text-black' : 'bg-slate-800 text-white'}`}
        >
          Play
        </button>
        <button
          onClick={() => setTab('admin')}
          className={`px-4 py-2 rounded ${tab === 'admin' ? 'bg-lime-500 text-black' : 'bg-slate-800 text-white'}`}
        >
          Admin
        </button>
      </div>

      {tab === 'play' && (
        <div className="bg-slate-900 border border-slate-800 rounded p-6 space-y-4">
          <h1 className="text-2xl font-bold">Join a game</h1>
          <form onSubmit={handleJoin} className="space-y-3">
            <input
              className="w-full p-2 bg-slate-800 rounded"
              placeholder="PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <input
              className="w-full p-2 bg-slate-800 rounded"
              placeholder="Nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <button className="w-full bg-lime-500 text-black rounded py-2 font-semibold" type="submit">
              Join
            </button>
          </form>
        </div>
      )}

      {tab === 'admin' && (
        <div className="bg-slate-900 border border-slate-800 rounded p-6 space-y-4">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              className="w-full p-2 rounded bg-slate-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <input
              className="w-full p-2 rounded bg-slate-800"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <button className="w-full bg-lime-500 text-black rounded py-2 font-semibold" type="submit">
              Sign in
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
