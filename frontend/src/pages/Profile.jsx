import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import PostCard from '../components/PostCard';
import { Loader2, Settings, Camera, X, Calendar, Image as ImageIcon } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl w-full max-w-md overflow-hidden shadow-2xl card"
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-bold text-lg">Edit Profile</h2>
          <button onClick={onClose} className="btn btn-ghost p-2 rounded-xl"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-center mb-6 relative w-24 h-24 mx-auto">
            <img src={avatarPreview || `https://ui-avatars.com/api/?name=${profile.name}&background=2563EB&color=fff`}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" alt="" />
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 rounded-full text-white shadow-md gradient-primary">
              <Camera size={16} />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile} />
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Bio</label>
              <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="input resize-none" rows={3} />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-4 flex justify-center items-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />} Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
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
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary)' }} />
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Loading profile...</p>
      </div>
    </div>
  );

  if (isError || !data) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center">
        <p className="text-4xl mb-2">🔍</p>
        <p className="font-bold text-xl" style={{ color: 'var(--danger)' }}>User not found</p>
        <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>The user you're looking for doesn't exist.</p>
      </div>
    </div>
  );

  const profileUser = data.user;
  const posts = data.posts;
  const isOwnProfile = currentUser?._id === profileUser._id;
  const isFollowing = profileUser.followers?.includes(currentUser?._id);
  const memberSince = profileUser.createdAt ? format(new Date(profileUser.createdAt), 'MMMM yyyy') : 'Recently';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col pb-20 w-full overflow-hidden">
      <div className="relative h-[280px] md:h-[320px] w-full overflow-hidden">
        <img src={profileUser.coverPhoto || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2000'}
          alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      <div className="px-6 max-w-4xl mx-auto w-full relative -mt-24 z-10">
        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">
          <div className="flex-shrink-0">
            <div className="relative inline-block">
              <div className="rounded-full p-1.5 bg-white/90 backdrop-blur-sm shadow-lg">
                <img src={profileUser.profilePicture || `https://ui-avatars.com/api/?name=${profileUser.name}&size=200&background=2563EB&color=fff`}
                  alt={profileUser.name} className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full gradient-primary flex items-center justify-center border-2 border-white">
                <div className="online-dot" style={{ width: 8, height: 8 }} />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-4 md:pt-0">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2">
                  {profileUser.name}
                  {profileUser.isVerified && (
                    <div className="verified-badge w-6 h-6">
                      <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </h1>
                <p className="font-medium text-sm mb-2" style={{ color: 'var(--foreground-muted)' }}>@{profileUser.username}</p>
                <p className="max-w-2xl leading-relaxed text-sm mb-3">{profileUser.bio || 'No bio available.'}</p>

                <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--foreground-muted)' }}>
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
                    className="btn btn-outline px-5 py-2.5 text-sm">
                    <Settings size={16} /> Edit Profile
                  </button>
                ) : (
                  <button onClick={() => followMutation.mutate()} disabled={followMutation.isPending}
                    className={`px-8 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
                  >
                    {followMutation.isPending ? <Loader2 size={16} className="animate-spin inline" /> : (isFollowing ? 'Following' : 'Follow')}
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-8 mt-5 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
              {[
                { label: 'Posts', value: posts?.length || 0 },
                { label: 'Followers', value: profileUser.followers?.length || 0 },
                { label: 'Following', value: profileUser.following?.length || 0 },
              ].map(stat => (
                <div key={stat.label} className="text-center md:text-left">
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-black text-xl md:text-2xl gradient-text-primary"
                  >
                    {stat.value}
                  </motion.span>
                  <p className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex gap-8 mb-6 border-b" style={{ borderColor: 'var(--border)' }}>
            {['posts', 'media', 'likes'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`font-semibold pb-3 relative capitalize text-sm transition-colors ${activeTab === tab ? '' : 'hover:text-gray-900'}`}
                style={{ color: activeTab === tab ? 'var(--primary)' : 'var(--foreground-muted)' }}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full gradient-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            {posts?.length > 0 ? (
              posts.map((post) => <PostCard key={post._id} post={post} />)
            ) : (
              <div className="card p-10 text-center">
                <div className="inline-flex justify-center items-center w-14 h-14 rounded-2xl bg-muted mb-3">
                  <ImageIcon size={24} style={{ color: 'var(--foreground-muted)' }} />
                </div>
                <p className="font-semibold" style={{ color: 'var(--foreground-muted)' }}>No {activeTab} to show.</p>
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
