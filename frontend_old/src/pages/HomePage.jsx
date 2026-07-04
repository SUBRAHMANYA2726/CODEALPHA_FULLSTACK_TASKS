import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import HeroBanner from '../components/HeroBanner';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

const categories = ['All', 'beauty', 'fragrances', 'furniture', 'groceries', 'home-decoration', 'kitchen-accessories', 'laptops', 'mens-shirts', 'mens-shoes', 'mens-watches', 'mobile-accessories', 'motorcycle', 'skin-care', 'smartphones', 'sports-accessories', 'sunglasses', 'tablets', 'tops', 'vehicle', 'womens-bags', 'womens-dresses', 'womens-jewellery', 'womens-shoes', 'womens-watches'];

const HomePage = () => {
  const { keyword } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState(keyword || '');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const url = keyword
          ? `/api/products?keyword=${keyword}`
          : '/api/products?limit=100';
        const { data } = await axios.get(url);
        setProducts(data.products || data);
      } catch {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword]);

  const filtered = products
    .filter((p) => activeCategory === 'All' || p.category === activeCategory)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  return (
    <div className="min-h-screen">
      {!keyword && <HeroBanner />}

      <div className="container mx-auto px-4 lg:px-6 py-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
        >
          <div>
            {keyword ? (
              <>
                <Link to="/" className="text-sm text-blue-400 hover:text-blue-300 mb-2 inline-flex items-center gap-1">
                  <FaTimes className="text-xs" /> Clear search
                </Link>
                <h2 className="text-3xl font-black text-white">Results for "<span className="gradient-text">{keyword}</span>"</h2>
              </>
            ) : (
              <>
                <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-1">Featured Collection</p>
                <h2 className="text-3xl lg:text-4xl font-black text-white">Latest <span className="gradient-text">Products</span></h2>
              </>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <FaFilter className="text-slate-400 text-sm" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-premium text-sm py-2 w-48"
            >
              <option value="default">Default Sort</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </motion.div>

        {/* Category Filter */}
        {!keyword && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-white/10"
          >
            {['All', 'beauty', 'smartphones', 'laptops', 'fragrances', 'groceries', 'skin-care'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 capitalize ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'glass text-slate-400 hover:text-white hover:border-blue-500/40 border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}

        {/* Products Grid */}
        {loading ? (
          <Loader text="Loading products..." />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
            <p className="text-slate-400">Try a different search or category</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-6">{filtered.length} products</p>
            <div className="products-grid">
              {filtered.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
