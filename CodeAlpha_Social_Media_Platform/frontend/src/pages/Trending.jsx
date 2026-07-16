import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Loader2, TrendingUp, Flame } from 'lucide-react';
import PostCard from '../components/PostCard';

const Trending = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['trendingPosts'],
    queryFn: () => api.get('/posts/trending').then(res => res.data)
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin" size={32} style={{ color: 'var(--primary)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Loading trending posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6 pb-24">
      <div className="rounded-3xl p-8 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #EF4444, #F59E0B, #EC4899)' }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-5 right-5 w-32 h-32 rounded-full bg-white" />
          <div className="absolute bottom-5 left-5 w-24 h-24 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Flame size={32} className="text-yellow-300" />
            <h1 className="text-3xl font-black">Trending Now</h1>
          </div>
          <p className="text-white/80 font-medium">See what the community is talking about.</p>
        </div>
        <TrendingUp size={64} className="absolute bottom-4 right-4 opacity-20" />
      </div>

      <div className="flex flex-col gap-6">
        {posts?.length > 0 ? (
          posts.map((post, index) => (
            <div key={post._id} className="relative">
              <div className="absolute -left-12 top-6 font-black text-2xl"
                style={{
                  background: 'linear-gradient(135deg, #EF4444, #F59E0B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                #{index + 1}
              </div>
              <PostCard post={post} />
            </div>
          ))
        ) : (
          <div className="card p-10 text-center">
            <div className="inline-flex justify-center items-center w-14 h-14 rounded-2xl bg-muted mb-3">
              <Flame size={24} style={{ color: 'var(--foreground-muted)' }} />
            </div>
            <p className="font-semibold" style={{ color: 'var(--foreground-muted)' }}>No trending posts right now.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trending;
