import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRef } from 'react';

const HeroBanner = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <div ref={ref} className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden rounded-[2.5rem] mt-4 border border-white/5 shadow-[0_0_50px_rgba(79,70,229,0.15)] group bg-[#050505]">
      {/* Dynamic Image Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://media.base44.com/images/public/6a44b0e0181b7c218a6623fd/e2e5542c7_generated_029d7604.png" 
          alt="Aether Arcade Hero" 
          className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[10s] ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]" />
      </div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-30" />

      {/* Content */}
      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 text-center px-4 max-w-5xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a0a0a]/80 backdrop-blur-md border border-indigo-500/30 text-sm font-medium text-indigo-300 mb-8 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Cinematic Immersion meets E-Commerce</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl font-display font-black text-white tracking-tighter leading-[1.1] mb-8"
        >
          Aether <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-amber-200">Arcade.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-2xl text-slate-300 max-w-2xl mx-auto mb-12 font-medium"
        >
          A high-fidelity digital gallery for premium goods, where cinematic immersion meets effortless e-commerce.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link 
            to="/" 
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] overflow-hidden w-full sm:w-auto border border-indigo-400/50"
          >
            <span className="relative z-10 flex items-center gap-2">Explore Collection <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
          </Link>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center px-8 py-4 rounded-full font-bold text-slate-200 bg-[#0a0a0a] border border-white/10 hover:bg-[#171717] hover:border-white/20 transition-all w-full sm:w-auto"
          >
            View Featured
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeroBanner;
