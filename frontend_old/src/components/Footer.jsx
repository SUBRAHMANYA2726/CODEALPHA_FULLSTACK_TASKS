import { Link } from 'react-router-dom';
import { FaInstagram, FaTwitter, FaGithub, FaLinkedin, FaShoppingBag } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#080C14] border-t border-white/5 mt-20">
      <div className="container mx-auto px-4 lg:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-black text-sm">E</span>
              </div>
              <span className="text-xl font-black">
                <span className="text-white">Ecom</span>
                <span className="gradient-text">Store</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Premium e-commerce experience with curated products, fast delivery, and world-class customer support.
            </p>
            <div className="flex items-center gap-3">
              {[FaTwitter, FaInstagram, FaGithub, FaLinkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/50 transition-all duration-200 hover:scale-110">
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-widest">Shop</h4>
            <ul className="space-y-3">
              {['All Products', 'Electronics', 'Beauty', 'Smartphones', 'Laptops', 'Fragrances'].map((item) => (
                <li key={item}>
                  <Link to="/search" className="text-slate-400 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 inline-block">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-widest">Account</h4>
            <ul className="space-y-3">
              {[['Profile', '/profile'], ['Cart', '/cart'], ['Wishlist', '/wishlist'], ['Login', '/login'], ['Register', '/register']].map(([label, path]) => (
                <li key={label}>
                  <Link to={path} className="text-slate-400 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 inline-block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-widest">Newsletter</h4>
            <p className="text-slate-400 text-sm mb-4">Get exclusive deals and product launches in your inbox.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                className="input-premium text-sm"
              />
              <button className="btn-primary-premium text-sm py-2.5 relative z-10">Subscribe</button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© 2026 EcomStore. All rights reserved.</p>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <FaShoppingBag className="text-blue-400" />
            <span>Made with passion for great shopping</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
