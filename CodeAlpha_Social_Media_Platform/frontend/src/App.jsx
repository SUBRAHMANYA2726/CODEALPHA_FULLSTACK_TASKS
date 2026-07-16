import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Communities from './pages/Communities';
import Explore from './pages/Explore';
import Trending from './pages/Trending';
import Reels from './pages/Reels';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import PostDetail from './pages/PostDetail';

import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import ChatWidget from './components/ChatWidget';

import {
  Home as HomeIcon, Compass, Flame, Bell, PlusCircle, Search, X,
  LogOut, Settings as SettingsIcon, User, Sun, Moon
} from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  return user?.isAdmin ? children : <Navigate to="/" replace />;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  return !user ? children : <Navigate to="/" replace />;
};

const FullPageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded flex items-center justify-center" style={{ background: 'var(--primary)' }}>
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        className="w-5 h-5 border-2 rounded-full" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
    </div>
  </div>
);

const CreatePostModal = ({ onClose }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post('/api/upload/post-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setImageUrl(res.data.imageUrl);
    } catch { alert('Image upload failed.'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) return;
    setSubmitting(true);
    try {
      const hashtags = (content.match(/#(\w+)/g) || []).map(h => h.slice(1));
      await axios.post('/api/posts', { content, image: imageUrl, hashtags }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      onClose();
      window.location.reload();
    } catch { alert('Failed to create post.'); }
    finally { setSubmitting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg card overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-base font-bold">Create Post</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors bg-black/5" style={{ color: 'var(--foreground-subtle)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name}&background=4FBCFF&color=fff`}
              className="w-8 h-8 rounded-full object-cover" alt="" />
            <div>
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>@{user?.username}</p>
            </div>
          </div>

          <textarea value={content} onChange={e => setContent(e.target.value)} rows={3}
            placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
            className="w-full resize-none rounded p-3 text-sm focus:outline-none border"
            style={{ background: 'var(--muted)', borderColor: 'var(--border)' }} autoFocus
          />

          {imageUrl && (
            <div className="relative rounded overflow-hidden">
              <img src={imageUrl} alt="Preview" className="w-full max-h-40 object-cover" />
              <button type="button" onClick={() => setImageUrl('')}
                className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded p-0.5">
                <X size={12} />
              </button>
            </div>
          )}

          <input type="url" placeholder="Image URL..." value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            className="w-full rounded px-3 py-1.5 text-xs border focus:outline-none"
            style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
          />

          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium hover:bg-white/5 transition-colors"
              style={{ color: 'var(--primary)' }}
            >
              {uploading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-3 h-3 border-2 rounded-full" style={{ borderColor: '#4FBCFF', borderTopColor: 'transparent' }} />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
              Photo
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

            <button type="submit" disabled={(!content.trim() && !imageUrl) || submitting}
              className="btn btn-primary px-4 py-1.5 text-xs disabled:opacity-50"
            >
              {submitting ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
              ) : 'Post'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = () => setShowCreatePost(true);
    window.addEventListener('open-create-post', handler);
    return () => window.removeEventListener('open-create-post', handler);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults(null); return; }
    const t = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSearchResults(res.data);
      } catch { setSearchResults(null); }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchResults(null);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="fixed left-0 top-0 h-full z-30 flex-col overflow-hidden hidden md:flex sidebar glass-panel border-r-0"
        style={{ width: sidebarOpen ? 260 : 72, minWidth: sidebarOpen ? 260 : 72, transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <Sidebar collapsed={!sidebarOpen} onToggle={() => setSidebarOpen(v => !v)}
          onCreatePost={() => setShowCreatePost(true)} />
      </div>

      <main className="flex-1 flex flex-col min-h-screen transition-all duration-300 lg:mr-[320px]"
        style={{ marginLeft: sidebarOpen ? 260 : 72 }}
      >
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 h-16 glass-panel"
        >
          <div className="flex items-center gap-2">
            <button className="md:hidden p-1.5 rounded hover:bg-white/5 transition-colors" onClick={() => setSidebarOpen(v => !v)} style={{ color: 'var(--foreground-subtle)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="md:hidden text-sm font-bold" style={{ color: 'var(--foreground)' }}>SocialSphere</span>
          </div>

          <div ref={searchRef} className="hidden md:flex items-center flex-1 max-w-md mx-auto relative">
            <div className="flex items-center gap-2 w-full px-3 py-1.5 rounded border transition-all focus-within:border-blue-400"
              style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
            >
              <Search size={14} style={{ color: 'var(--foreground-subtle)' }} className="flex-shrink-0" />
              <input type="text" placeholder="Search SocialSphere"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs flex-1" style={{ color: 'var(--foreground)' }} />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults(null); }} style={{ color: 'var(--foreground-subtle)' }}>
                  <X size={12} />
                </button>
              )}
            </div>

            <AnimatePresence>
              {searchResults && (
                <motion.div initial={{ opacity: 0, y: 4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }} transition={{ duration: 0.12 }}
                  className="absolute top-full mt-1 left-0 w-full card shadow-md z-50 overflow-hidden"
                >
                  {searchResults.users?.length > 0 && (
                    <div className="p-1.5">
                      <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--foreground-subtle)' }}>People</p>
                      {searchResults.users.slice(0, 4).map(u => (
                        <button key={u._id}
                          onClick={() => { navigate(`/profile/${u.username}`); setSearchResults(null); setSearchQuery(''); }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 text-left transition-colors"
                        >
                          <img src={u.profilePicture || `https://ui-avatars.com/api/?name=${u.name}&background=4FBCFF&color=fff`}
                            className="w-7 h-7 rounded-full object-cover" alt="" />
                          <div>
                            <p className="text-xs font-semibold">{u.name}</p>
                            <p className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>@{u.username}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.communities?.length > 0 && (
                    <div className="p-1.5 border-t" style={{ borderColor: 'var(--border)' }}>
                      <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--foreground-subtle)' }}>Communities</p>
                      {searchResults.communities.slice(0, 3).map(c => (
                        <button key={c._id} className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 text-left transition-colors">
                          <div className="w-7 h-7 rounded flex items-center justify-center text-white text-[10px] font-bold" style={{ background: 'var(--primary)' }}>{c.name[0]}</div>
                          <p className="text-xs font-semibold">{c.name}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {!searchResults.users?.length && !searchResults.communities?.length && (
                    <div className="p-4 text-center text-xs" style={{ color: 'var(--foreground-muted)' }}>No results for "{searchQuery}"</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded hover:bg-white/5 transition-colors hidden md:flex" style={{ color: 'var(--foreground-subtle)' }} title="Toggle theme">
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button onClick={() => setShowCreatePost(true)}
              className="hidden sm:flex btn btn-primary text-xs px-3 py-1.5 gap-1">
              <PlusCircle size={14} />
              <span className="hidden lg:inline">Create</span>
            </button>

            <button onClick={() => navigate('/notifications')}
              className="p-1.5 rounded hover:bg-white/5 transition-colors relative" style={{ color: 'var(--foreground-subtle)' }}>
              <Bell size={16} />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--secondary)' }} />
            </button>

            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setShowUserMenu(v => !v)} className="p-0.5 rounded hover:bg-white/5 transition-colors">
                <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name}&background=4FBCFF&color=fff`}
                  className="w-6 h-6 rounded-full object-cover" alt="" />
              </button>
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }} transition={{ duration: 0.1 }}
                    className="absolute right-0 top-9 w-48 card shadow-md z-50 overflow-hidden py-1"
                  >
                    <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-sm font-semibold">{user?.name}</p>
                      <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>@{user?.username}</p>
                    </div>
                    <button onClick={() => { navigate(`/profile/${user?.username}`); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors">
                      <User size={12} /> Profile
                    </button>
                    <button onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors">
                      <SettingsIcon size={12} /> Settings
                    </button>
                    <div className="border-t mx-2 my-1" style={{ borderColor: 'var(--border)' }} />
                    <button onClick={() => { logout(); navigate('/login'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors"
                      style={{ color: 'var(--secondary)' }}>
                      <LogOut size={12} /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex-1"
          >
            {children}
          </motion.div>
        </AnimatePresence>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 py-3 glass-panel pb-safe">
          {[
            { path: '/', Icon: HomeIcon },
            { path: '/explore', Icon: Compass },
            { path: '/trending', Icon: Flame },
            { path: '/notifications', Icon: Bell },
            { path: `/profile/${user?.username || ''}`, Icon: User },
          ].map(({ path, Icon }, i) => (
            <button key={i} onClick={() => navigate(path)}
              className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all relative"
            >
              <Icon size={22} style={{ color: isActive(path) ? 'var(--primary)' : 'var(--foreground-muted)' }} />
              {isActive(path) && (
                <motion.div layoutId="navIndicator" className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary)' }} />
              )}
            </button>
          ))}
        </nav>

        {/* Mobile Floating Action Button */}
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreatePost(true)}
          className="md:hidden fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full btn-primary flex items-center justify-center shadow-xl"
        >
          <PlusCircle size={24} />
        </motion.button>
      </main>

      <div className="hidden lg:flex fixed right-0 top-0 h-full w-[320px] flex-col border-l z-20 overflow-y-auto no-scrollbar glass-panel"
        style={{ borderColor: 'var(--border)' }}
      >
        <RightPanel />
      </div>

      <ChatWidget />

      <AnimatePresence>
        {showCreatePost && <CreatePostModal onClose={() => setShowCreatePost(false)} />}
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/" element={<PrivateRoute><Layout><Home /></Layout></PrivateRoute>} />
        <Route path="/explore" element={<PrivateRoute><Layout><Explore /></Layout></PrivateRoute>} />
        <Route path="/trending" element={<PrivateRoute><Layout><Trending /></Layout></PrivateRoute>} />
        <Route path="/reels" element={<PrivateRoute><Layout><Reels /></Layout></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><Layout><Notifications /></Layout></PrivateRoute>} />
        <Route path="/communities" element={<PrivateRoute><Layout><Communities /></Layout></PrivateRoute>} />
        <Route path="/post/:id" element={<PrivateRoute><Layout><PostDetail /></Layout></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
        <Route path="/profile/:username" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><Layout><AdminDashboard /></Layout></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
