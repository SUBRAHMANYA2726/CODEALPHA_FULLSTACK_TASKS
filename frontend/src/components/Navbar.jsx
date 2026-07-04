import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { logout } from '../slices/authSlice';
import { ShoppingCart, User, LogOut, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const Navbar = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      await axios.post('/api/users/logout');
      dispatch(logout());
      setIsProfileOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 w-full z-50 glass border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300 border border-indigo-400/20">
              A
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-slate-100 group-hover:text-white transition-colors duration-300">
              Aether<span className="text-indigo-400">Arcade</span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link to="/cart" className="relative group p-2">
              <ShoppingCart className="w-6 h-6 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              {cartItems.length > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-[10px] font-bold text-black shadow-[0_0_10px_rgba(245,158,11,0.5)] border border-amber-300/50"
                >
                  {cartItems.reduce((a, c) => a + c.qty, 0)}
                </motion.span>
              )}
            </Link>

            {userInfo ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 bg-[#0a0a0a] px-4 py-2 rounded-full hover:bg-[#171717] transition-colors border border-white/10 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-inner border border-indigo-400/20">
                    {userInfo.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-sm text-slate-300 hidden sm:block">{userInfo.name}</span>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 bg-[#0a0a0a]/95 backdrop-blur-xl rounded-2xl overflow-hidden py-2 border border-white/10 shadow-2xl"
                    >
                      <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors font-medium">
                        <User className="w-4 h-4 text-indigo-400" /> Profile
                      </Link>
                      {userInfo.isAdmin && (
                        <Link to="/admin/orderlist" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors font-medium">
                          <ShieldCheck className="w-4 h-4 text-amber-400" /> Admin Dashboard
                        </Link>
                      )}
                      <div className="h-px bg-white/10 my-1" />
                      <button onClick={logoutHandler} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors font-medium">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
