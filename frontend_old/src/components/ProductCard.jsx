import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaShoppingCart, FaStar, FaBolt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../slices/wishlistSlice';
import { toast } from 'react-toastify';

const ProductCard = ({ product, index = 0 }) => {
  const dispatch = useDispatch();
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const isWishlisted = wishlistItems.some((item) => item._id === product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ ...product, qty: 1 }));
    toast.success(`${product.name.slice(0, 20)}... added to cart!`);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      dispatch(removeFromWishlist(product._id));
      toast.info('Removed from wishlist');
    } else {
      dispatch(addToWishlist(product));
      toast.success('Added to wishlist!');
    }
  };

  const stars = Math.round(product.rating || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group relative"
    >
      <Link to={`/product/${product._id}`} className="block">
        <div className="glass rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/30">
          
          {/* Image Container */}
          <div className="relative h-52 lg:h-60 bg-gradient-to-br from-dark-secondary to-dark-primary overflow-hidden">
            <img
              src={product.thumbnail || product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.src = `https://placehold.co/400x300/1A2235/60A5FA?text=${encodeURIComponent(product.name?.slice(0, 15) || 'Product')}`;
              }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Wishlist button */}
            <button
              onClick={handleWishlist}
              className="absolute top-3 right-3 w-9 h-9 rounded-full glass flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              {isWishlisted
                ? <FaHeart className="text-pink-400 text-sm" />
                : <FaRegHeart className="text-slate-300 text-sm" />
              }
            </button>

            {/* Stock badge */}
            {product.countInStock === 0 && (
              <span className="absolute top-3 left-3 px-2 py-1 text-xs rounded-lg bg-red-500/80 text-white font-semibold">
                Out of Stock
              </span>
            )}
            {product.countInStock > 0 && product.countInStock <= 5 && (
              <span className="absolute top-3 left-3 px-2 py-1 text-xs rounded-lg bg-orange-500/80 text-white font-semibold">
                Low Stock
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Category */}
            <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">
              {product.category}
            </p>

            {/* Name */}
            <h3 className="text-sm font-semibold text-white leading-tight mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`text-xs ${star <= stars ? 'text-yellow-400' : 'text-slate-700'}`}
                />
              ))}
              <span className="text-xs text-slate-500 ml-1">({product.numReviews || 0})</span>
            </div>

            {/* Price + Cart */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl font-black text-white">${product.price?.toFixed(2)}</span>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.countInStock === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/40"
              >
                <FaShoppingCart className="text-xs" />
                Add
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
