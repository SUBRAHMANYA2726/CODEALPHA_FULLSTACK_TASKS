import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Loader2, TrendingUp, Users, Sparkles, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const RightPanel = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [onlineFriends, setOnlineFriends] = useState([]);

  const { data: suggestions, isLoading: loadingSuggestions } = useQuery({
    queryKey: ['suggestions'],
    queryFn: () => api.get('/users/suggestions/list').then(res => res.data),
  });

  const { data: trendingPosts, isLoading: loadingTrending } = useQuery({
    queryKey: ['trending'],
    queryFn: () => api.get('/posts/trending').then(res => res.data),
  });

  const hashtags = React.useMemo(() => {
    if (!Array.isArray(trendingPosts)) return [];
    const tags = {};
    trendingPosts.forEach(post => {
      post.hashtags?.forEach(tag => { tags[tag] = (tags[tag] || 0) + 1; });
    });
    return Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([tag, count]) => ({ tag, count }));
  }, [trendingPosts]);

  const followMutation = useMutation({
    mutationFn: (targetId) => api.post(`/users/${targetId}/follow`),
    onSuccess: () => {
      qc.invalidateQueries(['suggestions']);
      qc.invalidateQueries(['user', user?.username]);
    }
  });

  useEffect(() => {
    if (!window.socket) return;
    const handleOnlineUsers = (userIds) => {
      setOnlineFriends(userIds.filter(id => id !== user?._id));
    };
    window.socket.on('online_users', handleOnlineUsers);
    return () => window.socket?.off('online_users', handleOnlineUsers);
  }, [user]);

  const SkeletonItem = () => (
    <div className="flex items-center gap-3 w-full">
      <div className="w-10 h-10 rounded-full skeleton flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/4 rounded skeleton" />
        <div className="h-2 w-1/2 rounded skeleton" />
      </div>
    </div>
  );

  return (
    <aside className="w-full h-full p-5 flex flex-col gap-5 overflow-y-auto no-scrollbar pt-6 pb-24 lg:pb-6">
      
      {/* Suggestions Section */}
      <div className="card p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
          <Users size={64} />
        </div>
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white shadow-colored">
            <Sparkles size={16} />
          </div>
          <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Who to Follow</h3>
        </div>

        <div className="flex flex-col gap-4 relative z-10">
          {loadingSuggestions ? (
            <>
              <SkeletonItem />
              <SkeletonItem />
              <SkeletonItem />
            </>
          ) : suggestions?.length > 0 ? (
            <AnimatePresence>
              {suggestions.slice(0, 4).map((u, i) => (
                <motion.div key={u._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 group/user"
                >
                  <Link to={`/profile/${u.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <img src={u.profilePicture || `https://ui-avatars.com/api/?name=${u.name}&background=5c3ce6&color=fff`}
                      alt={u.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-transparent group-hover/user:border-[var(--primary)] transition-all" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate group-hover/user:text-[var(--primary)] transition-colors">{u.name}</p>
                      <p className="text-[11px] truncate" style={{ color: 'var(--foreground-muted)' }}>@{u.username}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => followMutation.mutate(u._id)}
                    disabled={followMutation.isPending}
                    className="px-4 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 hover:scale-105 active:scale-95"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                  >
                    Follow
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <p className="text-xs text-center py-4 bg-black/5 dark:bg-white/5 rounded-xl" style={{ color: 'var(--foreground-subtle)' }}>No suggestions right now</p>
          )}
        </div>
      </div>

      {/* Trending Section */}
      <div className="card p-5 relative overflow-hidden group">
        <div className="absolute -bottom-4 -right-4 p-4 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-500">
          <TrendingUp size={80} />
        </div>
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Flame size={18} />
          </div>
          <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Trending Topics</h3>
        </div>

        <div className="flex flex-col relative z-10">
          {loadingTrending ? (
            <div className="space-y-4">
              <SkeletonItem />
              <SkeletonItem />
            </div>
          ) : hashtags.length > 0 ? (
            <AnimatePresence>
              {hashtags.map(({ tag, count }, i) => (
                <motion.div key={tag} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 -mx-3 rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors group/tag"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold mt-0.5 transition-colors"
                      style={{ background: 'var(--muted)', color: 'var(--foreground-muted)' }}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--foreground-subtle)' }}>Trending</p>
                      <p className="font-bold text-[15px] group-hover/tag:text-[var(--primary)] transition-colors">#{tag}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--foreground-muted)' }}>{count} post{count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <p className="text-xs text-center py-4 bg-black/5 dark:bg-white/5 rounded-xl" style={{ color: 'var(--foreground-subtle)' }}>Nothing trending</p>
          )}
        </div>
      </div>

      {/* Online Users Minimal Indicator */}
      <div className="flex items-center justify-between px-2 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </div>
          <span className="text-xs font-bold text-green-600 dark:text-green-400">Users Online</span>
        </div>
        <span className="font-bold text-sm text-green-600 dark:text-green-400">{onlineFriends.length + 1}</span>
      </div>

      {/* Footer Links */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] mt-auto pb-2 justify-center" style={{ color: 'var(--foreground-subtle)' }}>
        <span className="hover:text-[var(--primary)] cursor-pointer transition-colors">Privacy Policy</span>
        <span className="hover:text-[var(--primary)] cursor-pointer transition-colors">Terms of Service</span>
        <span className="hover:text-[var(--primary)] cursor-pointer transition-colors">About Us</span>
        <span className="w-full text-center mt-2">© 2026 SocialSphere</span>
      </div>
    </aside>
  );
};

export default RightPanel;

