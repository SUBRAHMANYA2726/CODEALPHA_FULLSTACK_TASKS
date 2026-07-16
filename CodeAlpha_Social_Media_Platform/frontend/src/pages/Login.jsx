import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Sparkles, ArrowRight } from 'lucide-react';

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
      {/* Left Side — Branding Panel (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 30% 50%, #8B5CF6 0%, transparent 50%), radial-gradient(circle at 70% 80%, #2563EB 0%, transparent 50%)' }} />
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
          className="relative z-10 text-center px-12 max-w-lg">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-8 shadow-colored">
            <Sparkles size={36} className="text-white" />
          </div>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">Welcome back to<br/>SocialSphere</h2>
          <p className="text-lg text-white/60 font-medium leading-relaxed">
            Connect with friends, share your story, and discover a world of conversations.
          </p>
          
          <div className="flex justify-center gap-2 mt-10">
            {[0, 1, 2].map(i => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === 0 ? 'w-8 bg-white' : 'w-1.5 bg-white/30'}`} />
            ))}
          </div>
        </motion.div>

        {/* Decorative floating orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-blue-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Right Side — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md">
          
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-colored">
              <Sparkles size={24} className="text-white" />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black" style={{ color: 'var(--foreground)' }}>Sign in</h1>
            <p className="text-[15px] mt-2 font-medium" style={{ color: 'var(--foreground-muted)' }}>
              Don't have an account?{' '}
              <Link to="/register" className="font-bold hover:underline transition-colors" style={{ color: 'var(--primary)' }}>Create one free</Link>
            </p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
              <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--foreground)' }}>Email address</label>
              <input name="email" type="email" required placeholder="you@example.com"
                value={form.email} onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-xl border text-[15px] font-medium focus:outline-none focus:ring-2 ring-[var(--primary-light)] transition-all bg-black/5 dark:bg-white/5 border-transparent focus:border-[var(--primary)]"
                style={{ color: 'var(--foreground)' }} />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--foreground)' }}>Password</label>
              <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'} required placeholder="••••••••"
                  value={form.password} onChange={handleChange}
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border text-[15px] font-medium focus:outline-none focus:ring-2 ring-[var(--primary-light)] transition-all bg-black/5 dark:bg-white/5 border-transparent focus:border-[var(--primary)]"
                  style={{ color: 'var(--foreground)' }} />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full gradient-primary text-white font-bold py-3.5 rounded-xl text-[15px] shadow-colored transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>


        </motion.div>
      </div>
    </div>
  );
};

export default Login;
