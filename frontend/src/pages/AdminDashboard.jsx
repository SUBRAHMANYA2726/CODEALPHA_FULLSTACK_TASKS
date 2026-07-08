import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Users, FileText, Activity, AlertTriangle, ShieldCheck, Loader2, Trash2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => api.get('/admin/stats').then(res => res.data)
  });

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => api.get('/admin/users').then(res => res.data.users)
  });

  const { data: reports, isLoading: loadingReports } = useQuery({
    queryKey: ['adminReports'],
    queryFn: () => api.get('/admin/reports').then(res => res.data)
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => qc.invalidateQueries(['adminUsers'])
  });

  const resolveReportMutation = useMutation({
    mutationFn: (id) => api.put(`/admin/reports/${id}`, { status: 'Resolved' }),
    onSuccess: () => qc.invalidateQueries(['adminReports'])
  });

  return (
    <div className="flex-1 p-6 md:p-10 w-full max-w-6xl mx-auto flex flex-col gap-8 pb-24">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl gradient-violet flex items-center justify-center">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <h1 className="text-3xl font-black">Admin Dashboard</h1>
        </div>
        <p className="font-medium" style={{ color: 'var(--foreground-muted)' }}>Manage users, moderate content, and view platform analytics.</p>
      </div>

      <div className="flex gap-4 border-b" style={{ borderColor: 'var(--border)' }}>
        {['overview', 'users', 'reports'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-3 font-semibold capitalize transition-colors relative ${activeTab === tab ? '' : 'hover:text-gray-900'}`}
            style={{ color: activeTab === tab ? 'var(--primary)' : 'var(--foreground-muted)' }}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full gradient-primary" />}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingStats ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-3xl skeleton" />)
          ) : (
            [
              { label: 'Total Users', value: stats?.totalUsers || 0, icon: <Users size={24} className="text-blue-500" />, gradient: 'from-blue-500 to-blue-600' },
              { label: 'Total Posts', value: stats?.totalPosts || 0, icon: <FileText size={24} className="text-teal-500" />, gradient: 'from-teal-500 to-cyan-600' },
              { label: 'Pending Reports', value: stats?.pendingReports || 0, icon: <AlertTriangle size={24} className="text-orange-500" />, gradient: 'from-orange-500 to-red-500' },
              { label: 'Notifications', value: stats?.totalNotifications || 0, icon: <Activity size={24} className="text-purple-500" />, gradient: 'from-purple-500 to-pink-500' }
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card p-6 flex flex-col gap-4"
              >
                <div className="p-3 rounded-xl self-start" style={{ background: 'var(--muted)' }}>{stat.icon}</div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground-muted)' }}>{stat.label}</p>
                  <p className="text-3xl font-black">{stat.value}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-6">Manage Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="pb-3 font-semibold" style={{ color: 'var(--foreground-muted)' }}>User</th>
                  <th className="pb-3 font-semibold" style={{ color: 'var(--foreground-muted)' }}>Email</th>
                  <th className="pb-3 font-semibold" style={{ color: 'var(--foreground-muted)' }}>Joined</th>
                  <th className="pb-3 font-semibold text-right" style={{ color: 'var(--foreground-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr><td colSpan="4" className="py-4 text-center"><Loader2 className="animate-spin inline" style={{ color: 'var(--primary)' }} /></td></tr>
                ) : users?.map(u => (
                  <tr key={u._id} className="border-b hover:bg-muted transition-colors" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-4 flex items-center gap-3">
                      <img src={u.profilePicture || `https://ui-avatars.com/api/?name=${u.name}&background=2563EB&color=fff`}
                        className="w-8 h-8 rounded-full" alt="avatar" />
                      <span className="font-medium">{u.name}</span>
                    </td>
                    <td className="py-4 text-sm" style={{ color: 'var(--foreground-muted)' }}>{u.email}</td>
                    <td className="py-4 text-sm" style={{ color: 'var(--foreground-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 text-right">
                      <button onClick={() => { if (confirm('Delete user?')) deleteUserMutation.mutate(u._id); }}
                        className="p-2 rounded-lg transition-colors" style={{ color: 'var(--danger)' }}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-6">Reports</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="pb-3 font-semibold" style={{ color: 'var(--foreground-muted)' }}>Reporter</th>
                  <th className="pb-3 font-semibold" style={{ color: 'var(--foreground-muted)' }}>Type</th>
                  <th className="pb-3 font-semibold" style={{ color: 'var(--foreground-muted)' }}>Reason</th>
                  <th className="pb-3 font-semibold" style={{ color: 'var(--foreground-muted)' }}>Status</th>
                  <th className="pb-3 font-semibold text-right" style={{ color: 'var(--foreground-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingReports ? (
                  <tr><td colSpan="5" className="py-4 text-center"><Loader2 className="animate-spin inline" style={{ color: 'var(--primary)' }} /></td></tr>
                ) : reports?.length > 0 ? reports.map(r => (
                  <tr key={r._id} className="border-b hover:bg-muted transition-colors" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-4 font-medium text-sm">{r.reporter?.name || 'Unknown'}</td>
                    <td className="py-4 text-sm" style={{ color: 'var(--foreground-muted)' }}>{r.targetType}</td>
                    <td className="py-4 text-sm" style={{ color: 'var(--foreground-muted)' }}>{r.reason}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${r.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}
                        style={{ background: r.status === 'Resolved' ? 'var(--success-light)' : 'var(--warning-light)', color: r.status === 'Resolved' ? 'var(--success)' : 'var(--warning)' }}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {r.status !== 'Resolved' && (
                        <button onClick={() => resolveReportMutation.mutate(r._id)}
                          className="p-2 rounded-lg transition-colors" style={{ color: 'var(--success)' }} title="Mark Resolved">
                          <CheckCircle size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="py-4 text-center" style={{ color: 'var(--foreground-muted)' }}>No reports found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
