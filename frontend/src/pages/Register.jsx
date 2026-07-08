import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Create account</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
              Already have one?{' '}
              <Link to="/login" style={{ color: 'var(--primary)' }} className="font-medium">Log in</Link>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded text-sm font-medium" style={{ background: 'var(--secondary-light)', color: 'var(--secondary)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
                className="input" required />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe"
                className="input" required />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                className="input" required />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters" className="input" required minLength={6} />
            </div>

            <button type="submit" className="btn btn-primary w-full py-2.5 text-sm mt-1">
              <UserPlus size={16} /> Create Account
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
