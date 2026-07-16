import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Gamepad2, ArrowRight } from 'lucide-react';
import Loader from '../components/Loader';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { data } = await axios.post('/api/users/login', { email, password });
      dispatch(setCredentials(data));
      toast.success('Login successful');
      navigate(redirect);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center min-h-[70vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0a0a0a] rounded-[2rem] p-8 md:p-12 relative overflow-hidden border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 blur-[80px] rounded-full" />

        <div className="relative z-10">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#050505] border border-white/5 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)] mb-6">
              <Gamepad2 className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-display font-black text-white mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-slate-400 text-sm font-medium">Enter your credentials to access your premium account.</p>
          </div>

          <form onSubmit={submitHandler} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-indigo-400/50 disabled:opacity-50 mt-8"
            >
              {isLoading ? 'Signing In...' : <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400 font-medium">
            Don't have an account?{' '}
            <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
