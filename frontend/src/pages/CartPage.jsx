import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../slices/cartSlice';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const addToCartHandler = async (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = async (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/checkout');
  };

  return (
    <div className="w-full">
      <h1 className="text-4xl font-display font-black text-slate-100 mb-10 tracking-tight flex items-center gap-4">
        <ShoppingBag className="w-10 h-10 text-indigo-400" />
        Shopping <span className="text-slate-500">Cart</span>
      </h1>

      {cartItems.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl mx-auto bg-[#0a0a0a] rounded-3xl p-12 text-center border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        >
          <div className="w-24 h-24 rounded-full bg-[#171717] border border-white/5 mx-auto flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Your cart is empty</h2>
          <p className="text-slate-500 mb-8 font-medium">Looks like you haven't added any premium gear yet.</p>
          <Link to="/" className="inline-flex items-center justify-center px-8 py-4 rounded-full font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-indigo-400/50">
            Explore Collection
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div 
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, height: 0, margin: 0 }}
                  className="bg-[#0a0a0a] rounded-[2rem] p-4 flex flex-col sm:flex-row items-center gap-6 border border-white/5 shadow-sm hover:border-indigo-500/30 transition-colors relative overflow-hidden group"
                >
                  <Link to={`/product/${item._id}`} className="w-32 h-32 flex-shrink-0 bg-[#050505] border border-white/5 rounded-2xl p-2 relative z-10">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </Link>

                  <div className="flex-1 w-full relative z-10 text-center sm:text-left">
                    <Link to={`/product/${item._id}`} className="text-lg font-bold text-slate-200 hover:text-indigo-400 transition-colors line-clamp-1 mb-2">
                      {item.name}
                    </Link>
                    <div className="text-2xl font-black text-indigo-400 mb-4">
                      ${item.price}
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-4">
                      <div className="flex items-center gap-4 bg-[#171717] px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">
                        <button 
                          onClick={() => addToCartHandler(item, Math.max(1, item.qty - 1))}
                          className="text-slate-500 hover:text-white font-black w-6 transition-colors"
                        >-</button>
                        <span className="font-bold w-4 text-center text-slate-200">{item.qty}</span>
                        <button 
                          onClick={() => addToCartHandler(item, Math.min(item.countInStock, item.qty + 1))}
                          className="text-slate-500 hover:text-white font-black w-6 transition-colors"
                        >+</button>
                      </div>

                      <button 
                        onClick={() => removeFromCartHandler(item._id)}
                        className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all border border-red-500/20 hover:border-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#0a0a0a] rounded-[2rem] p-8 border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] sticky top-28">
              <h2 className="text-2xl font-bold text-slate-100 mb-6 pb-6 border-b border-white/5">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-400 font-medium">
                  <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
                  <span className="font-bold text-slate-200">${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between text-slate-100 text-xl font-black mb-8 pt-6 border-t border-white/5">
                <span>Total</span>
                <span className="text-indigo-400">
                  ${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}
                </span>
              </div>

              <button 
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] disabled:opacity-50 border border-indigo-400/50"
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
