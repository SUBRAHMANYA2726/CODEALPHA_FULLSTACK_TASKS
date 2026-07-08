import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Compass, Flame, PlaySquare,
  Bell, User, Users, Settings, LogOut,
  ChevronLeft, ChevronRight, PlusCircle, Shield
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
    <div className="h-full flex flex-col py-2 overflow-hidden">
      <div className={`flex items-center px-3 mb-3 ${collapsed ? 'justify-center' : 'gap-2 justify-between'}`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'var(--primary)' }}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="text-base font-bold whitespace-nowrap overflow-hidden"
                style={{ color: 'var(--foreground)' }}
              >
                SocialSphere
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {!collapsed && (
          <button onClick={onToggle} className="p-1 rounded hover:bg-white/5 transition-colors flex-shrink-0" style={{ color: 'var(--foreground-subtle)' }} title="Collapse">
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center mb-2">
          <button onClick={onToggle} className="p-1.5 rounded hover:bg-white/5 transition-colors" style={{ color: 'var(--foreground-subtle)' }} title="Expand">
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      <div className={`px-2 mb-2 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={onCreatePost}
          className={`btn btn-primary ${collapsed ? 'w-9 h-9 p-0' : 'w-full py-2 text-sm'}`}
        >
          <PlusCircle size={16} />
          {!collapsed && <span>Create Post</span>}
        </button>
      </div>

      <div className="border-t mx-3 mb-1" style={{ borderColor: 'var(--border)' }} />

      <nav className="flex flex-col gap-0.5 px-2 flex-1 overflow-y-auto no-scrollbar pt-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path.split('/')[0]));

          return (
            <Link
              key={path}
              to={path}
              title={collapsed ? label : undefined}
              className={`relative flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-all group
                ${collapsed ? 'justify-center' : ''}
              `}
              style={{
                background: isActive ? 'var(--muted)' : 'transparent',
                color: isActive ? 'var(--foreground)' : 'var(--foreground-muted)'
              }}
            >
              <Icon size={18} className="flex-shrink-0" />

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.12 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>

              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-card border whitespace-nowrap"
                  style={{ background: 'var(--card)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
                >
                  {label}
                </div>
              )}
            </Link>
          );
        })}

        {user?.isAdmin && (
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-all hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}
            style={{ color: 'var(--secondary)' }}
          >
            <Shield size={18} className="flex-shrink-0" />
            {!collapsed && <span>Admin</span>}
          </Link>
        )}
      </nav>

      <div className="border-t mx-3 mt-2 mb-2" style={{ borderColor: 'var(--border)' }} />

      <div className={`px-2 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-2 p-2 rounded hover:bg-white/5 transition-colors cursor-pointer group"
            onClick={() => navigate(`/profile/${user?.username}`)}
          >
            <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name}&background=4FBCFF&color=fff`}
              className="w-7 h-7 rounded-full object-cover flex-shrink-0" alt={user?.name} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--foreground-muted)' }}>@{user?.username}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); logout(); navigate('/login'); }}
              className="p-1 rounded hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0" style={{ color: 'var(--foreground-subtle)' }} title="Log out">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button onClick={() => { logout(); navigate('/login'); }} className="p-1.5 rounded hover:bg-white/5 transition-colors" style={{ color: 'var(--foreground-subtle)' }} title="Log out">
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
