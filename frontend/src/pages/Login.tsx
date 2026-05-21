import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { LogIn, Eye, EyeOff, Shield, User } from 'lucide-react';
import { login } from '../lib/api';
import { useAuthStore } from '../store/auth';

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);

  const mutation = useMutation({
    mutationFn: () => login(form.email, form.password),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      navigate(data.user.role === 'admin' ? '/admin' : '/engineer');
    },
  });

  const quickLogin = (email: string) => {
    setForm({ email, password: 'demo1234' });
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🛣️</div>
            <h1 className="text-2xl font-bold text-gray-900">RoadWatch Login</h1>
            <p className="text-gray-500 text-sm mt-1">Engineers & Administrators only</p>
          </div>

          {/* Demo credentials */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
            <p className="text-xs font-semibold text-amber-700 mb-2">Demo Credentials (click to fill)</p>
            <div className="space-y-1">
              <button onClick={() => quickLogin('admin@roadwatch.demo')}
                className="w-full text-left text-xs text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors">
                <Shield size={12} /> admin@roadwatch.demo — Admin
              </button>
              <button onClick={() => quickLogin('engineer.abc@roadwatch.demo')}
                className="w-full text-left text-xs text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors">
                <User size={12} /> engineer.abc@roadwatch.demo — Engineer (WB)
              </button>
              <button onClick={() => quickLogin('engineer.xyz@roadwatch.demo')}
                className="w-full text-left text-xs text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors">
                <User size={12} /> engineer.xyz@roadwatch.demo — Engineer (TN)
              </button>
            </div>
            <p className="text-xs text-amber-600 mt-1">Password for all: demo1234</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="your@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mutation.isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {(mutation.error as any)?.response?.data?.error || 'Login failed. Please check your credentials.'}
              </div>
            )}

            <button type="submit" disabled={mutation.isPending}
              className="w-full bg-brand-700 hover:bg-brand-600 disabled:bg-gray-300 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
              {mutation.isPending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <LogIn size={16} />}
              {mutation.isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            Citizens don't need to log in.{' '}
            <Link to="/" className="text-brand-600 hover:underline">Browse the map →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
