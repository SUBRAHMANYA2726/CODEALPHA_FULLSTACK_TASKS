import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaUser, FaHeart, FaSearch, FaBars, FaTimes, FaChevronDown, FaSignOutAlt, FaCog, FaBoxOpen } from 'react-icons/fa';
import { logout } from '../slices/authSlice';

const Navbar = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logoutHandler = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    navigate('/login');
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword.trim()}`);
      setMobileOpen(false);
    } else {
      navigate('/');
    }
  };

  const cartCount = cartItems.reduce((a, c) => a + c.qty, 0);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-dark shadow-2xl' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse-glow">
              <span className="text-white font-black text-sm">E</span>
            </div>
            <span className="text-xl font-black tracking-tight">
              <span className="text-white">Ecom</span>
              <span className="gradient-text">Store</span>
            </span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={submitHandler} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                className="input-premium pr-12 text-sm"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors">
                <FaSearch />
              </button>
            </div>
          </form>

          {/* Desktop Nav Icons */}
          <div className="hidden md:flex items-center gap-2">
            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200">
              <FaHeart className="text-lg" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200">
              <FaShoppingCart className="text-lg" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            {/* User Menu */}
            {userInfo ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:bg-white/10 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                    {userInfo.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-200 hidden lg:block">{userInfo.name?.split(' ')[0]}</span>
                  <FaChevronDown className={`text-xs text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 glass rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                    >
                      <div className="p-3 border-b border-white/10">
                        <p className="text-sm font-semibold text-white">{userInfo.name}</p>
                        <p className="text-xs text-slate-400">{userInfo.email}</p>
                      </div>
                      <div className="p-2">
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                          <FaUser className="text-blue-400" /> Profile
                        </Link>
                        <Link to="/cart" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                          <FaBoxOpen className="text-purple-400" /> My Orders
                        </Link>
                        {userInfo.isAdmin && (
                          <Link to="/admin/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                            <FaCog className="text-cyan-400" /> Admin Panel
                          </Link>
                        )}
                        <button onClick={logoutHandler} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all mt-1">
                          <FaSignOutAlt /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn-primary-premium text-sm py-2 px-4 relative z-10">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl glass text-slate-300">
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden pb-4"
            >
              <form onSubmit={submitHandler} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="input-premium pr-12 text-sm"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400">
                    <FaSearch />
                  </button>
                </div>
              </form>
              <div className="flex flex-col gap-2">
                <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl glass text-slate-300 hover:text-white transition-all">
                  <FaHeart className="text-pink-400" /> Wishlist {wishlistItems.length > 0 && <span className="ml-auto bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">{wishlistItems.length}</span>}
                </Link>
                <Link to="/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl glass text-slate-300 hover:text-white transition-all">
                  <FaShoppingCart className="text-blue-400" /> Cart {cartCount > 0 && <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{cartCount}</span>}
                </Link>
                {userInfo ? (
                  <>
                    <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl glass text-slate-300 hover:text-white transition-all">
                      <FaUser className="text-purple-400" /> Profile
                    </Link>
                    {userInfo.isAdmin && (
                      <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl glass text-slate-300 hover:text-white transition-all">
                        <FaCog className="text-cyan-400" /> Admin
                      </Link>
                    )}
                    <button onClick={logoutHandler} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 transition-all">
                      <FaSignOutAlt /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary-premium text-center">
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navbar;
