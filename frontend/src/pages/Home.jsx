import React, { useState, useRef, useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, X, Loader2, Send, Sparkles } from 'lucide-react';
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg card overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold">Create Post</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5 transition-colors" style={{ color: 'var(--foreground-subtle)' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name}&background=4FBCFF&color=fff`}
              className="w-8 h-8 rounded-full object-cover" alt="" />
            <div>
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-[11px]" style={{ color: 'var(--foreground-muted)' }}>@{user?.username}</p>
            </div>
          </div>

          <textarea value={content} onChange={e => setContent(e.target.value)} rows={3}
            placeholder="What's on your mind?"
            className="w-full resize-none rounded p-3 text-sm focus:outline-none border"
            style={{ background: 'var(--input-bg)', borderColor: 'var(--border)' }} autoFocus
          />

          {imageUrl && (
            <div className="relative mt-2 rounded overflow-hidden">
              <img src={imageUrl} alt="Preview" className="w-full max-h-40 object-cover" />
              <button type="button" onClick={() => setImageUrl('')}
                className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded p-0.5">
                <X size={12} />
              </button>
            </div>
          )}

          <input type="url" placeholder="Image URL..."
            value={imageUrl} onChange={e => setImageUrl(e.target.value)}
            className="mt-2 w-full rounded px-3 py-1.5 text-xs border focus:outline-none"
            style={{ background: 'var(--input-bg)', borderColor: 'var(--border)' }}
          />

          <div className="flex items-center justify-between mt-3">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium hover:bg-white/5 transition-colors"
              style={{ color: 'var(--primary)' }}
            >
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Image size={12} />}
              Photo
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

            <button type="submit" disabled={(!content.trim() && !imageUrl) || mutation.isPending}
              className="btn btn-primary px-4 py-1.5 text-xs disabled:opacity-50"
            >
              {mutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <><Send size={12} /> Post</>}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
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
    <div className="max-w-2xl mx-auto px-3 py-4 flex flex-col gap-3 pb-24 md:pb-6">
      <div className="card p-3">
        <StoriesRing />
      </div>

      <div className="card p-2 flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setShowCreatePost(true)}
      >
        <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name}&background=4FBCFF&color=fff`}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0" alt="" />
        <div className="flex-1 rounded px-3 py-2 text-xs"
          style={{ background: 'var(--muted)', color: 'var(--foreground-subtle)', border: '1px solid var(--border)' }}>
          What's on your mind?
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="card p-3 flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <div className="w-6 h-6 rounded-full skeleton" />
                <div className="h-3 w-24 rounded skeleton" />
              </div>
              <div className="h-12 rounded skeleton" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="card p-6 text-center">
          <p className="text-sm font-semibold" style={{ color: 'var(--secondary)' }}>Failed to load feed</p>
          <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>Is the backend running?</p>
        </div>
      )}

      {!isLoading && visiblePosts.length === 0 && (
        <div className="card p-8 text-center">
          <div className="inline-flex justify-center items-center w-12 h-12 rounded mb-3" style={{ background: 'var(--primary)' }}>
            <Sparkles size={20} className="text-white" />
          </div>
          <p className="font-semibold text-sm mb-1">Your feed is empty</p>
          <p className="text-xs mb-3" style={{ color: 'var(--foreground-muted)' }}>Follow users or create a post.</p>
          <button onClick={() => setShowCreatePost(true)} className="btn btn-primary px-4 text-xs">
            Create First Post
          </button>
        </div>
      )}

      {visiblePosts.map(post => (
        <PostCard key={post._id} post={post} onDelete={id => setDeletedIds(s => new Set([...s, id]))} />
      ))}

      <div ref={loaderRef} className="h-6 flex items-center justify-center">
        {isFetchingNextPage && <Loader2 className="animate-spin" size={16} style={{ color: 'var(--primary)' }} />}
        {!hasNextPage && visiblePosts.length > 0 && (
          <p className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>No more posts</p>
        )}
      </div>

      <AnimatePresence>
        {showCreatePost && <CreatePostModal onClose={() => setShowCreatePost(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Home;
