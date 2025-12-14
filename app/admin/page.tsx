'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ADMIN_TOKEN, API_URL } from '@/lib/config';
import type { QuestionForm } from '@/lib/types';

const emptyQuestion = (index: number): QuestionForm => ({
  id: index,
  prompt: '',
  timeLimit: 30,
  choices: ['', '', '', ''],
  correctIndex: 0,
});

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<QuestionForm[]>([emptyQuestion(0)]);
  const [submitting, setSubmitting] = useState(false);

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion(prev.length)]);
  };

  const updateQuestion = (index: number, data: Partial<QuestionForm>) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...data } : q)));
  };

  const updateChoice = (qIndex: number, cIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, choices: q.choices.map((c, j) => (j === cIndex ? value : c)) } : q,
      ),
    );
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Quiz title is required');
      return;
    }
    if (questions.some((q) => !q.prompt.trim())) {
      toast.error('Add question text for every item');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_TOKEN,
        },
        body: JSON.stringify({
          title,
          questions: questions.map((q) => ({
            prompt: q.prompt,
            timeLimit: Number(q.timeLimit) || 30,
            choices: q.choices,
            correctIndex: q.correctIndex,
          })),
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Failed to create quiz');
      }

      const payload = await res.json();
      toast.success(`Quiz created: ${payload?.title ?? 'New quiz'}`);
      setTitle('');
      setQuestions([emptyQuestion(0)]);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="card p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-secondary">Admin</p>
          <h2 className="text-2xl font-semibold text-white">Build a quiz</h2>
          <p className="text-slate-300">Use your admin token to create quizzes from the browser.</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">x-admin-token header</span>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <div>
          <label className="label" htmlFor="title">Quiz title</label>
          <input
            id="title"
            className="input mt-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ocean Trivia"
          />
        </div>

        <div className="flex items-center justify-between">
          <h3 className="section-title">Questions</h3>
          <button type="button" className="btn" onClick={addQuestion}>
            ➕ Add question
          </button>
        </div>

        <div className="grid gap-4">
          {questions.map((q, index) => (
            <div key={q.id} className="card border-white/5 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-2">
                  <p className="label">Question {index + 1}</p>
                  <input
                    className="input"
                    value={q.prompt}
                    onChange={(e) => updateQuestion(index, { prompt: e.target.value })}
                    placeholder="Who painted the Mona Lisa?"
                  />
                </div>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="rounded-full p-2 text-slate-300 hover:bg-white/10"
                  >
                    🗑️
                  </button>
                )}
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Time limit (seconds)</label>
                  <input
                    type="number"
                    className="input mt-2"
                    min={5}
                    max={120}
                    value={q.timeLimit}
                    onChange={(e) => updateQuestion(index, { timeLimit: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Correct answer</label>
                  <select
                    className="input mt-2"
                    value={q.correctIndex}
                    onChange={(e) => updateQuestion(index, { correctIndex: Number(e.target.value) })}
                  >
                    {q.choices.map((_, i) => (
                      <option key={i} value={i}>{`Choice ${i + 1}`}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {q.choices.map((choice, cIndex) => (
                  <div key={cIndex} className="space-y-2">
                    <label className="label">Choice {cIndex + 1}</label>
                    <input
                      className="input"
                      value={choice}
                      onChange={(e) => updateChoice(index, cIndex, e.target.value)}
                      placeholder={`Answer ${cIndex + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button className="btn self-start" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Create quiz'}
        </button>
      </form>
    </main>
  );
}
