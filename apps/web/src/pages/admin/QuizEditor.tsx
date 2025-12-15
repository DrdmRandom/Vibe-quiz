import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';
import { QuizDTO } from '@vibequiz/shared';
import { useToast } from '../../components/ToastProvider';

export default function QuizEditor() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState<QuizDTO | null>(null);
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/quizzes/${id}`);
        setQuiz(res.data);
      } catch (err: any) {
        toast({ title: 'Failed to load quiz', description: err.response?.data?.message, variant: 'error' });
      }
    };
    if (id) load();
  }, [id]);

  const save = async () => {
    if (!quiz) return;
    try {
      await api.put(`/quizzes/${quiz.id}`, quiz);
      toast({ title: 'Quiz saved', variant: 'success' });
    } catch (err: any) {
      toast({ title: 'Unable to save', description: err.response?.data?.message, variant: 'error' });
    }
  };

  if (!quiz) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-slate-300">Title</label>
        <input className="w-full p-2 bg-slate-800 rounded" value={quiz.title} onChange={(e) => setQuiz({ ...quiz, title: e.target.value })} />
      </div>
      <div className="space-y-2">
        <p className="font-semibold">Questions</p>
        {quiz.questions.map((q, idx) => (
          <div key={q.id} className="bg-slate-900 border border-slate-800 rounded p-3 space-y-2">
            <input className="w-full bg-slate-800 p-2 rounded" value={q.text} onChange={(e) => {
              const copy = { ...q, text: e.target.value };
              const next = [...quiz.questions];
              next[idx] = copy;
              setQuiz({ ...quiz, questions: next });
            }} />
            <div className="grid grid-cols-2 gap-2">
              {q.choices.map((c, cIdx) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={c.isCorrect}
                    onChange={(e) => {
                      const nextChoices = [...q.choices];
                      nextChoices[cIdx] = { ...c, isCorrect: e.target.checked };
                      const next = [...quiz.questions];
                      next[idx] = { ...q, choices: nextChoices };
                      setQuiz({ ...quiz, questions: next });
                    }}
                  />
                  <input
                    className="flex-1 bg-slate-800 p-2 rounded"
                    value={c.text}
                    onChange={(e) => {
                      const nextChoices = [...q.choices];
                      nextChoices[cIdx] = { ...c, text: e.target.value };
                      const next = [...quiz.questions];
                      next[idx] = { ...q, choices: nextChoices };
                      setQuiz({ ...quiz, questions: next });
                    }}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={save} className="bg-lime-500 text-black px-4 py-2 rounded">
        Save
      </button>
    </div>
  );
}
