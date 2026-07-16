import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Loader2, Heart, MessageCircle, UserPlus, Bell, CheckCheck, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
  const qc = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(res => res.data)
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries(['notifications'])
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries(['notifications'])
  });

  useEffect(() => {
    if (!window.socket) return;
    const handleNotification = () => qc.invalidateQueries(['notifications']);
    window.socket.on('notification', handleNotification);
    return () => window.socket.off('notification', handleNotification);
  }, [qc]);

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500"><Heart size={18} fill="currentColor" /></div>;
      case 'comment': return <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500"><MessageCircle size={18} fill="currentColor" /></div>;
      case 'follow': return <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-500"><UserPlus size={18} /></div>;
      default: return <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500"><Bell size={18} /></div>;
    }
  };

  const getMessage = (n) => {
    switch (n.type) {
      case 'like': return 'liked your post.';
      case 'comment': return 'commented on your post.';
      case 'follow': return 'started following you.';
      case 'message': return 'sent you a message.';
      default: return 'interacted with you.';
    }
  };

  const unreadCount = notifications?.filter(n => !n.isRead)?.length || 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-colored">
            <Bell size={28} className="text-white animate-pulse" />
          </div>
          <p className="text-sm font-bold" style={{ color: 'var(--foreground-muted)' }}>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-colored">
            <Bell size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{unreadCount} unread</p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => markAllReadMutation.mutate()}
            className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <CheckCheck size={16} /> Mark all read
          </motion.button>
        )}
      </div>

      {/* Notification List */}
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {notifications?.length > 0 ? (
            notifications.map((n, i) => (
              <motion.div key={n._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => !n.isRead && markReadMutation.mutate(n._id)}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer group hover:shadow-md ${
                  n.isRead 
                    ? 'card border-transparent hover:border-gray-200 dark:hover:border-white/10' 
                    : 'bg-[var(--primary-light)] border-[var(--primary)]/20 shadow-sm'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium leading-snug" style={{ color: 'var(--foreground)' }}>
                    <Link to={`/profile/${n.sender?.username}`} className="font-black hover:text-[var(--primary)] transition-colors">
                      {n.sender?.name}
                    </Link>{' '}
                    {getMessage(n)}
                  </p>
                  <p className="text-xs font-semibold mt-1.5" style={{ color: 'var(--foreground-muted)' }}>
                    {(() => {
                      try { return formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }); }
                      catch { return 'recently'; }
                    })()}
                  </p>
                  {n.post?.content && n.type === 'comment' && (
                    <div className="mt-3 p-3 rounded-xl text-sm italic font-medium border border-black/5 dark:border-white/5" 
                      style={{ background: 'var(--muted)', color: 'var(--foreground-muted)' }}>
                      "{n.post.content.length > 80 ? n.post.content.slice(0, 80) + '...' : n.post.content}"
                    </div>
                  )}
                </div>
                
                {!n.isRead && (
                  <div className="flex-shrink-0 mt-2">
                    <div className="w-3 h-3 rounded-full gradient-primary shadow-colored animate-pulse" />
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="card p-12 text-center shadow-sm">
              <div className="inline-flex justify-center items-center w-20 h-20 rounded-full mb-5 gradient-primary shadow-colored">
                <Sparkles size={32} className="text-white" />
              </div>
              <p className="font-black text-xl mb-2" style={{ color: 'var(--foreground)' }}>All caught up!</p>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>You have no new notifications. Check back later.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Notifications;
