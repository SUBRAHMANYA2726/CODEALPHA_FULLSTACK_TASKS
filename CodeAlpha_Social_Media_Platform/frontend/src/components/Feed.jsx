import React from 'react';
import StoriesRing from './StoriesRing';
import PostCard from './PostCard';
import styles from './Feed.module.css';

const MOCK_POSTS = [
  {
    id: 1,
    author: {
      name: 'Sarah Jenkins',
      username: 'sarah.design',
      avatar: 'https://i.pravatar.cc/150?u=3'
    },
    content: 'Just finished redesigning the entire UI kit for our latest project. The new dark mode with glassmorphism looks absolutely stunning! ✨🎨',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000',
    likes: 1245,
    comments: 89
  },
  {
    id: 2,
    author: {
      name: 'Alex Developer',
      username: 'alex_dev',
      avatar: 'https://i.pravatar.cc/150?u=2'
    },
    content: 'Exploring the new Framer Motion layout animations. The transition smoothness is unparalleled! Check out this small snippet of what I built today.',
    likes: 856,
    comments: 42
  },
  {
    id: 3,
    author: {
      name: 'Tech Insider',
      username: 'tech_insider',
      avatar: 'https://i.pravatar.cc/150?u=8'
    },
    content: 'The future of social media is here. Premium design, real-time connectivity, and a focus on user experience.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000',
    likes: 3210,
    comments: 215
  }
];

const Feed = () => {
  const posts = MOCK_POSTS;

  return (
    <div className={styles.feedContainer}>
      <div className={styles.storiesSection}>
        <StoriesRing />
      </div>

      <div className={styles.postsList}>
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Feed;
