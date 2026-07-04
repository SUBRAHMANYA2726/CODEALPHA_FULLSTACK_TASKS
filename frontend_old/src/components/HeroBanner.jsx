import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaStar, FaShoppingBag } from 'react-icons/fa';

const categories = [
  { name: 'Beauty', emoji: '💄', color: 'from-pink-500 to-rose-600' },
  { name: 'Electronics', emoji: '⚡', color: 'from-blue-500 to-cyan-600' },
  { name: 'Smartphones', emoji: '📱', color: 'from-purple-500 to-indigo-600' },
  { name: 'Laptops', emoji: '💻', color: 'from-green-500 to-purple-600' },
  { name: 'Fragrances', emoji: '🌸', color: 'from-orange-500 to-amber-600' },
  { name: 'Groceries', emoji: '🛒', color: 'from-lime-500 to-green-600' },
];

const HeroBanner = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[#0B0F19]">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-float-delay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-20">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-blue-500/30 text-blue-400 text-sm font-medium mb-6">
                <FaStar className="text-yellow-400" />
                Premium Products • Fast Delivery
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-black leading-tight text-white mb-6"
            >
              Discover
              <br />
              <span className="gradient-text text-glow">Premium</span>
              <br />
              Products
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-400 leading-relaxed mb-8 max-w-md"
            >
              Shop the latest trends with exclusive deals on electronics, beauty, fashion and more. Premium quality, unbeatable prices.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/search"
                className="btn-primary-premium flex items-center gap-2 text-base relative z-10"
              >
                <FaShoppingBag /> Shop Now <FaArrowRight className="text-sm" />
              </Link>
              <Link
                to="/search"
                className="btn-secondary-premium flex items-center gap-2 text-base"
              >
                Browse All
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex gap-8 mt-12"
            >
              {[['50+', 'Products'], ['100%', 'Secure'], ['24/7', 'Support']].map(([val, label]) => (
                <div key={label}>
                  <p className="text-2xl font-black gradient-text">{val}</p>
                  <p className="text-sm text-slate-400">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:flex justify-center items-center"
          >
            <div className="relative">
              <div className="w-[420px] h-[420px] rounded-3xl overflow-hidden glass glow-blue animate-pulse-glow">
                <img
                  src="/images/hero.png"
                  alt="Premium Products"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = 'linear-gradient(135deg, #1E2D4A, #0B0F19)';
                    e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:80px;">🛍️</div>';
                  }}
                />
              </div>
              {/* Floating badges */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 glass px-4 py-2 rounded-2xl border border-blue-500/30 shadow-lg"
              >
                <p className="text-xs text-slate-400">Best Seller</p>
                <p className="text-sm font-bold text-white">50+ Products</p>
              </motion.div>
              <motion.div
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 glass px-4 py-2 rounded-2xl border border-purple-500/30 shadow-lg"
              >
                <p className="text-xs text-slate-400">Free Shipping</p>
                <p className="text-sm font-bold gradient-text">On Orders $100+</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Category Chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="pb-12"
        >
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-4">Browse Categories</p>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/search?category=${cat.name.toLowerCase()}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl glass border border-white/10 text-sm font-medium text-slate-300 hover:text-white hover:border-blue-500/50 transition-all duration-200 hover:scale-105 group"
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBanner;
