import { useState } from 'react';
import api, { setAuthToken } from '../../lib/api';
import { useToast } from '../../components/ToastProvider';
import { useNavigate } from 'react-router-dom';

export default function AdminRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', { email, password });
      localStorage.setItem('token', res.data.accessToken);
      setAuthToken(res.data.accessToken);
      window.dispatchEvent(new Event('auth-changed'));
      toast({ title: 'Registered', description: 'Account created', variant: 'success' });
      navigate('/admin/quizzes');
    } catch (err: any) {
      toast({ title: 'Registration failed', description: err.response?.data?.message ?? 'Try a different email', variant: 'error' });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded p-6 space-y-4">
      <h1 className="text-2xl font-bold">Create admin</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full p-2 rounded bg-slate-800" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input className="w-full p-2 rounded bg-slate-800" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button className="w-full bg-lime-500 text-black rounded py-2 font-semibold" type="submit">
          Register
        </button>
      </form>
    </div>
  );
}
