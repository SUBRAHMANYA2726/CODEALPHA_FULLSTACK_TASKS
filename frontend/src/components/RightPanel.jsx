import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

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

  return (
    <aside className="w-full h-full p-4 flex flex-col gap-4 overflow-y-auto no-scrollbar pt-5">
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>People to Follow</h3>
        </div>

        {loadingSuggestions ? (
          <div className="flex justify-center p-3"><Loader2 size={16} className="animate-spin" style={{ color: 'var(--primary)' }} /></div>
        ) : suggestions?.length > 0 ? (
          <div className="flex flex-col gap-2">
            {suggestions.slice(0, 4).map(u => (
              <motion.div key={u._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 group">
                <Link to={`/profile/${u.username}`} className="flex items-center gap-2 flex-1 min-w-0">
                  <img src={u.profilePicture || `https://ui-avatars.com/api/?name=${u.name}&background=4FBCFF&color=fff`}
                    alt={u.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{u.name}</p>
                    <p className="text-[10px] truncate" style={{ color: 'var(--foreground-muted)' }}>@{u.username}</p>
                  </div>
                </Link>
                <button
                  onClick={() => followMutation.mutate(u._id)}
                  disabled={followMutation.isPending}
                  className="px-2.5 py-1 rounded text-[11px] font-bold transition-all flex-shrink-0"
                  style={{ background: 'var(--primary)', color: 'white' }}
                >
                  Follow
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-center py-2" style={{ color: 'var(--foreground-muted)' }}>No suggestions</p>
        )}
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Trending Topics</h3>
        </div>

        {loadingTrending ? (
          <div className="flex justify-center p-3"><Loader2 size={16} className="animate-spin" style={{ color: 'var(--primary)' }} /></div>
        ) : hashtags.length > 0 ? (
          <div className="flex flex-col gap-0.5">
            {hashtags.map(({ tag, count }, i) => (
              <motion.div key={tag}
                className="flex items-center justify-between p-2 -mx-2 rounded cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div>
                  <p className="text-[10px] font-medium" style={{ color: 'var(--foreground-subtle)' }}>Trending</p>
                  <p className="font-semibold text-sm">#{tag}</p>
                  <p className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>{count} post{count !== 1 ? 's' : ''}</p>
                </div>
                <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold"
                  style={{ background: 'var(--muted)', color: 'var(--foreground-muted)' }}>
                  {i + 1}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-center py-2" style={{ color: 'var(--foreground-muted)' }}>Nothing trending</p>
        )}
      </div>

      <div className="card p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold">Users Online</p>
          <p className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>Right now</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
          <span className="font-bold text-sm">{onlineFriends.length + 1}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] mt-auto pb-4" style={{ color: 'var(--foreground-subtle)' }}>
        <span className="hover:underline cursor-pointer">Privacy</span>
        <span className="hover:underline cursor-pointer">Terms</span>
        <span className="hover:underline cursor-pointer">About</span>
        <span>© 2026 SocialSphere</span>
      </div>
    </aside>
  );
};

export default RightPanel;
