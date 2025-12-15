import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-lime-400">
          VibeQuiz
        </Link>
        <nav className="flex gap-4 text-sm text-slate-200">
          <Link to="/host" className="hover:text-white">
            Host
          </Link>
          <Link to="/play" className="hover:text-white">
            Play
          </Link>
        </nav>
      </header>
      <main className="flex-1 p-4 max-w-5xl w-full mx-auto">{children}</main>
    </div>
  );
};
