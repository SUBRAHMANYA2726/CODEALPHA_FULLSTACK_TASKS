import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShoppingCart, Star } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../slices/cartSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty: 1 }));
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative group w-full h-[450px] rounded-[2rem] bg-[#0a0a0a] flex flex-col p-4 border border-white/5 hover:border-indigo-500/50 transition-colors duration-500 cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
    >
      {/* Indigo glow background on hover */}
      <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]" />
      
      {/* Product Image */}
      <Link to={`/product/${product._id}`} className="relative h-56 w-full rounded-2xl overflow-hidden mb-4 bg-[#050505] border border-white/5" style={{ transform: "translateZ(30px)" }}>
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out p-4"
        />
        
        {/* Floating Stock Badge */}
        {product.countInStock === 0 ? (
          <div className="absolute top-3 right-3 px-3 py-1 bg-[#050505]/80 backdrop-blur-md rounded-full text-xs font-bold text-slate-400 shadow-sm border border-white/10">
            Out of Stock
          </div>
        ) : (
          <div className="absolute top-3 right-3 px-3 py-1 bg-indigo-600/90 backdrop-blur-md rounded-full text-xs font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-400/50">
            In Stock
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 z-10" style={{ transform: "translateZ(40px)" }}>
        <Link to={`/product/${product._id}`} className="text-lg font-bold text-slate-200 hover:text-indigo-400 transition-colors line-clamp-2 mb-2">
          {product.name}
        </Link>
        
        <div className="flex items-center gap-1 mb-auto">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-800 fill-slate-900'}`} />
          ))}
          <span className="text-xs text-slate-500 ml-1 font-medium">({product.numReviews})</span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-black text-slate-100">
            ${product.price}
          </span>

          <button 
            onClick={addToCartHandler}
            disabled={product.countInStock === 0}
            className="w-12 h-12 rounded-xl bg-[#171717] hover:bg-indigo-600 hover:text-white text-slate-400 flex items-center justify-center transition-all duration-300 border border-white/5 hover:border-transparent disabled:opacity-50 disabled:cursor-not-allowed group/btn hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
          >
            <ShoppingCart className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
