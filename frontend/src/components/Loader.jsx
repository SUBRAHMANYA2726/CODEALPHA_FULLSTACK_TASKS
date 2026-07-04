import { Loader2 } from 'lucide-react';

const Loader = () => {
  return (
    <div className="w-full flex items-center justify-center py-20">
      <div className="relative">
        <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 rounded-full animate-pulse" />
        <Loader2 className="w-10 h-10 animate-spin text-cyan-400 relative z-10" />
      </div>
    </div>
  );
};

export default Loader;
