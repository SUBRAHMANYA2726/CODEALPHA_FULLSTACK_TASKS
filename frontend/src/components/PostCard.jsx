import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bookmark, ChevronDown, ChevronUp, Edit3, Flag, MessageCircle, MoreHorizontal, Send, Share2, Trash2, Heart } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import ImageLightbox from './ImageLightbox';

const PostCard = ({ post, onDelete }) => {
  const qc = useQueryClient();
  const { user } = useAuth();

  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [bookmarked, setBookmarked] = useState(user?.bookmarks?.includes(post._id));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const menuRef = useRef(null);

  const isOwner = user?._id === post.author?._id;

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleVote = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);
    
    try {
      await api.post(`/posts/${post._id}/like`);
      qc.invalidateQueries(['posts']);
    } catch {
      setLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
    }
  };

  const handleBookmark = async () => {
    const was = bookmarked;
    setBookmarked(!was);
    try {
      await api.post(`/posts/${post._id}/bookmark`);
    } catch {
      setBookmarked(was);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post._id}`;
    if (navigator.share) {
      await navigator.share({ title: post.author?.name, text: post.content, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      try {
        const res = await api.get(`/posts/${post._id}/comments`);
        setComments(res.data);
      } catch { }
    }
    setShowComments((v) => !v);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await api.post(`/posts/${post._id}/comments`, { text: commentText });
      setComments((prev) => [...prev, res.data]);
      setCommentText('');
      qc.invalidateQueries(['posts']);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEdit = async () => {
    try {
      await api.put(`/posts/${post._id}`, { content: editContent });
      post.content = editContent;
      setIsEditing(false);
      qc.invalidateQueries(['posts']);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update post');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      onDelete?.(post._id);
      qc.invalidateQueries(['posts']);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleReport = async () => {
    const reason = prompt('Why are you reporting this post?');
    if (!reason) return;
    try {
      await api.post('/reports', { targetType: 'Post', targetId: post._id, reason });
    } catch { }
    setShowMenu(false);
  };

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
    } catch {
      return 'recently';
    }
  })();

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="card group overflow-hidden mb-6 flex flex-col transition-all duration-300 hover:shadow-xl dark:hover:shadow-colored/10 border border-transparent hover:border-gray-200 dark:hover:border-white/10 relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-light)] to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between p-4 relative z-10">
        <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-3 group/user">
          <img src={post.author?.profilePicture || `https://ui-avatars.com/api/?name=${post.author?.name}&background=5c3ce6&color=fff`}
            alt={post.author?.name} className="w-11 h-11 rounded-full object-cover shadow-sm border-2 border-transparent group-hover/user:border-[var(--primary)] transition-all" />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-[15px] leading-none group-hover/user:text-[var(--primary)] transition-colors">{post.author?.name}</p>
              {post.author?.isVerified && (
                <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px]">✓</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
              <span>@{post.author?.username}</span>
              <span>·</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </Link>

        <div className="relative" ref={menuRef}>
          <button type="button" onClick={() => setShowMenu((v) => !v)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <MoreHorizontal size={18} />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-10 w-44 card shadow-xl z-20 overflow-hidden py-1 border"
                style={{ borderColor: 'var(--border)' }}
              >
                {isOwner && (
                  <>
                    <button type="button" onClick={() => { setIsEditing(true); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/5 text-left transition-colors font-medium" style={{ color: 'var(--foreground)' }}>
                      <Edit3 size={16} /> Edit
                    </button>
                    <button type="button" onClick={handleDelete} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-500/10 text-left transition-colors font-medium text-red-500">
                      <Trash2 size={16} /> Delete
                    </button>
                    <div className="border-t mx-3 my-1" style={{ borderColor: 'var(--border)' }} />
                  </>
                )}
                <button type="button" onClick={handleReport} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/5 text-left transition-colors font-medium" style={{ color: 'var(--foreground)' }}>
                  <Flag size={16} /> Report
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3 relative z-10">
        {isEditing ? (
          <div className="flex flex-col gap-3">
            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} className="w-full rounded-xl border p-4 text-[15px] resize-none focus:outline-none focus:ring-2 ring-[var(--primary-light)] transition-all shadow-inner bg-black/5 dark:bg-white/5" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }} />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-full text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Cancel</button>
              <button type="button" onClick={handleEdit} className="btn-primary px-5 py-2 rounded-full text-sm font-bold shadow-colored">Save</button>
            </div>
          </div>
        ) : (
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium" style={{ color: 'var(--foreground)' }}>
            {post.content}
          </p>
        )}

        {post.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.hashtags.map((tag, i) => (
              <Link to={`/trending`} key={i} className="text-[13px] font-bold hover:underline transition-all" style={{ color: 'var(--primary)' }}>#{tag}</Link>
            ))}
          </div>
        )}
      </div>

      {/* Media (Edge-to-Edge) */}
      {(post.image || post.video) && (
        <div className="w-full relative z-10 mt-1 cursor-pointer bg-black/5 dark:bg-white/5" onClick={() => setLightboxOpen(true)}>
          {post.image && (
            <img src={post.image} alt="Post content" className="w-full max-h-[500px] object-cover transition-opacity hover:opacity-95" />
          )}
          {post.video && (
            <video src={post.video} controls className="w-full max-h-[500px] object-contain bg-black" />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-2 py-2 relative z-10 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleVote}
            className={`flex items-center gap-2 px-3 py-2 rounded-full font-bold text-sm transition-all hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-95 ${liked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <Heart size={20} fill={liked ? 'currentColor' : 'none'} className={liked ? 'scale-110' : ''} style={{ transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
            <span>{likesCount}</span>
          </button>
          
          <button
            type="button"
            onClick={toggleComments}
            className={`flex items-center gap-2 px-3 py-2 rounded-full font-bold text-sm transition-all hover:bg-blue-50 dark:hover:bg-blue-500/10 active:scale-95 ${showComments ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <MessageCircle size={20} fill={showComments ? 'currentColor' : 'none'} />
            <span>{comments.length}</span>
          </button>
          
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 rounded-full font-bold text-sm transition-all hover:bg-green-50 dark:hover:bg-green-500/10 active:scale-95 text-gray-500 dark:text-gray-400"
          >
            <Share2 size={20} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleBookmark}
          className={`flex items-center gap-2 px-3 py-2 rounded-full font-bold text-sm transition-all hover:bg-purple-50 dark:hover:bg-purple-500/10 active:scale-95 ${bookmarked ? 'text-purple-500' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <Bookmark size={20} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
            <div className="p-4">
              <div className="flex flex-col gap-4 max-h-64 overflow-y-auto no-scrollbar">
                {comments.length === 0 && <p className="text-sm text-center py-4 text-gray-500 font-medium">Be the first to comment!</p>}
                
                {comments.map((comment) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={comment._id} className="flex gap-3 group/comment">
                    <img src={comment.author?.profilePicture || `https://ui-avatars.com/api/?name=${comment.author?.name}&background=5c3ce6&color=fff`} className="w-8 h-8 rounded-full object-cover flex-shrink-0 shadow-sm" alt="" />
                    <div className="flex-1">
                      <div className="inline-block rounded-2xl rounded-tl-sm px-4 py-2.5 bg-white dark:bg-[#1e1e24] shadow-sm border border-black/5 dark:border-white/5">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[13px] font-bold" style={{ color: 'var(--foreground)' }}>{comment.author?.name}</span>
                          <span className="text-[10px] font-semibold text-gray-400">
                            {(() => {
                              try {
                                return formatDistanceToNow(new Date(comment.createdAt || Date.now()), { addSuffix: true });
                              } catch {
                                return 'recently';
                              }
                            })()}
                          </span>
                        </div>
                        <p className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>{comment.text}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <form onSubmit={submitComment} className="flex gap-3 mt-2">
                  <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name}&background=5c3ce6&color=fff`} className="w-9 h-9 rounded-full object-cover flex-shrink-0 shadow-sm" alt="" />
                  <div className="flex-1 flex items-center gap-2 rounded-full bg-white dark:bg-[#1e1e24] px-4 py-1.5 shadow-sm border border-black/5 dark:border-white/5 focus-within:ring-2 ring-[var(--primary-light)] transition-all">
                    <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." className="flex-1 bg-transparent border-none outline-none text-sm font-medium h-9" />
                    <button type="submit" disabled={!commentText.trim() || submittingComment} className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50" style={{ color: commentText.trim() ? 'var(--primary)' : 'var(--foreground-muted)' }}>
                      <Send size={16} className={commentText.trim() ? '-translate-y-0.5 translate-x-0.5 transition-transform' : ''} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {lightboxOpen && post.image && <ImageLightbox src={post.image} alt="Post image" onClose={() => setLightboxOpen(false)} />}
    </motion.article>
  );
};

export default PostCard;

