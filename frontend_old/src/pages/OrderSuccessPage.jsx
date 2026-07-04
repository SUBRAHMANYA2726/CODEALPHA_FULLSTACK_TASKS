import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaBoxOpen, FaTruck, FaHome } from 'react-icons/fa';
import Loader from '../components/Loader';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
        });
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id && userInfo) fetchOrder();
  }, [id, userInfo]);

  if (loading) return <div className="pt-24"><Loader text="Loading order..." /></div>;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
            className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 border-4 border-green-400/30"
          >
            <FaCheckCircle className="text-5xl text-green-400" />
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-3">Order Placed! 🎉</h1>
          <p className="text-slate-400 text-lg">Your order has been confirmed and will be delivered soon.</p>
          {order && <p className="text-sm text-blue-400 mt-2 font-mono">Order ID: #{order._id?.slice(-8).toUpperCase()}</p>}
        </motion.div>

        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            {/* Order Status */}
            <div className="glass rounded-2xl p-6 border border-white/10 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <h2 className="text-xl font-bold text-white">Order Details</h2>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.isPaid ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                    {order.isPaid ? '✓ Paid' : 'Pending Payment'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.isDelivered ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'}`}>
                    {order.isDelivered ? '✓ Delivered' : 'Processing'}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3 mb-6">
                {order.orderItems?.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 py-3 border-b border-white/5">
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl" onError={(e) => { e.target.src = 'https://placehold.co/60x60/1A2235/60A5FA?text=P'; }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{item.name}</p>
                      <p className="text-xs text-slate-400">Qty: {item.qty}</p>
                    </div>
                    <span className="text-sm font-bold text-white">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm">
                {[['Payment Method', order.paymentMethod], ['Shipping', order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice?.toFixed(2)}`], ['Tax', `$${order.taxPrice?.toFixed(2)}`]].map(([l, v]) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-slate-400">{l}</span>
                    <span className="text-white">{v}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-base">
                  <span className="text-white">Total</span>
                  <span className="gradient-text text-xl">${parseFloat(order.totalPrice).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="glass rounded-2xl p-6 border border-white/10 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <FaTruck className="text-blue-400" />
                  <h3 className="font-bold text-white">Shipping Address</h3>
                </div>
                <p className="text-slate-400 text-sm">
                  {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                  {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Link to="/" className="btn-primary-premium flex-1 py-4 text-base text-center flex items-center justify-center gap-2 relative z-10">
            <FaHome /> Continue Shopping
          </Link>
          <Link to="/profile" className="btn-secondary-premium flex-1 py-4 text-base text-center flex items-center justify-center gap-2">
            <FaBoxOpen /> View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
