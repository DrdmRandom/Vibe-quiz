import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { setAuthToken } from '../lib/api';

export const Layout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [isAuthed, setIsAuthed] = useState<boolean>(!!localStorage.getItem('token'));

  useEffect(() => {
    const applyToken = () => {
      const stored = localStorage.getItem('token') || undefined;
      setAuthToken(stored);
      setIsAuthed(!!stored);
    };

    applyToken();
    window.addEventListener('storage', applyToken);
    window.addEventListener('auth-changed', applyToken as EventListener);
    return () => {
      window.removeEventListener('storage', applyToken);
      window.removeEventListener('auth-changed', applyToken as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-lime-400">
          VibeQuiz
        </Link>
        <nav className="flex gap-4 text-sm text-slate-200">
          <Link to={location.pathname.startsWith('/room') ? location.pathname : '/'} className="hover:text-white">
            Play
          </Link>
          {isAuthed && (
            <Link to="/host" className="hover:text-white">
              Host
            </Link>
          )}
        </nav>
      </header>
      <main className="flex-1 p-4 max-w-5xl w-full mx-auto">{children}</main>
    </div>
  );
};
