import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Pause } from 'lucide-react';

const StoryViewer = ({ stories, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const animRef = useRef(null);
  const startTimeRef = useRef(null);
  const DURATION = 5000;

  const currentStory = stories[currentIndex];
  const author = currentStory?.author || {};

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      onClose();
    }
  }, [currentIndex, onClose, stories.length]);

  const resetProgress = useCallback(() => {
    setProgress(0);
    startTimeRef.current = Date.now();
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (!paused) {
      const tick = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const pct = Math.min(elapsed / DURATION, 1);
        setProgress(pct);
        if (pct < 1) {
          animRef.current = requestAnimationFrame(tick);
        } else {
          goNext();
        }
      };
      animRef.current = requestAnimationFrame(tick);
    }
  }, [paused, goNext]);

  useEffect(() => {
    resetProgress();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [currentIndex, paused, resetProgress]);

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  };

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.3) {
      goPrev();
    } else {
      goNext();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === ' ') { e.preventDefault(); setPaused(v => !v); }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white">
        <X size={24} />
      </button>

      <button onClick={goPrev} disabled={currentIndex === 0}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronLeft size={28} />
      </button>

      <button onClick={goNext} disabled={currentIndex === stories.length - 1}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronRight size={28} />
      </button>

      <div className="relative w-full max-w-lg mx-4"
        onClick={handleClick}
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <div className="absolute top-0 left-0 right-0 z-10 flex gap-1.5 px-2 pt-2">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
              <div className="h-full rounded-full bg-white transition-all duration-100"
                style={{
                  width: i < currentIndex ? '100%' : i === currentIndex ? `${progress * 100}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl overflow-hidden"
          >
            {currentStory?.mediaType === 'video' ? (
              <video src={currentStory.media} className="w-full aspect-[9/16] object-cover" autoPlay muted playsInline />
            ) : (
              <img src={currentStory.media || author.profilePicture}
                alt="" className="w-full aspect-[9/16] object-cover" />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center gap-3">
            <img src={author.profilePicture || `https://ui-avatars.com/api/?name=${author.name}&background=4FBCFF&color=fff`}
              className="w-9 h-9 rounded-full border-2 border-white/30 object-cover" alt="" />
            <div>
              <p className="text-white font-semibold text-sm">{author.name}</p>
              <p className="text-white/60 text-xs">@{author.username}</p>
            </div>
            {paused && (
              <div className="ml-auto text-white/80">
                <Pause size={18} />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StoryViewer;
