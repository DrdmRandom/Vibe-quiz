import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PlayPage() {
  const [pin, setPin] = useState('');
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/room/${pin}?nickname=${encodeURIComponent(nickname)}`);
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded p-6 space-y-3">
      <h1 className="text-2xl font-bold">Join session</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full p-2 bg-slate-800 rounded" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
        <input className="w-full p-2 bg-slate-800 rounded" placeholder="Nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        <button className="w-full bg-lime-500 text-black rounded py-2 font-semibold">Join</button>
      </form>
    </div>
  );
}
