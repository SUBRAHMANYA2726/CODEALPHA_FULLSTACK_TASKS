import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, Sparkles, ArrowRight } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* Left Side — Branding Panel (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 30% 50%, #EC4899 0%, transparent 50%), radial-gradient(circle at 70% 80%, #8B5CF6 0%, transparent 50%)' }} />
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
          className="relative z-10 text-center px-12 max-w-lg">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-8 shadow-colored">
            <Sparkles size={36} className="text-white" />
          </div>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">Join the<br/>SocialSphere</h2>
          <p className="text-lg text-white/60 font-medium leading-relaxed">
            Create your profile, follow your passions, and become part of something extraordinary.
          </p>
          
          <div className="mt-10 flex gap-6 justify-center text-white/50 text-sm font-bold">
            <div className="text-center">
              <p className="text-2xl text-white font-black">10K+</p>
              <p>Users</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl text-white font-black">50K+</p>
              <p>Posts</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl text-white font-black">100+</p>
              <p>Communities</p>
            </div>
          </div>
        </motion.div>

        <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-pink-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Right Side — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md">
          
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-colored">
              <Sparkles size={24} className="text-white" />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black" style={{ color: 'var(--foreground)' }}>Create account</h1>
            <p className="text-[15px] mt-2 font-medium" style={{ color: 'var(--foreground-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-bold hover:underline transition-colors" style={{ color: 'var(--primary)' }}>Sign in</Link>
            </p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
              <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--foreground)' }}>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
                  className="w-full px-4 py-3.5 rounded-xl border text-[15px] font-medium focus:outline-none focus:ring-2 ring-[var(--primary-light)] transition-all bg-black/5 dark:bg-white/5 border-transparent focus:border-[var(--primary)]"
                  style={{ color: 'var(--foreground)' }} required />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--foreground)' }}>Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe"
                  className="w-full px-4 py-3.5 rounded-xl border text-[15px] font-medium focus:outline-none focus:ring-2 ring-[var(--primary-light)] transition-all bg-black/5 dark:bg-white/5 border-transparent focus:border-[var(--primary)]"
                  style={{ color: 'var(--foreground)' }} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--foreground)' }}>Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full px-4 py-3.5 rounded-xl border text-[15px] font-medium focus:outline-none focus:ring-2 ring-[var(--primary-light)] transition-all bg-black/5 dark:bg-white/5 border-transparent focus:border-[var(--primary)]"
                style={{ color: 'var(--foreground)' }} required />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--foreground)' }}>Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border text-[15px] font-medium focus:outline-none focus:ring-2 ring-[var(--primary-light)] transition-all bg-black/5 dark:bg-white/5 border-transparent focus:border-[var(--primary)]"
                  style={{ color: 'var(--foreground)' }} required minLength={6} />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full gradient-primary text-white font-bold py-3.5 rounded-xl text-[15px] shadow-colored transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="text-xs text-center mt-6 font-medium" style={{ color: 'var(--foreground-subtle)' }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
