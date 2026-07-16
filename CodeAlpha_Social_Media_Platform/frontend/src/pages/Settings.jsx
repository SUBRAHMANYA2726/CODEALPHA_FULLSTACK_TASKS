import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Loader2, Moon, Bell, Shield, LogOut, Trash2, User, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(user?.settings?.theme || 'light');
  const [notifications, setNotifications] = useState(user?.settings?.notifications ?? true);
  const [privacy, setPrivacy] = useState(user?.settings?.privacy || 'public');

  const updateMutation = useMutation({
    mutationFn: (settings) => api.put('/users/settings/update', settings),
    onSuccess: (res) => {
      updateUser(res.data);
      qc.invalidateQueries(['user']);
      alert('✅ Settings saved successfully!');
    },
    onError: () => alert('❌ Failed to save settings.')
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete('/users/account/delete'),
    onSuccess: () => { logout(); navigate('/login'); },
    onError: () => alert('❌ Failed to delete account.')
  });

  const handleSave = () => updateMutation.mutate({ theme, notifications, privacy });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6 pb-24">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center">
          <User size={18} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="card p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Moon size={20} style={{ color: 'var(--primary)' }} /> Appearance
          </h2>
          <div className="flex gap-3">
            {['light', 'dark', 'system'].map(t => (
              <button key={t} onClick={() => setTheme(t)}
                className={`flex-1 py-3 px-4 rounded-2xl text-sm font-semibold capitalize transition-all border-2 ${theme === t ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-muted'}`}
              >
                {t === 'light' ? '☀️ ' : t === 'dark' ? '🌙 ' : '💻 '}
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="divider" />

        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Bell size={20} style={{ color: 'var(--primary)' }} /> Notifications
          </h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'gradient-primary' : 'bg-muted'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm font-medium">Receive push and email notifications</span>
          </label>
        </div>

        <div className="divider" />

        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Shield size={20} style={{ color: 'var(--primary)' }} /> Privacy
          </h2>
          <select value={privacy} onChange={(e) => setPrivacy(e.target.value)}
            className="input w-full md:w-1/2 cursor-pointer">
            <option value="public">Public - Anyone can see your posts</option>
            <option value="private">Private - Only followers can see your posts</option>
          </select>
        </div>

        <button onClick={handleSave} disabled={updateMutation.isPending}
          className="btn btn-primary self-start mt-4 flex items-center gap-2">
          {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          Save Changes
        </button>
      </div>

      <div className="card p-6" style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.03)' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--danger)' }}>Danger Zone</h2>

        <div className="flex flex-col gap-4">
          <button onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center justify-between p-4 rounded-2xl transition-colors text-left"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div>
              <p className="font-bold" style={{ color: 'var(--foreground)' }}>Log Out</p>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>End your current session.</p>
            </div>
            <LogOut size={20} style={{ color: 'var(--foreground-muted)' }} />
          </button>

          <button onClick={handleDelete} disabled={deleteMutation.isPending}
            className="flex items-center justify-between p-4 rounded-2xl transition-colors text-left"
            style={{ background: 'var(--card)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <div>
              <p className="font-bold" style={{ color: 'var(--danger)' }}>Delete Account</p>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Permanently delete your account and all data.</p>
            </div>
            {deleteMutation.isPending ? <Loader2 size={20} className="animate-spin" style={{ color: 'var(--danger)' }} /> : <Trash2 size={20} style={{ color: 'var(--danger)' }} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
