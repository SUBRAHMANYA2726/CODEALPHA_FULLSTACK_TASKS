import React, { useState, useRef, useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, X, Loader2, Send, Sparkles, Smile, MapPin } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import StoriesRing from '../components/StoriesRing';

const CreatePostModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => api.post('/posts', data),
    onSuccess: () => {
      qc.invalidateQueries(['feed']);
      onSuccess?.();
      onClose();
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/upload/post-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImageUrl(res.data.imageUrl);
    } catch {
      alert('Upload failed. Paste an image URL instead.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) return;
    const hashtags = (content.match(/#(\w+)/g) || []).map(h => h.slice(1));
    mutation.mutate({ content, image: imageUrl, hashtags });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 dark:bg-black/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg glass-panel shadow-2xl rounded-2xl overflow-hidden border border-black/5 dark:border-white/10"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20">
          <h2 className="text-[15px] font-bold" style={{ color: 'var(--foreground)' }}>Create Post</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col bg-white dark:bg-[#1a1b1e]">
          <div className="flex gap-4 mb-4">
            <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name}&background=5c3ce6&color=fff`}
              className="w-10 h-10 rounded-full object-cover shadow-sm border border-black/5 dark:border-white/5" alt="" />
            <div className="flex-1 flex flex-col gap-2 pt-1">
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={4}
                placeholder="What's happening?"
                className="w-full resize-none text-[17px] focus:outline-none bg-transparent placeholder-gray-400 dark:placeholder-gray-500 font-medium"
                style={{ color: 'var(--foreground)' }} autoFocus
              />
            </div>
          </div>

          {imageUrl && (
            <div className="relative mb-4 rounded-xl overflow-hidden border border-black/5 dark:border-white/5 ml-14">
              <img src={imageUrl} alt="Preview" className="w-full max-h-64 object-cover" />
              <button type="button" onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors backdrop-blur-md">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="ml-14 mb-4">
            <input type="url" placeholder="Or paste an image URL..."
              value={imageUrl} onChange={e => setImageUrl(e.target.value)}
              className="w-full rounded-lg px-4 py-2 text-sm border focus:outline-none focus:border-[var(--primary)] transition-colors bg-black/5 dark:bg-white/5 border-transparent"
              style={{ color: 'var(--foreground)' }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 pt-4 border-t border-black/5 dark:border-white/5 ml-14">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors text-blue-500"
                title="Add Photo"
              >
                {uploading ? <Loader2 size={20} className="animate-spin" /> : <Image size={20} />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              
              <button type="button" className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors text-blue-500" title="Add Emoji">
                <Smile size={20} />
              </button>
              <button type="button" className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors text-blue-500" title="Add Location">
                <MapPin size={20} />
              </button>
            </div>

            <button type="submit" disabled={(!content.trim() && !imageUrl) || mutation.isPending}
              className="gradient-primary text-white font-bold px-6 py-2 rounded-full text-sm disabled:opacity-50 shadow-colored transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Post'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const InlineCreatePost = ({ onFocus }) => {
  const { user } = useAuth();
  
  return (
    <div className="card p-4 mb-6 cursor-text border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-colors shadow-sm" onClick={onFocus}>
      <div className="flex gap-4">
        <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name}&background=5c3ce6&color=fff`}
          className="w-12 h-12 rounded-full object-cover shadow-sm" alt="" />
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-[17px] text-gray-500 dark:text-gray-400 font-medium">What's happening?</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/5 dark:border-white/5 ml-16">
        <div className="flex gap-2">
          <div className="text-blue-500 p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"><Image size={20} /></div>
          <div className="text-blue-500 p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"><Smile size={20} /></div>
          <div className="text-blue-500 p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"><MapPin size={20} /></div>
        </div>
        <button className="gradient-primary text-white font-bold px-5 py-1.5 rounded-full text-sm shadow-colored">
          Post
        </button>
      </div>
    </div>
  );
};

const Home = () => {
  const { user } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [deletedIds, setDeletedIds] = useState(new Set());
  const loaderRef = useRef(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 1 }) => api.get(`/posts?page=${pageParam}&limit=10`).then(r => r.data),
    getNextPageParam: (last) => last.page < last.pages ? last.page + 1 : undefined,
    initialPageParam: 1
  });

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) { fetchNextPage(); }
    }, { threshold: 0.1 });
    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPosts = data?.pages.flatMap(p => p.posts) ?? [];
  const visiblePosts = allPosts.filter(p => !deletedIds.has(p._id));

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6 pb-24 lg:pb-6 relative">
      
      {/* Header for mobile/tablet */}
      <div className="flex items-center justify-between lg:hidden mb-2">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Home</h1>
        <Sparkles size={24} className="text-[var(--primary)]" />
      </div>

      {/* Stories */}
      <div className="card p-3 mb-2 shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-colors">
        <StoriesRing />
      </div>

      {/* Create Post Inline */}
      <InlineCreatePost onFocus={() => setShowCreatePost(true)} />

      {/* Feed */}
      {isLoading && (
        <div className="flex flex-col gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-5 space-y-4 shadow-sm border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full skeleton" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-3 w-1/4 rounded skeleton" />
                  <div className="h-2 w-1/5 rounded skeleton" />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <div className="h-3 rounded skeleton" />
                <div className="h-3 w-5/6 rounded skeleton" />
                <div className="h-3 w-4/6 rounded skeleton" />
              </div>
              <div className="h-64 rounded-xl skeleton mt-4" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="card p-8 text-center border-red-500/20 bg-red-500/5">
          <p className="text-sm font-bold text-red-500">Failed to load feed</p>
          <p className="text-xs mt-1 font-medium text-red-400">Please check your connection and try again.</p>
        </div>
      )}

      {!isLoading && visiblePosts.length === 0 && !isError && (
        <div className="card p-10 text-center shadow-sm">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full mb-4 gradient-primary shadow-colored">
            <Sparkles size={28} className="text-white" />
          </div>
          <p className="font-bold text-lg mb-2" style={{ color: 'var(--foreground)' }}>No posts yet</p>
          <p className="text-sm mb-6 font-medium" style={{ color: 'var(--foreground-muted)' }}>Be the first to start a conversation with the community.</p>
          <button onClick={() => setShowCreatePost(true)} className="gradient-primary text-white font-bold px-6 py-2.5 rounded-full text-sm shadow-colored hover:scale-105 active:scale-95 transition-transform">
            Create First Post
          </button>
        </div>
      )}

      <div className="space-y-0">
        {visiblePosts.map(post => (
          <PostCard key={post._id} post={post} onDelete={id => setDeletedIds(s => new Set([...s, id]))} />
        ))}
      </div>

      <div ref={loaderRef} className="h-12 flex items-center justify-center">
        {isFetchingNextPage && <Loader2 className="animate-spin text-[var(--primary)]" size={24} />}
        {!hasNextPage && visiblePosts.length > 0 && (
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>
            <span className="w-12 h-px bg-current opacity-20" />
            You've reached the end
            <span className="w-12 h-px bg-current opacity-20" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreatePost && <CreatePostModal onClose={() => setShowCreatePost(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Home;
