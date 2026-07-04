import { motion } from 'framer-motion';

const Loader = ({ size = 'md', text = '' }) => {
  const sizes = { sm: 'w-6 h-6', md: 'w-12 h-12', lg: 'w-20 h-20' };
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className={`${sizes[size]} rounded-full border-2 border-transparent border-t-blue-500 border-r-purple-500`}
        />
        <div className={`absolute inset-1 ${sizes[size === 'sm' ? 'sm' : size === 'lg' ? 'md' : 'sm']} rounded-full border border-blue-500/20`} />
      </div>
      {text && <p className="text-sm text-slate-400 animate-pulse">{text}</p>}
    </div>
  );
};

export default Loader;
