import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import StoryViewer from './StoryViewer';

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
      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-1.5 cursor-pointer min-w-[64px] group"
        >
          <div className="relative w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center" style={{ borderColor: 'var(--border-strong)' }}>
            <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name}&background=4FBCFF&color=fff`}
              alt="Your story" className="w-[52px] h-[52px] rounded-full object-cover" />
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white border-2" style={{ background: 'var(--primary)', borderColor: 'var(--background)' }}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
          </div>
          <span className="text-[11px] truncate max-w-[64px]" style={{ color: 'var(--foreground-muted)' }}>Your Story</span>
        </motion.div>

        {validStories.map((storyGroup, idx) => {
          const author = storyGroup.author || {};
          return (
            <motion.div
              key={storyGroup._id || idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              className="flex flex-col items-center gap-1.5 cursor-pointer min-w-[64px] group"
              onClick={() => setViewingIndex(idx)}
            >
              <div className="w-14 h-14 rounded-full p-[2px]" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                <img src={author.profilePicture || `https://ui-avatars.com/api/?name=${author.name}&background=4FBCFF&color=fff`}
                  alt={author.name} className="w-full h-full rounded-full border-2 object-cover" style={{ borderColor: 'var(--background)' }} />
              </div>
              <span className="text-[11px] truncate max-w-[64px]" style={{ color: 'var(--foreground-muted)' }}>
                {author.username || 'user'}
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
