import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Loader2, ArrowLeft, MessageCircle } from 'lucide-react';
import PostCard from '../components/PostCard';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const res = await api.get(`/posts/${id}`);
      return res.data;
    }
  });

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 pb-24">
      <div className="card p-4 mb-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)}
          className="btn btn-ghost p-2 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Post</h1>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
          </div>
        ) : isError || !post ? (
          <div className="text-center p-10" style={{ color: 'var(--foreground-muted)' }}>
            <div className="inline-flex justify-center items-center w-14 h-14 rounded-2xl bg-muted mb-3">
              <MessageCircle size={24} style={{ color: 'var(--foreground-muted)' }} />
            </div>
            <p className="font-semibold">Post not found or has been deleted.</p>
          </div>
        ) : (
          <PostCard post={post} />
        )}
      </div>
    </div>
  );
};

export default PostDetail;
