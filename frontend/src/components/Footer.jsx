import { Gamepad2, MessageCircle, Globe, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-black/5 bg-white/80 backdrop-blur-3xl relative overflow-hidden">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-30" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-white shadow-md">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <span className="font-display font-bold text-2xl text-slate-900">EcomStore</span>
            </div>
            <p className="text-slate-500 max-w-sm mb-6 leading-relaxed font-medium">
              The ultimate destination for premium gaming gear. Designed for players who demand the best in performance and aesthetics.
            </p>
            <div className="flex gap-4">
              {[MessageCircle, Globe, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 hover:shadow-sm border border-black/5 transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-slate-900 font-bold mb-6">Marketplace</h3>
            <ul className="space-y-4">
              {['Store', 'Trending', 'New Arrivals', 'Collections'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-500 font-medium hover:text-slate-900 transition-colors text-sm">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-slate-900 font-bold mb-6">Legal</h3>
            <ul className="space-y-4">
              {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Refunds'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-500 font-medium hover:text-slate-900 transition-colors text-sm">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 font-medium text-sm">
            &copy; {new Date().getFullYear()} EcomStore Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
            Powered by <span className="text-slate-900 font-bold">Billion Dollar Stack</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
