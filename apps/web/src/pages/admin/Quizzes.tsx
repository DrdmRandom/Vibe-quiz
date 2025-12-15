import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useToast } from '../../components/ToastProvider';
import { Link } from 'react-router-dom';
import { QuizDTO } from '@vibequiz/shared';

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState<QuizDTO[]>([]);
  const [title, setTitle] = useState('My Quiz');
  const toast = useToast();

  const load = async () => {
    try {
      const res = await api.get('/quizzes');
      setQuizzes(res.data);
    } catch (err: any) {
      toast({ title: 'Unable to load quizzes', description: err.response?.data?.message, variant: 'error' });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    try {
      await api.post('/quizzes', {
        title,
        description: 'Quick created quiz',
        isPublished: true,
        questions: [
          {
            text: 'Sample question',
            durationSec: 20,
            order: 0,
            choices: [
              { text: 'Yes', isCorrect: true },
              { text: 'No', isCorrect: false },
            ],
          },
        ],
      });
      toast({ title: 'Quiz created', variant: 'success' });
      load();
    } catch (err: any) {
      toast({ title: 'Failed to create quiz', description: err.response?.data?.message, variant: 'error' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input className="p-2 rounded bg-slate-800" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button onClick={create} className="bg-lime-500 text-black px-4 py-2 rounded">
          Create
        </button>
      </div>
      <div className="grid gap-3">
        {quizzes.map((q) => (
          <div key={q.id} className="bg-slate-900 border border-slate-800 rounded p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">{q.title}</p>
              <p className="text-sm text-slate-300">{q.description}</p>
            </div>
            <Link to={`/admin/quizzes/${q.id}/edit`} className="text-lime-400">
              Edit
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
