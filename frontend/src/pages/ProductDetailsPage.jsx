import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { addToCart } from '../slices/cartSlice';
import { ArrowLeft, Star, ShoppingCart, ShieldCheck, Truck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const ProductDetailsPage = () => {
  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`/api/products/${productId}`);
        setProduct(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    toast.success('Added to Cart', { icon: '🛒' });
    navigate('/cart');
  };

  return (
    <div className="w-full">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-400 font-medium mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Store
      </Link>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 font-medium shadow-sm">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="relative w-full aspect-square rounded-[2rem] bg-[#0a0a0a] border border-white/5 p-8 flex items-center justify-center group shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`w-full aspect-square rounded-2xl border ${i === 0 ? 'border-indigo-500 bg-[#0a0a0a] shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-transparent bg-[#0a0a0a] shadow-sm hover:border-white/10'} cursor-pointer overflow-hidden p-2 flex items-center justify-center transition-all`}>
                  <img src={product.image} alt="" className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Product Info & Buy Box */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-6">
              <span className="px-3 py-1 bg-[#171717] border border-white/10 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4 inline-block shadow-sm">
                {product.brand || 'Premium Brand'}
              </span>
              <h1 className="text-4xl md:text-5xl font-display font-black text-slate-100 leading-tight mb-4 tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-[#0a0a0a] shadow-sm px-3 py-1.5 rounded-lg border border-white/5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-slate-200">{product.rating}</span>
                  <span className="text-slate-500 text-sm">({product.numReviews} reviews)</span>
                </div>
              </div>
            </div>

            <div className="text-4xl font-black text-indigo-400 mb-8">
              ${product.price}
            </div>

            <p className="text-slate-400 text-lg leading-relaxed mb-8 font-medium">
              {product.description}
            </p>

            {/* Sticky Buy Box */}
            <div className="bg-[#0a0a0a] p-6 rounded-3xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full" />
              
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5 relative z-10">
                <span className="text-slate-400 font-medium">Status</span>
                {product.countInStock > 0 ? (
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-sm font-bold shadow-sm">
                    In Stock ({product.countInStock} available)
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-sm font-bold shadow-sm">
                    Out of Stock
                  </span>
                )}
              </div>

              {product.countInStock > 0 && (
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <span className="text-slate-400 font-medium">Quantity</span>
                  <div className="flex items-center gap-4 bg-[#171717] px-4 py-2 rounded-xl border border-white/5 shadow-inner">
                    <button 
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="text-slate-500 hover:text-white font-black text-xl w-6 transition-colors"
                    >-</button>
                    <span className="font-bold w-6 text-center text-slate-200">{qty}</span>
                    <button 
                      onClick={() => setQty(q => Math.min(product.countInStock, q + 1))}
                      className="text-slate-500 hover:text-white font-black text-xl w-6 transition-colors"
                    >+</button>
                  </div>
                </div>
              )}

              <button
                onClick={addToCartHandler}
                disabled={product.countInStock === 0}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] disabled:opacity-50 disabled:cursor-not-allowed z-10 relative border border-indigo-400/50"
              >
                <ShoppingCart className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Add to Cart</span>
              </button>
            </div>

            {/* Feature list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0a0a0a] p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border border-white/5 shadow-sm hover:border-indigo-500/30 transition-colors">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-400">Secure Checkout</span>
              </div>
              <div className="bg-[#0a0a0a] p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border border-white/5 shadow-sm hover:border-indigo-500/30 transition-colors">
                <Truck className="w-6 h-6 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-400">Free Shipping $100+</span>
              </div>
              <div className="bg-[#0a0a0a] p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border border-white/5 shadow-sm hover:border-indigo-500/30 transition-colors">
                <Zap className="w-6 h-6 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-400">30-Day Returns</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
