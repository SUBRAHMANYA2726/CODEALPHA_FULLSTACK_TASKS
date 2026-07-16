import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ShieldCheck, Package } from 'lucide-react';
import Loader from '../components/Loader';
import { motion } from 'framer-motion';

const AdminDashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await axios.get('/api/orders', config);
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (userInfo && userInfo.isAdmin) {
      fetchOrders();
    } else {
      setError('Not authorized as an admin');
      setIsLoading(false);
    }
  }, [userInfo]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <ShieldCheck className="w-8 h-8 text-amber-400" />
        </div>
        <div>
          <h1 className="text-4xl font-display font-black text-slate-100 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 font-medium mt-1">Manage orders, products, and users.</p>
        </div>
      </div>

      <div className="bg-[#0a0a0a] rounded-[2rem] p-8 border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
        <h2 className="text-2xl font-bold text-slate-100 mb-8">Recent Orders</h2>
        
        {isLoading ? (
          <Loader />
        ) : error ? (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 font-medium">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-sm">
                  <th className="pb-4 font-semibold">ID</th>
                  <th className="pb-4 font-semibold">USER</th>
                  <th className="pb-4 font-semibold">DATE</th>
                  <th className="pb-4 font-semibold">TOTAL</th>
                  <th className="pb-4 font-semibold">PAID</th>
                  <th className="pb-4 font-semibold">DELIVERED</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={order._id} 
                    className="border-b border-white/5 hover:bg-[#171717] transition-colors group"
                  >
                    <td className="py-4 text-slate-500 font-mono text-sm">{order._id.substring(0, 10)}...</td>
                    <td className="py-4 text-slate-200 font-medium">{order.user && order.user.name}</td>
                    <td className="py-4 text-slate-400">{order.createdAt.substring(0, 10)}</td>
                    <td className="py-4 font-bold text-indigo-400">${order.totalPrice.toFixed(2)}</td>
                    <td className="py-4">
                      {order.isPaid ? (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">{order.paidAt.substring(0, 10)}</span>
                      ) : (
                        <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-bold">Not Paid</span>
                      )}
                    </td>
                    <td className="py-4">
                      {order.isDelivered ? (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">{order.deliveredAt.substring(0, 10)}</span>
                      ) : (
                        <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-bold">Pending</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
               <div className="flex flex-col items-center justify-center py-20 text-center bg-[#050505] rounded-2xl border border-white/5 border-dashed mt-4">
                 <Package className="w-12 h-12 text-slate-600 mb-4" />
                 <p className="text-slate-500 font-medium">No orders found.</p>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
