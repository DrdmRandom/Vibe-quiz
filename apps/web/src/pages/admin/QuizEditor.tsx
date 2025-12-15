import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';
import { ChoiceDTO, QuestionDTO, QuizDTO } from '@vibequiz/shared';
import { useToast } from '../../components/ToastProvider';

const makeChoice = (questionId: string, label: string, isCorrect = false): ChoiceDTO => ({
  id: `choice-${Date.now()}-${Math.random()}`,
  questionId,
  text: label,
  isCorrect,
});

const makeQuestion = (quizId: string, index: number): QuestionDTO => {
  const questionId = `question-${Date.now()}-${Math.random()}`;
  return {
    id: questionId,
    quizId,
    text: 'New question',
    durationSec: 20,
    order: index,
    choices: [
      makeChoice(questionId, 'Option 1', true),
      makeChoice(questionId, 'Option 2'),
      makeChoice(questionId, 'Option 3'),
      makeChoice(questionId, 'Option 4'),
    ],
  };
};

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
    const payload = { ...quiz, questions: quiz.questions.map((q, idx) => ({ ...q, order: idx })) };
    try {
      const res = await api.put(`/quizzes/${quiz.id}`, payload);
      setQuiz(res.data);
      toast({ title: 'Quiz saved', variant: 'success' });
    } catch (err: any) {
      toast({ title: 'Unable to save', description: err.response?.data?.message, variant: 'error' });
    }
  };

  const updateQuestion = (idx: number, nextQuestion: QuestionDTO) => {
    if (!quiz) return;
    const next = [...quiz.questions];
    next[idx] = nextQuestion;
    setQuiz({ ...quiz, questions: next });
  };

  const addQuestion = () => {
    if (!quiz) return;
    const next = [...quiz.questions, makeQuestion(quiz.id, quiz.questions.length)];
    setQuiz({ ...quiz, questions: next });
  };

  const removeQuestion = (idx: number) => {
    if (!quiz) return;
    const next = quiz.questions.filter((_, i) => i !== idx).map((q, newIdx) => ({ ...q, order: newIdx }));
    setQuiz({ ...quiz, questions: next });
  };

  const addChoice = (qIdx: number) => {
    if (!quiz) return;
    const question = quiz.questions[qIdx];
    const newChoice = makeChoice(question.id, `Choice ${question.choices.length + 1}`, question.choices.every((c) => !c.isCorrect));
    updateQuestion(qIdx, { ...question, choices: [...question.choices, newChoice] });
  };

  const removeChoice = (qIdx: number, cIdx: number) => {
    if (!quiz) return;
    const question = quiz.questions[qIdx];
    const remaining = question.choices.filter((_, i) => i !== cIdx);
    if (remaining.length === 0) return;
    if (!remaining.some((c) => c.isCorrect)) {
      remaining[0] = { ...remaining[0], isCorrect: true };
    }
    updateQuestion(qIdx, { ...question, choices: remaining });
  };

  const setCorrectChoice = (qIdx: number, cIdx: number) => {
    if (!quiz) return;
    const question = quiz.questions[qIdx];
    const nextChoices = question.choices.map((c, idx) => ({ ...c, isCorrect: idx === cIdx }));
    updateQuestion(qIdx, { ...question, choices: nextChoices });
  };

  const updateChoiceText = (qIdx: number, cIdx: number, text: string) => {
    if (!quiz) return;
    const question = quiz.questions[qIdx];
    const nextChoices = [...question.choices];
    nextChoices[cIdx] = { ...nextChoices[cIdx], text };
    updateQuestion(qIdx, { ...question, choices: nextChoices });
  };

  if (!quiz) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-slate-300">Title</label>
        <input className="w-full p-2 bg-slate-800 rounded" value={quiz.title} onChange={(e) => setQuiz({ ...quiz, title: e.target.value })} />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Questions</p>
          <button onClick={addQuestion} className="text-sm bg-slate-800 px-3 py-1 rounded border border-slate-700">
            Add question
          </button>
        </div>
        {quiz.questions.map((q, idx) => (
          <div key={q.id ?? idx} className="bg-slate-900 border border-slate-800 rounded p-3 space-y-3">
            <div className="flex justify-between gap-2">
              <input
                className="w-full bg-slate-800 p-2 rounded"
                value={q.text}
                onChange={(e) => updateQuestion(idx, { ...q, text: e.target.value })}
              />
              {quiz.questions.length > 1 && (
                <button onClick={() => removeQuestion(idx)} className="text-red-400 text-sm ml-2">
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {q.choices.map((c, cIdx) => (
                <div key={c.id ?? cIdx} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={c.isCorrect}
                    onChange={() => setCorrectChoice(idx, cIdx)}
                  />
                  <input
                    className="flex-1 bg-slate-800 p-2 rounded"
                    value={c.text}
                    onChange={(e) => updateChoiceText(idx, cIdx, e.target.value)}
                  />
                  {q.choices.length > 1 && (
                    <button onClick={() => removeChoice(idx, cIdx)} className="text-red-400">
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => addChoice(idx)} className="text-sm text-lime-400">
              + Add choice
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button onClick={save} className="bg-lime-500 text-black px-4 py-2 rounded">
          Save
        </button>
      </div>
    </div>
  );
}
