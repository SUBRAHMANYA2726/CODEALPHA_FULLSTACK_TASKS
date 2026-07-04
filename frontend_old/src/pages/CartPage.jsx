import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { addToCart, removeFromCart, clearCartItems } from '../slices/cartSlice';
import { FaTrash, FaShoppingCart, FaArrowRight, FaPlus, FaMinus } from 'react-icons/fa';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);

  const itemsPrice = cartItems.reduce((a, c) => a + c.price * c.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
  const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2);

  const updateQty = (item, qty) => {
    if (qty === 0) dispatch(removeFromCart(item._id));
    else dispatch(addToCart({ ...item, qty }));
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-1">Shopping</p>
            <h1 className="text-3xl lg:text-4xl font-black text-white">
              Your <span className="gradient-text">Cart</span>
              {cartItems.length > 0 && <span className="text-slate-500 text-xl ml-3">({cartItems.reduce((a,c)=>a+c.qty,0)} items)</span>}
            </h1>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-8xl mb-6">🛒</div>
              <h2 className="text-2xl font-bold text-white mb-3">Your cart is empty</h2>
              <p className="text-slate-400 mb-8">Add some amazing products to get started!</p>
              <Link to="/" className="btn-primary-premium inline-flex items-center gap-2 relative z-10">
                <FaShoppingCart /> Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="glass rounded-2xl p-5 flex gap-5 border border-white/10 hover:border-blue-500/30 transition-colors"
                    >
                      <Link to={`/product/${item._id}`} className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-dark-secondary">
                          <img
                            src={item.thumbnail || item.image}
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            onError={(e) => { e.target.src = 'https://placehold.co/100x100/1A2235/60A5FA?text=P'; }}
                          />
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item._id}`}>
                          <h3 className="font-semibold text-white hover:text-blue-300 transition-colors line-clamp-2 mb-1">{item.name}</h3>
                        </Link>
                        <p className="text-xs text-slate-500 capitalize mb-3">{item.category}</p>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          {/* Qty Controls */}
                          <div className="flex items-center gap-2 glass rounded-xl border border-white/10 overflow-hidden">
                            <button onClick={() => updateQty(item, item.qty - 1)} className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                              <FaMinus className="text-xs" />
                            </button>
                            <span className="w-8 text-center text-white font-semibold text-sm">{item.qty}</span>
                            <button onClick={() => updateQty(item, Math.min(item.countInStock, item.qty + 1))} className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                              <FaPlus className="text-xs" />
                            </button>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-black text-white">${(item.price * item.qty).toFixed(2)}</span>
                            <button onClick={() => dispatch(removeFromCart(item._id))} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all">
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <button
                  onClick={() => dispatch(clearCartItems())}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear entire cart
                </button>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="glass rounded-2xl p-6 border border-white/10 sticky top-24">
                  <h2 className="text-xl font-black text-white mb-6">Order Summary</h2>
                  <div className="space-y-3 mb-6">
                    {[
                      ['Subtotal', `$${itemsPrice.toFixed(2)}`],
                      ['Shipping', shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`],
                      ['Tax (15%)', `$${taxPrice.toFixed(2)}`],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-slate-400">{label}</span>
                        <span className={`font-medium ${val === 'FREE' ? 'text-green-400' : 'text-white'}`}>{val}</span>
                      </div>
                    ))}
                    <div className="border-t border-white/10 pt-3 flex justify-between">
                      <span className="font-bold text-white">Total</span>
                      <span className="text-2xl font-black gradient-text">${totalPrice}</span>
                    </div>
                  </div>

                  {shippingPrice > 0 && (
                    <p className="text-xs text-slate-500 mb-4 text-center">Add ${(100 - itemsPrice).toFixed(2)} more for free shipping!</p>
                  )}

                  <button
                    onClick={() => navigate('/checkout')}
                    className="btn-primary-premium w-full py-4 text-base flex items-center justify-center gap-2 relative z-10"
                  >
                    Checkout <FaArrowRight />
                  </button>

                  <Link to="/" className="block text-center text-sm text-blue-400 hover:text-blue-300 mt-4 transition-colors">
                    ← Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CartPage;
