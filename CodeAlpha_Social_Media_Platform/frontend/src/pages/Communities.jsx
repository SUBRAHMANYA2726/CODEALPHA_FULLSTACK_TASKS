import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Loader2, Users, Plus, Hash, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateCommunityModal = ({ onClose }) => {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const mutation = useMutation({
    mutationFn: (data) => api.post('/communities', data),
    onSuccess: () => { qc.invalidateQueries(['communities']); onClose(); },
    onError: () => alert('❌ Failed to create community.')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && description.trim()) { mutation.mutate({ name, description }); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="rounded-3xl w-full max-w-md shadow-2xl overflow-hidden card"
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-bold text-lg">Create Community</h2>
          <button onClick={onClose} className="btn btn-ghost p-2 rounded-xl"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Community Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. React Developers"
              className="input" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="What is this community about?" className="input resize-none" rows={4} required />
          </div>
          <button type="submit" disabled={mutation.isPending}
            className="btn btn-primary mt-2 flex justify-center gap-2">
            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Create Community
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const Communities = () => {
  const [showModal, setShowModal] = useState(false);

  const { data: communities, isLoading } = useQuery({
    queryKey: ['communities'],
    queryFn: () => api.get('/communities').then(res => res.data)
  });

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full flex flex-col gap-8 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl gradient-violet flex items-center justify-center">
              <Users size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold">Communities</h1>
          </div>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--foreground-muted)' }}>Discover and join groups based on your interests.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2 px-5 py-2.5">
          <Plus size={18} /> Create
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          [1,2,3,4].map(i => <div key={i} className="h-40 rounded-2xl skeleton"></div>)
        ) : communities?.length > 0 ? (
          communities.map((community) => (
            <motion.div key={community._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="card p-6 flex flex-col justify-between group hover:shadow-lg transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 rounded-2xl gradient-violet flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Hash size={24} />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-md bg-muted" style={{ color: 'var(--foreground-muted)' }}>
                    {community.members?.length || 0} members
                  </span>
                </div>
                <h3 className="font-bold text-lg transition-colors">{community.name}</h3>
                <p className="text-sm line-clamp-2 mt-1" style={{ color: 'var(--foreground-muted)' }}>{community.description}</p>
              </div>
              <button className="mt-4 w-full py-2.5 rounded-xl font-semibold transition-all btn-secondary">
                Join Community
              </button>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full card p-10 text-center">
            <div className="inline-flex justify-center items-center w-14 h-14 rounded-2xl bg-muted mb-3">
              <Users size={24} style={{ color: 'var(--foreground-muted)' }} />
            </div>
            <p className="font-semibold" style={{ color: 'var(--foreground-muted)' }}>No communities found. Be the first to create one!</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && <CreateCommunityModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Communities;
