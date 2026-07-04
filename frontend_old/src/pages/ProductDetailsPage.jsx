import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../slices/wishlistSlice';
import { toast } from 'react-toastify';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import { FaHeart, FaRegHeart, FaShoppingCart, FaBolt, FaArrowLeft, FaStar, FaCheck } from 'react-icons/fa';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { wishlistItems } = useSelector((state) => state.wishlist);
  const isWishlisted = wishlistItems.some((item) => item._id === product?._id);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
      } catch {
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="pt-24"><Loader text="Loading product..." /></div>;
  if (!product) return (
    <div className="pt-24 text-center py-20">
      <p className="text-slate-400">Product not found.</p>
      <Link to="/" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">← Go Back</Link>
    </div>
  );

  const images = [product.thumbnail || product.image, ...(product.images || [])].filter(Boolean);

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, qty }));
    toast.success(`${product.name.slice(0, 25)}... added to cart!`);
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate('/checkout');
  };

  const handleWishlist = () => {
    if (isWishlisted) {
      dispatch(removeFromWishlist(product._id));
      toast.info('Removed from wishlist');
    } else {
      dispatch(addToWishlist(product));
      toast.success('Added to wishlist!');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Back */}
        <motion.button
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Back
        </motion.button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="glass rounded-3xl overflow-hidden h-80 lg:h-[500px] mb-4">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain p-8 transition-opacity duration-300"
                onError={(e) => { e.target.src = `https://placehold.co/600x500/1A2235/60A5FA?text=${encodeURIComponent(product.name?.slice(0,15)||'Product')}`; }}
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.slice(0, 6).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-blue-500' : 'border-white/10 hover:border-white/30'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; }} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-5"
          >
            <div>
              <span className="text-blue-400 text-xs font-semibold uppercase tracking-widest">{product.category} • {product.brand}</span>
              <h1 className="text-3xl lg:text-4xl font-black text-white mt-2 leading-tight">{product.name}</h1>
            </div>

            <Rating value={product.rating} text={`${product.numReviews} reviews`} />

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-white">${product.price?.toFixed(2)}</span>
              <span className="text-lg text-slate-500 line-through">${(product.price * 1.2)?.toFixed(2)}</span>
              <span className="text-green-400 text-sm font-semibold bg-green-400/10 px-2 py-1 rounded-lg">Save 20%</span>
            </div>

            <p className="text-slate-400 leading-relaxed">{product.description}</p>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.countInStock > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className={`text-sm font-medium ${product.countInStock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {product.countInStock > 0 ? `In Stock (${product.countInStock} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity */}
            {product.countInStock > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400">Quantity</span>
                <div className="flex items-center gap-2 glass rounded-xl overflow-hidden border border-white/10">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all text-lg">−</button>
                  <span className="w-10 text-center text-white font-semibold">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.countInStock, qty + 1))} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all text-lg">+</button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.countInStock === 0}
                className="flex-1 btn-secondary-premium flex items-center justify-center gap-2 py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaShoppingCart /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.countInStock === 0}
                className="flex-1 btn-primary-premium flex items-center justify-center gap-2 py-3.5 text-base relative z-10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaBolt /> Buy Now
              </button>
              <button
                onClick={handleWishlist}
                className={`w-14 h-14 rounded-xl glass flex items-center justify-center border transition-all duration-200 hover:scale-110 ${isWishlisted ? 'border-pink-500/50 text-pink-400' : 'border-white/10 text-slate-400 hover:text-pink-400 hover:border-pink-500/30'}`}
              >
                {isWishlisted ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
              {['Free Shipping $100+', 'Secure Checkout', '30-Day Returns'].map((badge) => (
                <div key={badge} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <FaCheck className="text-green-400 text-xs" />
                  {badge}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Specifications */}
        {product.specifications && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16"
          >
            <h3 className="text-2xl font-black text-white mb-6">Specifications</h3>
            <div className="glass rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-white text-sm font-medium">{val}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsPage;
