import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch {
      setError('Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <div className="w-10 h-10 rounded flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--primary)' }}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Sign in to SocialSphere</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
              New here?{' '}
              <Link to="/register" style={{ color: 'var(--primary)' }} className="font-medium">Create an account</Link>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded text-sm font-medium" style={{ background: 'var(--secondary-light)', color: 'var(--secondary)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Email</label>
              <input name="email" type="email" required placeholder="you@example.com"
                value={form.email} onChange={handleChange} className="input" />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Password</label>
              <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'} required placeholder="••••••••"
                  value={form.password} onChange={handleChange} className="input pr-10" />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-subtle)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5 text-sm mt-1">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><LogIn size={16} /> Sign In</>
              )}
            </button>
          </form>

          <div className="mt-5 p-3 rounded text-xs" style={{ background: 'var(--muted)' }}>
            <p className="font-semibold mb-1">Test credentials:</p>
            <p>Email: <span className="font-mono font-bold" style={{ color: 'var(--primary)' }}>alex@socialsphere.com</span></p>
            <p>Password: <span className="font-mono font-bold" style={{ color: 'var(--primary)' }}>password123</span></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
