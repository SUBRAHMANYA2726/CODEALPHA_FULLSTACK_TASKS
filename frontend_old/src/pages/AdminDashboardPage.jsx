import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FaBoxOpen, FaUsers, FaClipboardList, FaDollarSign,
  FaTrash, FaEdit, FaCheck, FaTimes, FaPlus, FaSearch, FaEye
} from 'react-icons/fa';
import Loader from '../components/Loader';

const TABS = ['Dashboard', 'Products', 'Orders', 'Users'];

const AdminDashboardPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const authHeaders = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

  useEffect(() => {
    if (!userInfo?.isAdmin) { navigate('/login'); return; }
    fetchAll();
  }, [userInfo]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [pRes, oRes, uRes] = await Promise.all([
        axios.get('/api/products?limit=200', authHeaders),
        axios.get('/api/orders', authHeaders),
        axios.get('/api/users', authHeaders),
      ]);
      setProducts(pRes.data.products || pRes.data);
      setOrders(oRes.data);
      setUsers(uRes.data);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`/api/products/${id}`, authHeaders);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Delete failed'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`/api/users/${id}`, authHeaders);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Delete failed'); }
  };

  const deliverOrder = async (id) => {
    try {
      await axios.put(`/api/orders/${id}/deliver`, {}, authHeaders);
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, isDelivered: true, deliveredAt: new Date() } : o));
      toast.success('Order marked as delivered');
    } catch { toast.error('Update failed'); }
  };

  const totalRevenue = orders.reduce((a, o) => a + parseFloat(o.totalPrice || 0), 0);
  const filteredProducts = products.filter((p) => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  const StatCard = ({ icon: Icon, label, value, color, sub }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl p-6 border border-white/10 hover:border-${color}-500/30 transition-all`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-1">{label}</p>
          <p className="text-3xl font-black text-white">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-${color}-500/20 flex items-center justify-center`}>
          <Icon className={`text-${color}-400 text-xl`} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="mb-8">
          <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-1">Admin Panel</p>
          <h1 className="text-3xl font-black text-white">Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 pb-1 border-b border-white/10">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'glass text-slate-400 hover:text-white border border-white/10'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? <Loader text="Loading admin data..." /> : (
          <>
            {/* DASHBOARD TAB */}
            {activeTab === 'Dashboard' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <StatCard icon={FaDollarSign} label="Total Revenue" value={`$${totalRevenue.toFixed(0)}`} color="green" sub={`${orders.length} orders`} />
                  <StatCard icon={FaBoxOpen} label="Products" value={products.length} color="blue" sub="In catalog" />
                  <StatCard icon={FaClipboardList} label="Orders" value={orders.length} color="purple" sub={`${orders.filter(o=>!o.isDelivered).length} pending`} />
                  <StatCard icon={FaUsers} label="Users" value={users.length} color="orange" sub={`${users.filter(u=>u.isAdmin).length} admins`} />
                </div>

                {/* Recent Orders */}
                <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/10">
                    <h3 className="font-bold text-white">Recent Orders</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5">
                          {['Order ID', 'Customer', 'Date', 'Total', 'Paid', 'Delivered', ''].map((h) => (
                            <th key={h} className="px-5 py-3 text-xs text-slate-400 font-semibold uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 8).map((order) => (
                          <tr key={order._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                            <td className="px-5 py-3 font-mono text-xs text-blue-400">#{order._id.slice(-8).toUpperCase()}</td>
                            <td className="px-5 py-3 text-sm text-slate-300">{order.user?.name || 'Guest'}</td>
                            <td className="px-5 py-3 text-xs text-slate-400">{order.createdAt?.substring(0, 10)}</td>
                            <td className="px-5 py-3 text-sm font-bold text-white">${parseFloat(order.totalPrice).toFixed(2)}</td>
                            <td className="px-5 py-3">{order.isPaid ? <span className="text-green-400 text-xs font-semibold">✓ Paid</span> : <span className="text-red-400 text-xs">Pending</span>}</td>
                            <td className="px-5 py-3">{order.isDelivered ? <span className="text-green-400 text-xs">✓ Done</span> : <span className="text-orange-400 text-xs">Processing</span>}</td>
                            <td className="px-5 py-3">
                              <Link to={`/order/${order._id}`} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                <FaEye />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'Products' && (
              <div>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="input-premium pr-10 text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                  </div>
                  <p className="text-sm text-slate-400 self-center">{filteredProducts.length} products</p>
                </div>
                <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/10">
                          {['Product', 'Category', 'Brand', 'Price', 'Stock', 'Rating', ''].map((h) => (
                            <th key={h} className="px-5 py-4 text-xs text-slate-400 font-semibold uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => (
                          <tr key={product._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={product.thumbnail || product.image}
                                  alt={product.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                  onError={(e) => { e.target.src = 'https://placehold.co/40x40/1A2235/60A5FA?text=P'; }}
                                />
                                <span className="text-sm text-white font-medium line-clamp-1 max-w-[180px]">{product.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-xs text-slate-400 capitalize">{product.category}</td>
                            <td className="px-5 py-3 text-xs text-slate-400">{product.brand}</td>
                            <td className="px-5 py-3 text-sm font-bold text-white">${product.price?.toFixed(2)}</td>
                            <td className="px-5 py-3">
                              <span className={`text-xs font-semibold ${product.countInStock > 5 ? 'text-green-400' : product.countInStock > 0 ? 'text-orange-400' : 'text-red-400'}`}>
                                {product.countInStock}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-xs text-yellow-400">{product.rating}★</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <Link to={`/product/${product._id}`} className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500/40 transition-all">
                                  <FaEye className="text-xs" />
                                </Link>
                                <button onClick={() => deleteProduct(product._id)} className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/40 transition-all">
                                  <FaTrash className="text-xs" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'Orders' && (
              <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        {['Order ID', 'Customer', 'Date', 'Total', 'Paid', 'Delivered', 'Actions'].map((h) => (
                          <th key={h} className="px-5 py-4 text-xs text-slate-400 font-semibold uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                          <td className="px-5 py-3 font-mono text-xs text-blue-400">#{order._id.slice(-8).toUpperCase()}</td>
                          <td className="px-5 py-3 text-sm text-slate-300">{order.user?.name || 'Guest'}</td>
                          <td className="px-5 py-3 text-xs text-slate-400">{order.createdAt?.substring(0, 10)}</td>
                          <td className="px-5 py-3 text-sm font-bold text-white">${parseFloat(order.totalPrice).toFixed(2)}</td>
                          <td className="px-5 py-3">
                            {order.isPaid ? <span className="text-green-400 text-xs font-semibold flex items-center gap-1"><FaCheck /> {order.paidAt?.substring(0,10)}</span> : <span className="text-red-400 text-xs flex items-center gap-1"><FaTimes /> No</span>}
                          </td>
                          <td className="px-5 py-3">
                            {order.isDelivered ? <span className="text-green-400 text-xs">✓ Done</span> : <span className="text-orange-400 text-xs">Pending</span>}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <Link to={`/order/${order._id}`} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                <FaEye />
                              </Link>
                              {!order.isDelivered && (
                                <button onClick={() => deliverOrder(order._id)} className="text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 px-2 py-1 rounded-lg transition-all">
                                  Mark Delivered
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'Users' && (
              <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        {['User', 'Email', 'Role', 'Joined', ''].map((h) => (
                          <th key={h} className="px-5 py-4 text-xs text-slate-400 font-semibold uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-white">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-sm text-slate-400">{user.email}</td>
                          <td className="px-5 py-3">
                            {user.isAdmin
                              ? <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">Admin</span>
                              : <span className="text-xs text-slate-400">Customer</span>
                            }
                          </td>
                          <td className="px-5 py-3 text-xs text-slate-400">{user.createdAt?.substring(0, 10)}</td>
                          <td className="px-5 py-3">
                            {!user.isAdmin && (
                              <button onClick={() => deleteUser(user._id)} className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/40 transition-all">
                                <FaTrash className="text-xs" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
