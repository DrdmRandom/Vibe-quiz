import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vibe Quiz',
  description: 'Host and play live quizzes together.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-secondary">Vibe Quiz</p>
              <h1 className="text-3xl font-bold text-white">Kahoot-like live trivia</h1>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <span className="rounded-full bg-white/10 px-3 py-1">Mobile-ready</span>
              <span className="rounded-full bg-white/10 px-3 py-1">Socket powered</span>
            </div>
          </header>
          {children}
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
