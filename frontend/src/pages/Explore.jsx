import React, { useState, useRef, useCallback } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Loader2, Search, TrendingUp, Users, Hash, Image as ImageIcon, Grid, AlertCircle, Compass, Heart, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '../components/PostCard';

const CATEGORIES = ['Technology', 'Art', 'Sports', 'Gaming', 'Music', 'Science', 'Fashion', 'Travel'];

const MOCK_HASHTAGS = [];
const MOCK_POSTS = [];
const MOCK_USERS = [];
const MOCK_COMMUNITIES = [];

const ensureArray = (data, fallback) => Array.isArray(data) ? data : fallback;

const Explore = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  const { data: postsData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: loadingPosts } = useInfiniteQuery({
    queryKey: ['explorePosts', activeCategory],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const res = await api.get(`/explore/posts/latest?page=${pageParam}&limit=10`);
        return res.data;
      } catch { return { posts: MOCK_POSTS, page: 1, pages: 1 }; }
    },
    getNextPageParam: (lastPage) => (lastPage && lastPage.page < lastPage.pages) ? lastPage.page + 1 : undefined,
  });

  const { data: trendingPostsData, isLoading: loadingTrending } = useQuery({
    queryKey: ['trendingPosts'],
    queryFn: async () => {
      try { const res = await api.get('/explore/trending'); return ensureArray(res.data, MOCK_POSTS); }
      catch { return MOCK_POSTS; }
    }
  });

  const { data: suggestedUsersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['suggestedUsers'],
    queryFn: async () => {
      try { const res = await api.get('/explore/users/suggestions'); return ensureArray(res.data, MOCK_USERS); }
      catch { return MOCK_USERS; }
    }
  });

  const { data: communitiesData, isLoading: loadingCommunities } = useQuery({
    queryKey: ['exploreCommunities'],
    queryFn: async () => {
      try { const res = await api.get('/communities'); return ensureArray(res.data, MOCK_COMMUNITIES); }
      catch { return MOCK_COMMUNITIES; }
    }
  });

  const observer = useRef();
  const lastPostElementRef = useCallback(node => {
    if (loadingPosts || isFetchingNextPage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) { fetchNextPage(); }
    });
    if (node) observer.current.observe(node);
  }, [loadingPosts, isFetchingNextPage, hasNextPage, fetchNextPage]);

  const trendingPosts = ensureArray(trendingPostsData, MOCK_POSTS);
  const suggestedUsers = ensureArray(suggestedUsersData, MOCK_USERS);
  const communities = ensureArray(communitiesData, MOCK_COMMUNITIES);
  let allPosts = [];
  if (postsData && Array.isArray(postsData.pages)) {
    allPosts = postsData.pages.flatMap(page => Array.isArray(page?.posts) ? page.posts : []);
  }
  if (!loadingPosts && allPosts.length === 0) allPosts = MOCK_POSTS;

  const allAvailablePosts = [...trendingPosts, ...allPosts].filter(p => p && p._id);
  const uniquePosts = Array.from(new Map(allAvailablePosts.map(item => [item._id, item])).values());
  const popularPhotos = uniquePosts.filter(p => p?.image).slice(0, 6);

  const filteredPosts = searchQuery
    ? allPosts.filter(p => p && (p.content?.toLowerCase().includes(searchQuery.toLowerCase()) || p.hashtags?.some(t => t?.toLowerCase().includes(searchQuery.toLowerCase()))))
    : allPosts;

  if (loadingPosts && loadingTrending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-colored">
          <Compass size={28} className="text-white animate-pulse" />
        </div>
        <p className="font-bold text-sm" style={{ color: 'var(--foreground-muted)' }}>Discovering content...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24 lg:pb-6">
      {/* Search Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="card p-6 md:p-8 mb-8 shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
          <Compass size={256} />
        </div>
        
        <div className="flex items-center gap-4 mb-5 relative z-10">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-colored">
            <Compass size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>Explore</h1>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>Discover posts, people, and communities</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full px-5 py-3.5 rounded-xl border focus-within:ring-2 ring-[var(--primary-light)] transition-all bg-black/5 dark:bg-white/5 border-transparent focus-within:border-[var(--primary)] relative z-10">
          <Search size={20} className="text-gray-400" />
          <input type="text" placeholder="Search for posts, tags, or people..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium" style={{ color: 'var(--foreground)' }} />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-400">
              <span className="text-sm font-bold">✕</span>
            </button>
          )}
        </div>

        <div className="flex gap-2 mt-5 overflow-x-auto pb-1 no-scrollbar relative z-10">
          <button onClick={() => setActiveCategory('')}
            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${!activeCategory ? 'gradient-primary text-white shadow-colored' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'}`}>
            All
          </button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'gradient-primary text-white shadow-colored' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'}`}>
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Trending Carousel */}
          {trendingPosts.length > 0 && !searchQuery && (
            <div>
              <div className="flex items-center gap-3 mb-4 px-1">
                <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                  <TrendingUp size={18} />
                </div>
                <h2 className="text-xl font-black" style={{ color: 'var(--foreground)' }}>Trending Now</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
                {trendingPosts.slice(0, 5).map(post => (
                  <div key={post._id} className="min-w-[300px] md:min-w-[400px] snap-center shrink-0">
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photo Grid (Pinterest Style) */}
          {popularPhotos.length > 0 && !searchQuery && (
            <div className="card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                  <ImageIcon size={18} />
                </div>
                <h2 className="text-xl font-black" style={{ color: 'var(--foreground)' }}>Popular Photos</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {popularPhotos.map(post => (
                  <motion.div key={post._id} whileHover={{ scale: 1.03 }}
                    onClick={() => navigate(`/post/${post._id}`)}
                    className="aspect-square rounded-2xl overflow-hidden cursor-pointer group relative bg-black/5 dark:bg-white/5 shadow-sm">
                    <img src={post.image} alt="Post" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white font-bold flex items-center gap-2 text-sm">
                        <Heart size={16} className="fill-white" /> {post.likes?.length || 0}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Latest Posts */}
          <div>
            <div className="flex items-center gap-3 mb-4 px-1">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white shadow-colored">
                <Grid size={18} />
              </div>
              <h2 className="text-xl font-black" style={{ color: 'var(--foreground)' }}>{searchQuery ? 'Search Results' : 'Latest Posts'}</h2>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="card p-12 text-center shadow-sm">
                <AlertCircle size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-black mb-2" style={{ color: 'var(--foreground)' }}>No posts found</h3>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>Be the first to share something amazing!</p>
              </div>
            ) : (
              <div className="space-y-0">
                {filteredPosts.map((post, index) => {
                  if (filteredPosts.length === index + 1) {
                    return <div ref={lastPostElementRef} key={post._id}><PostCard post={post} /></div>;
                  }
                  return <PostCard key={post._id} post={post} />;
                })}
              </div>
            )}

            {isFetchingNextPage && (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Trending Topics */}
          <div className="card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                <Hash size={18} />
              </div>
              <h2 className="font-black text-[15px]">Trending Topics</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {MOCK_HASHTAGS.map(tag => (
                <motion.button key={tag} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchQuery(tag.replace('#', ''))}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20">
                  {tag}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Communities */}
          <div className="card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
                <Users size={18} />
              </div>
              <h2 className="font-black text-[15px]">Communities</h2>
            </div>
            <div className="space-y-4">
              {loadingCommunities ? (
                <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" /></div>
              ) : communities.length > 0 ? communities.slice(0, 4).map(community => (
                <Link key={community._id} to="/communities" className="flex items-center gap-3 group">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-110 transition-transform">
                    {community.name ? community.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm group-hover:text-[var(--primary)] transition-colors">{community.name || 'Community'}</h3>
                    <p className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>{community.members?.length || 0} members</p>
                  </div>
                </Link>
              )) : (
                <p className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>No communities found.</p>
              )}
            </div>
          </div>

          {/* People to Follow */}
          <div className="card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white shadow-colored">
                <Sparkles size={18} />
              </div>
              <h2 className="font-black text-[15px]">People to Follow</h2>
            </div>
            <div className="space-y-4">
              {loadingUsers ? (
                <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" /></div>
              ) : suggestedUsers.length > 0 ? suggestedUsers.slice(0, 5).map(user => (
                <Link key={user._id} to={`/profile/${user.username}`} className="flex items-center gap-3 group">
                  <img src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=5c3ce6&color=fff`}
                    className="w-11 h-11 rounded-full object-cover shadow-sm border-2 border-transparent group-hover:border-[var(--primary)] transition-all" alt={user.name} />
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-sm truncate flex items-center gap-1 group-hover:text-[var(--primary)] transition-colors">
                      {user.name || 'User'}
                      {user.isVerified && (
                        <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[9px]">✓</span>
                      )}
                    </h3>
                    <p className="text-xs truncate font-medium" style={{ color: 'var(--foreground-muted)' }}>@{user.username || 'user'}</p>
                  </div>
                  <button className="px-4 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    Follow
                  </button>
                </Link>
              )) : (
                <p className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>No suggestions right now.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
