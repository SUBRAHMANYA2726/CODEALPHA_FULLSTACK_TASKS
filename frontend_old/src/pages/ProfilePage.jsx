import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { motion } from 'framer-motion';
import { setCredentials } from '../slices/authSlice';
import Loader from '../components/Loader';
import { FaUser, FaBoxOpen, FaCheck, FaTimes, FaEdit } from 'react-icons/fa';

const ProfilePage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo) { navigate('/login'); return; }
    setName(userInfo.name);
    setEmail(userInfo.email);
    fetchMyOrders();
  }, [userInfo, navigate]);

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get('/api/orders/myorders', {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setOrders(data);
    } catch {
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) return toast.error('Passwords do not match');
    try {
      const { data } = await axios.put('/api/users/profile', { name, email, password }, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      dispatch(setCredentials(data));
      toast.success('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-5 mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white">
              {userInfo?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{userInfo?.name}</h1>
              <p className="text-slate-400">{userInfo?.email}</p>
              {userInfo?.isAdmin && <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">Admin</span>}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-white/10 pb-1">
            {[['orders', FaBoxOpen, 'Order History'], ['profile', FaEdit, 'Edit Profile']].map(([tab, Icon, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all ${activeTab === tab ? 'text-blue-400 border-b-2 border-blue-500 -mb-px' : 'text-slate-400 hover:text-white'}`}
              >
                <Icon className="text-xs" /> {label}
              </button>
            ))}
          </div>

          {/* Order History */}
          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {isLoadingOrders ? (
                <Loader text="Loading orders..." />
              ) : orders.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
                  <p className="text-slate-400 mb-6">Start shopping to see your orders here</p>
                  <Link to="/" className="btn-primary-premium inline-flex items-center gap-2 relative z-10">Shop Now</Link>
                </div>
              ) : (
                <div className="glass rounded-2xl overflow-hidden border border-white/10">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/10">
                          {['Order ID', 'Date', 'Total', 'Paid', 'Delivered', ''].map((h) => (
                            <th key={h} className="px-5 py-4 text-xs text-slate-400 font-semibold uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                            <td className="px-5 py-4 font-mono text-xs text-blue-400">#{order._id.slice(-8).toUpperCase()}</td>
                            <td className="px-5 py-4 text-sm text-slate-300">{order.createdAt?.substring(0, 10)}</td>
                            <td className="px-5 py-4 text-sm font-bold text-white">${parseFloat(order.totalPrice).toFixed(2)}</td>
                            <td className="px-5 py-4">
                              {order.isPaid ? (
                                <span className="flex items-center gap-1 text-green-400 text-xs font-semibold"><FaCheck /> {order.paidAt?.substring(0, 10)}</span>
                              ) : (
                                <span className="flex items-center gap-1 text-red-400 text-xs"><FaTimes /> Pending</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              {order.isDelivered ? (
                                <span className="text-green-400 text-xs font-semibold">✓ Delivered</span>
                              ) : (
                                <span className="text-orange-400 text-xs">Processing</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <Link to={`/order/${order._id}`} className="text-xs text-blue-400 hover:text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition-all">
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Edit Profile */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg">
              <div className="glass rounded-2xl p-8 border border-white/10">
                <h2 className="text-xl font-bold text-white mb-6">Update Profile</h2>
                <form onSubmit={submitHandler} className="space-y-5">
                  <div>
                    <label className="text-sm text-slate-400 mb-1.5 block">Full Name</label>
                    <input type="text" className="input-premium" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1.5 block">Email Address</label>
                    <input type="email" className="input-premium" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1.5 block">New Password <span className="text-slate-600">(leave blank to keep current)</span></label>
                    <input type="password" className="input-premium" placeholder="New password..." value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1.5 block">Confirm New Password</label>
                    <input type="password" className="input-premium" placeholder="Confirm password..." value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                  <button type="submit" className="btn-primary-premium w-full py-3.5 relative z-10">Save Changes</button>
                </form>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
