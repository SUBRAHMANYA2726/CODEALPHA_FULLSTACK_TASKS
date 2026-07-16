import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import PostCard from '../components/PostCard';
import { Loader2, Settings, Camera, X, Calendar, Image as ImageIcon, MapPin, LinkIcon, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const EditProfileModal = ({ profile, onClose }) => {
  const qc = useQueryClient();
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({ name: profile.name, bio: profile.bio || '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile.profilePicture);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (avatarFile) {
        const fd = new FormData();
        fd.append('image', avatarFile);
        const imgRes = await api.post('/upload/profile-picture', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        formData.profilePicture = imgRes.data.imageUrl;
      }
      const res = await api.put('/users/profile/update', formData);
      updateUser(res.data);
      qc.invalidateQueries(['user', profile.username]);
      onClose();
    } catch {
      alert('Failed to update profile');
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 dark:bg-black/60">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="rounded-2xl w-full max-w-md overflow-hidden shadow-2xl glass-panel border border-black/5 dark:border-white/10"
      >
        <div className="flex items-center justify-between p-5 border-b border-black/5 dark:border-white/5">
          <h2 className="font-black text-lg" style={{ color: 'var(--foreground)' }}>Edit Profile</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-center mb-6 relative w-28 h-28 mx-auto">
            <img src={avatarPreview || `https://ui-avatars.com/api/?name=${profile.name}&background=5c3ce6&color=fff`}
              className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg" alt="" />
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 p-2.5 rounded-full text-white shadow-lg gradient-primary hover:scale-110 transition-transform">
              <Camera size={16} />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile} />
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--foreground)' }}>Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 ring-[var(--primary-light)] transition-all bg-black/5 dark:bg-white/5 border-transparent"
                style={{ color: 'var(--foreground)' }} required />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--foreground)' }}>Bio</label>
              <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border text-sm font-medium resize-none focus:outline-none focus:ring-2 ring-[var(--primary-light)] transition-all bg-black/5 dark:bg-white/5 border-transparent"
                style={{ color: 'var(--foreground)' }} rows={3} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full gradient-primary text-white font-bold py-3 rounded-xl shadow-colored hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 size={18} className="animate-spin" />} Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditing, setIsEditing] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['user', username],
    queryFn: () => api.get(`/users/profile/${username}`).then(res => res.data),
  });

  const followMutation = useMutation({
    mutationFn: () => api.post(`/users/${data?.user?._id}/follow`),
    onSuccess: () => qc.invalidateQueries(['user', username])
  });

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary)' }} />
        <p className="text-sm font-bold" style={{ color: 'var(--foreground-muted)' }}>Loading profile...</p>
      </div>
    </div>
  );

  if (isError || !data) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center">
        <p className="text-5xl mb-4">🔍</p>
        <p className="font-black text-2xl" style={{ color: 'var(--foreground)' }}>User not found</p>
        <p className="text-sm font-medium mt-2" style={{ color: 'var(--foreground-muted)' }}>The user you're looking for doesn't exist.</p>
      </div>
    </div>
  );

  const profileUser = data.user;
  const posts = data.posts;
  const isOwnProfile = currentUser?._id === profileUser._id;
  const isFollowing = profileUser.followers?.includes(currentUser?._id);
  const memberSince = profileUser.createdAt ? format(new Date(profileUser.createdAt), 'MMMM yyyy') : 'Recently';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col pb-24 lg:pb-6 w-full overflow-hidden">
      {/* Cover Photo */}
      <div className="relative h-[220px] md:h-[300px] w-full overflow-hidden">
        <img src={profileUser.coverPhoto || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2000'}
          alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 40%, transparent 100%)' }} />
      </div>

      {/* Profile Info */}
      <div className="px-6 max-w-4xl mx-auto w-full relative -mt-20 z-10">
        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring' }}
              className="relative inline-block">
              <div className="rounded-full p-1 bg-white dark:bg-[#1a1b1e] shadow-2xl">
                <img src={profileUser.profilePicture || `https://ui-avatars.com/api/?name=${profileUser.name}&size=200&background=5c3ce6&color=fff`}
                  alt={profileUser.name} className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover" />
              </div>
              <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-green-500 border-[3px] border-white dark:border-[#1a1b1e]" />
            </motion.div>
          </div>

          {/* Info & Actions */}
          <div className="flex-1 min-w-0 pt-2 md:pt-0">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                  {profileUser.name}
                  {profileUser.isVerified && (
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs shadow-sm">✓</span>
                  )}
                </h1>
                <p className="font-bold text-sm mt-0.5" style={{ color: 'var(--foreground-muted)' }}>@{profileUser.username}</p>
                
                {profileUser.bio && (
                  <p className="max-w-xl leading-relaxed text-[15px] font-medium mt-3" style={{ color: 'var(--foreground)' }}>
                    {profileUser.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 mt-3 text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>
                  {memberSince && (
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} /> Joined {memberSince}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 flex-shrink-0">
                {isOwnProfile ? (
                  <button onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm border-2 border-gray-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all hover:scale-105 active:scale-95">
                    <Settings size={16} /> Edit Profile
                  </button>
                ) : (
                  <>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => followMutation.mutate()} disabled={followMutation.isPending}
                      className={`px-8 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${
                        isFollowing 
                          ? 'border-2 border-gray-200 dark:border-white/10 hover:border-red-300 hover:text-red-500' 
                          : 'gradient-primary text-white shadow-colored'
                      }`}
                    >
                      {followMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : (isFollowing ? 'Following' : 'Follow')}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => window.dispatchEvent(new CustomEvent('open-chat', { detail: profileUser }))}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm border-2 border-gray-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                    >
                      <MessageCircle size={16} /> Message
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-6 pt-6 border-t border-black/5 dark:border-white/5">
              {[
                { label: 'Posts', value: posts?.length || 0 },
                { label: 'Followers', value: profileUser.followers?.length || 0 },
                { label: 'Following', value: profileUser.following?.length || 0 },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                  className="text-center md:text-left cursor-pointer group">
                  <span className="font-black text-2xl md:text-3xl group-hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--foreground)' }}>
                    {stat.value}
                  </span>
                  <p className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: 'var(--foreground-muted)' }}>{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-black/5 dark:border-white/5 pt-4 mt-2">
          <div className="flex gap-8 mb-6 border-b border-black/5 dark:border-white/5">
            {['posts', 'media', 'likes'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`font-bold pb-3 relative capitalize text-sm transition-colors ${activeTab === tab ? '' : 'hover:text-gray-600 dark:hover:text-gray-300'}`}
                style={{ color: activeTab === tab ? 'var(--primary)' : 'var(--foreground-muted)' }}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full gradient-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-0 max-w-2xl mx-auto">
            {posts?.length > 0 ? (
              posts.map((post) => <PostCard key={post._id} post={post} />)
            ) : (
              <div className="card p-12 text-center shadow-sm">
                <div className="inline-flex justify-center items-center w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/5 mb-4">
                  <ImageIcon size={28} style={{ color: 'var(--foreground-muted)' }} />
                </div>
                <p className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>No {activeTab} yet</p>
                <p className="text-sm font-medium mt-1" style={{ color: 'var(--foreground-muted)' }}>
                  {isOwnProfile ? `Share something to see it here.` : `${profileUser.name} hasn't posted yet.`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isEditing && <EditProfileModal profile={profileUser} onClose={() => setIsEditing(false)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
