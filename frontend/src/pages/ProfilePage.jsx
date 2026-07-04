import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { setCredentials } from '../slices/authSlice';
import { User, Mail, ShieldCheck, Save, Clock, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setIsLoading(true);
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put('/api/users/profile', { _id: userInfo._id, name, email, password }, config);
      dispatch(setCredentials(data));
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          <User className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-4xl font-display font-black text-slate-100 tracking-tight">
            User Profile
          </h1>
          <p className="text-slate-400 font-medium mt-1">Manage your account settings and view orders.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 bg-[#0a0a0a] rounded-[2rem] p-8 border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] h-fit"
        >
          <h2 className="text-xl font-bold text-slate-100 mb-6">Update Details</h2>
          <form onSubmit={submitHandler} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2"><User className="w-4 h-4 text-indigo-400"/> Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2"><Mail className="w-4 h-4 text-indigo-400"/> Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-amber-400"/> New Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-amber-400"/> Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-indigo-400/50 mt-6">
              <Save className="w-4 h-4" /> {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-[#0a0a0a] rounded-[2rem] p-8 border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-bold text-slate-100">Order History</h2>
          </div>
          
          <div className="flex flex-col items-center justify-center py-20 text-center bg-[#050505] rounded-2xl border border-white/5 border-dashed">
            <div className="w-20 h-20 rounded-full bg-[#171717] flex items-center justify-center mb-6 shadow-sm border border-white/5">
              <Package className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">No orders yet</h3>
            <p className="text-slate-500 font-medium max-w-sm">When you place an order, its details and status will appear here.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
