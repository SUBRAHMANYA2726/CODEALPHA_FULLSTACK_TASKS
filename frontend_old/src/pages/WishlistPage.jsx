import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { removeFromWishlist } from '../slices/wishlistSlice';
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import { FaHeart, FaShoppingCart, FaTrash } from 'react-icons/fa';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const moveToCart = (item) => {
    dispatch(addToCart({ ...item, qty: 1 }));
    dispatch(removeFromWishlist(item._id));
    toast.success(`${item.name.slice(0, 20)}... moved to cart!`);
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-10">
            <p className="text-xs text-pink-400 font-semibold uppercase tracking-widest mb-1">Saved Items</p>
            <h1 className="text-3xl lg:text-4xl font-black text-white">
              My <span className="text-pink-400">Wishlist</span>
              {wishlistItems.length > 0 && <span className="text-slate-500 text-xl ml-3">({wishlistItems.length})</span>}
            </h1>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-8xl mb-6">💝</div>
              <h2 className="text-2xl font-bold text-white mb-3">Your wishlist is empty</h2>
              <p className="text-slate-400 mb-8">Save products you love to buy them later</p>
              <Link to="/" className="btn-primary-premium inline-flex items-center gap-2 relative z-10">
                <FaHeart /> Browse Products
              </Link>
            </div>
          ) : (
            <div className="products-grid">
              <AnimatePresence>
                {wishlistItems.map((item, i) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass rounded-2xl overflow-hidden border border-white/10 hover:border-pink-500/30 transition-all group"
                  >
                    <Link to={`/product/${item._id}`} className="block relative h-52 overflow-hidden bg-dark-secondary">
                      <img
                        src={item.thumbnail || item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => { e.target.src = `https://placehold.co/300x200/1A2235/EC4899?text=P`; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </Link>
                    <div className="p-4">
                      <p className="text-xs text-pink-400 font-semibold uppercase tracking-wider mb-1">{item.category}</p>
                      <Link to={`/product/${item._id}`}>
                        <h3 className="font-semibold text-white line-clamp-2 mb-2 hover:text-pink-300 transition-colors">{item.name}</h3>
                      </Link>
                      <p className="text-xl font-black text-white mb-4">${item.price?.toFixed(2)}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => moveToCart(item)}
                          className="flex-1 btn-primary-premium py-2 text-sm flex items-center justify-center gap-1.5 relative z-10"
                        >
                          <FaShoppingCart className="text-xs" /> Add to Cart
                        </button>
                        <button
                          onClick={() => { dispatch(removeFromWishlist(item._id)); toast.info('Removed from wishlist'); }}
                          className="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all border border-white/10"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default WishlistPage;
