import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import StoryViewer from './StoryViewer';
import { Plus } from 'lucide-react';

const StoriesRing = () => {
  const { user } = useAuth();
  const [viewingIndex, setViewingIndex] = useState(null);

  const { data: storiesData } = useQuery({
    queryKey: ['stories'],
    queryFn: () => api.get('/stories').then(res => res.data),
  });

  const stories = Array.isArray(storiesData) ? storiesData : [];

  const isValidStory = (s) => {
    const author = s?.author || {};
    return author._id && author.name;
  };

  const validStories = stories.filter(isValidStory);

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar px-1">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col items-center gap-2 cursor-pointer min-w-[72px] group"
        >
          <div className="relative w-16 h-16 rounded-full flex items-center justify-center p-[2px] border-2 border-dashed border-gray-300 dark:border-white/20 group-hover:border-[var(--primary)] transition-colors">
            <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name}&background=5c3ce6&color=fff`}
              alt="Your story" className="w-full h-full rounded-full object-cover p-0.5" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white border-2 border-[var(--background)] gradient-primary shadow-colored group-hover:scale-110 transition-transform">
              <Plus strokeWidth={3} size={14} />
            </div>
          </div>
          <span className="text-xs font-semibold truncate max-w-[72px]" style={{ color: 'var(--foreground)' }}>Your Story</span>
        </motion.div>

        {validStories.map((storyGroup, idx) => {
          const author = storyGroup.author || {};
          return (
            <motion.div
              key={storyGroup._id || idx}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex flex-col items-center gap-2 cursor-pointer min-w-[72px] group"
              onClick={() => setViewingIndex(idx)}
            >
              <div className="relative w-16 h-16 rounded-full p-[3px] group-hover:scale-105 transition-transform duration-300">
                {/* Animated Ring */}
                <div className="absolute inset-0 rounded-full animate-[spin_4s_linear_infinite]" style={{ background: 'linear-gradient(90deg, #2563EB, #8B5CF6, #EC4899, #2563EB)' }} />
                {/* Image Container (blocks center of ring) */}
                <div className="relative w-full h-full rounded-full border-[3px] border-[var(--background)] bg-[var(--background)] overflow-hidden">
                  <img src={author.profilePicture || `https://ui-avatars.com/api/?name=${author.name}&background=5c3ce6&color=fff`}
                    alt={author.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="text-xs font-semibold truncate max-w-[72px] group-hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--foreground)' }}>
                {author.name.split(' ')[0]}
              </span>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {viewingIndex !== null && (
          <StoryViewer
            stories={validStories}
            initialIndex={viewingIndex}
            onClose={() => setViewingIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default StoriesRing;

