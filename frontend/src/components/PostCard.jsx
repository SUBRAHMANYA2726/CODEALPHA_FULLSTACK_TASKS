import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2, Edit3, Flag, Send, ChevronUp, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Link } from 'react-router-dom';
import ImageLightbox from './ImageLightbox';

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const qc = useQueryClient();

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

  const handleVote = async (type) => {
    const wasLiked = liked;
    if (type === 'up') {
      if (wasLiked) {
        setLiked(false);
        setLikesCount(c => c - 1);
      } else {
        setLiked(true);
        setLikesCount(prev => (wasLiked ? prev : prev + 1));
      }
    }
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
    try { await api.post(`/posts/${post._id}/bookmark`); }
    catch { setBookmarked(was); }
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
      } catch {}
    }
    setShowComments(v => !v);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await api.post(`/posts/${post._id}/comments`, { text: commentText });
      setComments(prev => [...prev, res.data]);
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
    } catch {}
    setShowMenu(false);
  };

  const timeAgo = (() => {
    try { return formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }); }
    catch { return 'recently'; }
  })();

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="card overflow-hidden flex"
    >
      <div className="flex flex-col items-center gap-1 pt-3 pb-2 px-2 w-10 flex-shrink-0" style={{ background: 'var(--muted)' }}>
        <button onClick={() => handleVote('up')}
          className="p-1 rounded transition-colors hover:bg-white/5"
          style={{ color: liked ? 'var(--upvote)' : 'var(--foreground-subtle)' }}>
          <ChevronUp size={20} strokeWidth={liked ? 3 : 2} />
        </button>
        <span className="text-xs font-bold leading-none" style={{ color: liked ? 'var(--upvote)' : 'var(--foreground-muted)' }}>
          {likesCount}
        </span>
        <button onClick={() => {}}
          className="p-1 rounded transition-colors hover:bg-white/5"
          style={{ color: 'var(--foreground-subtle)' }}>
          <ChevronDown size={20} />
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
          <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-2 group min-w-0">
            <img src={post.author?.profilePicture || `https://ui-avatars.com/api/?name=${post.author?.name}&background=4FBCFF&color=fff`}
              alt={post.author?.name} className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
            <span className="text-xs font-semibold truncate group-hover:underline" style={{ color: 'var(--foreground-muted)' }}>
              {post.author?.username || 'user'}
            </span>
            {post.author?.isVerified && (
              <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 20 20" fill="var(--primary)">
                <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
            )}
            <span className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>· {timeAgo}</span>
          </Link>

          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowMenu(v => !v)} className="p-1 rounded hover:bg-white/5 transition-colors" style={{ color: 'var(--foreground-subtle)' }}>
              <MoreHorizontal size={16} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-8 w-44 card shadow-md z-20 overflow-hidden py-1"
                >
                  {isOwner && (
                    <>
                      <button onClick={() => { setIsEditing(true); setShowMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 text-left transition-colors" style={{ color: 'var(--foreground)' }}>
                        <Edit3 size={14} /> Edit
                      </button>
                      <button onClick={handleDelete}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 text-left transition-colors"
                        style={{ color: 'var(--secondary)' }}>
                        <Trash2 size={14} /> Delete
                      </button>
                      <div className="border-t mx-2 my-1" style={{ borderColor: 'var(--border)' }} />
                    </>
                  )}
                  <button onClick={handleReport}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 text-left transition-colors" style={{ color: 'var(--foreground)' }}>
                    <Flag size={14} /> Report
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="px-3 pb-1">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={3}
                className="w-full rounded border p-2 text-sm resize-none focus:outline-none" style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--muted)' }}
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setIsEditing(false)} className="btn btn-ghost px-3 py-1 text-xs">Cancel</button>
                <button onClick={handleEdit} className="btn btn-primary px-3 py-1 text-xs">Save</button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
          )}

          {post.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.hashtags.map((tag, i) => (
                <span key={i} className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {post.image && (
          <div className="mt-2 overflow-hidden cursor-pointer" onClick={() => setLightboxOpen(true)}>
            <img src={post.image} alt="Post content"
              className="w-full max-h-[400px] object-cover hover:opacity-95 transition-opacity" />
          </div>
        )}

        {post.video && (
          <div className="mt-2 overflow-hidden">
            <video src={post.video} controls className="w-full max-h-[400px]" />
          </div>
        )}

        <div className="flex items-center gap-1 px-1 py-1 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={toggleComments}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold hover:bg-white/5 transition-colors"
            style={{ color: showComments ? 'var(--primary)' : 'var(--foreground-muted)' }}>
            <MessageCircle size={14} fill={showComments ? 'currentColor' : 'none'} strokeWidth={showComments ? 0 : 2} />
            {comments.length}
          </button>

          <button onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold hover:bg-white/5 transition-colors"
            style={{ color: 'var(--foreground-muted)' }}>
            <Share2 size={14} />
            Share
          </button>

          <button onClick={handleBookmark}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold hover:bg-white/5 transition-colors"
            style={{ color: bookmarked ? 'var(--foreground)' : 'var(--foreground-muted)' }}>
            <Bookmark size={14} fill={bookmarked ? 'currentColor' : 'none'} strokeWidth={bookmarked ? 0 : 2} />
            Save
          </button>
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }} className="overflow-hidden border-t" style={{ borderColor: 'var(--border)' }}
            >
              <div className="px-3 py-3">
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto no-scrollbar">
                  {comments.length === 0 && (
                    <p className="text-xs text-center py-2" style={{ color: 'var(--foreground-subtle)' }}>No comments yet</p>
                  )}
                  {comments.map(comment => (
                    <div key={comment._id} className="flex gap-2">
                      <img src={comment.author?.profilePicture || `https://ui-avatars.com/api/?name=${comment.author?.name}&background=4FBCFF&color=fff`}
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0" alt="" />
                      <div className="flex-1 rounded px-2.5 py-1.5" style={{ background: 'var(--muted)' }}>
                        <span className="text-xs font-bold mr-1.5" style={{ color: 'var(--foreground-muted)' }}>{comment.author?.username}</span>
                        <span className="text-xs">{comment.text}</span>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--foreground-subtle)' }}>
                          {(() => { try { return formatDistanceToNow(new Date(comment.createdAt || Date.now()), { addSuffix: true }); } catch { return 'recently'; } })()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={submitComment} className="flex gap-2 mt-3">
                  <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name}&background=4FBCFF&color=fff`}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0" alt="" />
                  <div className="flex-1 flex items-center gap-2 rounded border px-3"
                    style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
                  >
                    <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)}
                      placeholder="Add a comment" className="flex-1 bg-transparent border-none outline-none text-xs py-1.5" />
                    <button type="submit" disabled={!commentText.trim() || submittingComment}
                      style={{ color: commentText.trim() ? 'var(--primary)' : 'var(--foreground-subtle)' }}>
                      <Send size={12} />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {lightboxOpen && post.image && (
        <ImageLightbox src={post.image} alt="Post image" onClose={() => setLightboxOpen(false)} />
      )}
    </motion.article>
  );
};

export default PostCard;
