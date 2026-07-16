import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Loader2, Play } from 'lucide-react';
import PostCard from '../components/PostCard';

const Reels = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['reels'],
    queryFn: () => api.get('/posts?limit=50').then(res => res.data.posts.filter(p => p.video))
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin" size={32} style={{ color: 'var(--primary)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Loading reels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 flex flex-col gap-8 items-center pb-24">
      <div className="rounded-3xl p-6 w-full text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-3 right-3 w-24 h-24 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <Play size={24} fill="currentColor" />
            <h1 className="text-2xl font-black">Reels</h1>
          </div>
          <p className="text-white/80 text-sm font-medium mt-1">Watch short videos from the community.</p>
        </div>
      </div>

      <div className="flex flex-col gap-8 w-full">
        {posts?.length > 0 ? (
          posts.map(post => (
            <div key={post._id} className="snap-center w-full">
              <PostCard post={post} />
            </div>
          ))
        ) : (
          <div className="card p-10 text-center w-full">
            <div className="inline-flex justify-center items-center w-14 h-14 rounded-2xl bg-muted mb-3">
              <Play size={24} style={{ color: 'var(--foreground-muted)' }} />
            </div>
            <p className="font-semibold" style={{ color: 'var(--foreground-muted)' }}>No reels available right now.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reels;
