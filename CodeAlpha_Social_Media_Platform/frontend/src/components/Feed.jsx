import React from 'react';
import StoriesRing from './StoriesRing';
import PostCard from './PostCard';
import styles from './Feed.module.css';

const MOCK_POSTS = [];

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
