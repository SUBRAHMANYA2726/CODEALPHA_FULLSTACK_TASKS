import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Loader2, Heart, MessageCircle, UserPlus, Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

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
      case 'like': return <div className="p-2 rounded-full" style={{ background: '#FEE2E2', color: '#EF4444' }}><Heart size={16} fill="currentColor" /></div>;
      case 'comment': return <div className="p-2 rounded-full" style={{ background: '#DBEAFE', color: '#2563EB' }}><MessageCircle size={16} fill="currentColor" /></div>;
      case 'follow': return <div className="p-2 rounded-full" style={{ background: '#EDE9FE', color: '#8B5CF6' }}><UserPlus size={16} fill="currentColor" /></div>;
      default: return <div className="p-2 rounded-full" style={{ background: '#F1F5F9', color: '#64748B' }}><Bell size={16} /></div>;
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin" size={32} style={{ color: 'var(--primary)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center">
            <Bell size={18} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold">Notifications</h2>
        </div>
        {notifications?.some(n => !n.isRead) && (
          <button onClick={() => markAllReadMutation.mutate()}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-colors"
            style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {notifications?.length > 0 ? (
          notifications.map((n) => (
            <div key={n._id} onClick={() => !n.isRead && markReadMutation.mutate(n._id)}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${n.isRead ? 'card' : ''}`}
              style={!n.isRead ? { background: 'var(--primary-light)', borderColor: 'rgba(37,99,235,0.2)' } : { borderColor: 'var(--border)' }}
            >
              {getIcon(n.type)}
              <div className="flex-1">
                <p className="text-sm">
                  <Link to={`/profile/${n.sender.username}`} className="font-bold hover:underline">{n.sender.name}</Link>{' '}
                  {getMessage(n)}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
                {n.post?.content && n.type === 'comment' && (
                  <div className="mt-2 p-3 rounded-xl text-sm italic" style={{ background: 'var(--muted)', color: 'var(--foreground-muted)' }}>
                    "{n.post.content.length > 60 ? n.post.content.slice(0, 60) + '...' : n.post.content}"
                  </div>
                )}
              </div>
              {!n.isRead && <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-2 gradient-primary" />}
            </div>
          ))
        ) : (
          <div className="card p-10 text-center">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-2xl bg-muted mb-4">
              <Bell size={24} style={{ color: 'var(--foreground-muted)' }} />
            </div>
            <p className="font-bold text-lg">All caught up!</p>
            <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>You have no new notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
