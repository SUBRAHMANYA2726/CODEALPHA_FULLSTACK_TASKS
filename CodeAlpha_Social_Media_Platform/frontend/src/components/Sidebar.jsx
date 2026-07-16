import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Compass, Flame, PlaySquare,
  Bell, User, Users, Settings, LogOut,
  ChevronLeft, ChevronRight, PlusCircle, Shield, Sparkles
} from 'lucide-react';

const Sidebar = ({ collapsed, onToggle, onCreatePost }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/',              label: 'Home',          icon: Home },
    { path: '/explore',       label: 'Explore',       icon: Compass },
    { path: '/trending',      label: 'Trending',      icon: Flame },
    { path: '/reels',         label: 'Reels',         icon: PlaySquare },
    { path: '/communities',   label: 'Communities',   icon: Users },
    { path: '/notifications', label: 'Notifications', icon: Bell },
    { path: '/profile/' + (user?.username || ''), label: 'Profile', icon: User },
    { path: '/settings',      label: 'Settings',      icon: Settings },
  ];

  return (
    <div className="h-full flex flex-col py-4 overflow-hidden relative">
      <div className={`flex items-center px-4 mb-6 ${collapsed ? 'justify-center' : 'gap-2 justify-between'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 gradient-primary shadow-colored">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-lg font-bold whitespace-nowrap overflow-hidden tracking-tight"
                style={{ color: 'var(--foreground)' }}
              >
                SocialSphere
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {!collapsed && (
          <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex-shrink-0" style={{ color: 'var(--foreground-subtle)' }} title="Collapse">
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center mb-4">
          <button onClick={onToggle} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-sm" style={{ background: 'var(--surface)', color: 'var(--foreground-subtle)' }} title="Expand">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <div className={`px-4 mb-4 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={onCreatePost}
          className={`btn btn-primary shadow-colored ${collapsed ? 'w-10 h-10 p-0 rounded-xl' : 'w-full py-3 text-sm rounded-xl'}`}
        >
          <PlusCircle size={18} />
          {!collapsed && <span className="font-bold">Create Post</span>}
        </button>
      </div>

      <nav className="flex flex-col gap-1 px-3 flex-1 overflow-y-auto no-scrollbar pt-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path.split('/')[0]));

          return (
            <Link
              key={path}
              to={path}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group overflow-visible
                ${collapsed ? 'justify-center' : ''}
              `}
              style={{
                background: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--foreground-subtle)'
              }}
            >
              <Icon size={20} className={`flex-shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>

              {collapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 z-50 shadow-lg border whitespace-nowrap"
                  style={{ background: 'var(--surface)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
                >
                  {label}
                </div>
              )}
            </Link>
          );
        })}

        {user?.isAdmin && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-black/5 dark:hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}
              style={{ color: 'var(--danger)' }}
            >
              <Shield size={20} className="flex-shrink-0" />
              {!collapsed && <span>Admin</span>}
            </Link>
          </div>
        )}
      </nav>

      <div className={`px-4 mt-auto pt-4 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group card border-transparent hover:border-gray-200 dark:hover:border-gray-800 shadow-none"
            onClick={() => navigate(`/profile/${user?.username}`)}
          >
            <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name}&background=5c3ce6&color=fff`}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 shadow-sm" alt={user?.name} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user?.name}</p>
              <p className="text-[11px] truncate" style={{ color: 'var(--foreground-muted)' }}>@{user?.username}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); logout(); navigate('/login'); }}
              className="p-1.5 rounded-lg hover:bg-danger hover:text-white transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0" style={{ color: 'var(--foreground-subtle)' }} title="Log out">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={() => { logout(); navigate('/login'); }} className="p-2.5 rounded-xl hover:bg-danger hover:text-white transition-colors shadow-sm" style={{ background: 'var(--surface)', color: 'var(--foreground-subtle)' }} title="Log out">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

