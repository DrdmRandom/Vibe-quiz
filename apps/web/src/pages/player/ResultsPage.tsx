import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';

export default function ResultsPage() {
  const { pin } = useParams();
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const res = await api.get(`/sessions/${pin}/results`);
      setResults(res.data);
    };
    if (pin) load();
  }, [pin]);

  if (!results) return <p>Loading results...</p>;

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Final leaderboard</h1>
      <div className="bg-slate-900 border border-slate-800 rounded p-3">
        {(results.session.players ?? []).map((p: any) => (
          <div key={p.id} className="flex justify-between border-b border-slate-800 py-2 last:border-none">
            <span>{p.nickname}</span>
            <span>{p.totalPoints} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
