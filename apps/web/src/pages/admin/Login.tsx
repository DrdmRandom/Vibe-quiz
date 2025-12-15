import { useState } from 'react';
import api, { setAuthToken } from '../../lib/api';
import { useToast } from '../../components/ToastProvider';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('host@example.com');
  const [password, setPassword] = useState('password123');
  const toast = useToast();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.accessToken);
      setAuthToken(res.data.accessToken);
      toast({ title: 'Logged in', description: 'Welcome back', variant: 'success' });
      navigate('/admin/quizzes');
    } catch (err: any) {
      toast({ title: 'Login failed', description: err.response?.data?.message ?? 'Check credentials', variant: 'error' });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full p-2 rounded bg-slate-800" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input className="w-full p-2 rounded bg-slate-800" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button className="w-full bg-lime-500 text-black rounded py-2 font-semibold" type="submit">
          Sign in
        </button>
      </form>
    </div>
  );
}
