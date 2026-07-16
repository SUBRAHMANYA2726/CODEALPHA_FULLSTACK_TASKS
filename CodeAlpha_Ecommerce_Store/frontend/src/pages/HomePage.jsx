import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import HeroBanner from '../components/HeroBanner';
import Loader from '../components/Loader';
import { motion } from 'framer-motion';

const COLLECTIONS = [
  { id: 1, name: 'Pro Audio', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80' },
  { id: 2, name: 'Mechanical Keyboards', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' },
  { id: 3, name: 'Performance Mice', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80' }
];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get('/api/products?limit=100');
        setProducts(data.products || data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="w-full flex flex-col gap-16">
      <HeroBanner />

      {/* Featured Collections Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-display font-bold text-slate-100 tracking-tight">
            Featured <span className="text-indigo-400">Collections</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLLECTIONS.map(collection => (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              key={collection.id} 
              className="relative h-64 rounded-3xl overflow-hidden group cursor-pointer border border-white/5"
            >
              <img src={collection.image} alt={collection.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
              <div className="absolute bottom-6 left-6 z-10">
                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{collection.name}</h3>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors flex items-center gap-1">Explore <span className="group-hover:translate-x-1 transition-transform">→</span></span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Gear Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-display font-bold text-slate-100 tracking-tight">
            Featured <span className="text-indigo-400">Gear</span>
          </h2>
          <button className="text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors">
            View All →
          </button>
        </div>

        {isLoading ? (
          <Loader />
        ) : error ? (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 font-medium">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Decorative divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-8" />
    </div>
  );
};

export default HomePage;
