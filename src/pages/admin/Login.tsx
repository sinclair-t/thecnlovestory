import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/admin', { replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      navigate('/admin', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl font-light text-white mb-1">
            CHUKS <span className="text-gold-400">&</span> NAOMI
          </h1>
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold-400">Admin Portal</p>
        </div>

        <div className="bg-dark-900 border border-dark-700 p-8">
          <h2 className="font-serif text-2xl text-white mb-6">Sign In</h2>

          {error && (
            <div className="flex items-center gap-3 bg-red-900/30 border border-red-700 p-3 mb-5 text-sm text-red-300">
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label text-cream-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="input-field bg-dark-800 border-dark-600 text-white placeholder:text-dark-400 focus:border-gold-500"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="label text-cream-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="input-field bg-dark-800 border-dark-600 text-white placeholder:text-dark-400 focus:border-gold-500"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6">
          <a href="/" className="font-sans text-xs text-dark-500 hover:text-dark-300 transition-colors">
            ← Back to Wedding Website
          </a>
        </p>
      </div>
    </div>
  );
}
