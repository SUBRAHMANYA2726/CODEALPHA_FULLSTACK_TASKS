import React, { useState, useRef, useCallback } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Loader2, Search, TrendingUp, Users, Hash, Image as ImageIcon, Grid, AlertCircle, Compass, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';

const CATEGORIES = ['Technology', 'Art', 'Sports', 'Gaming', 'Music', 'Science', 'Fashion', 'Travel'];

const MOCK_HASHTAGS = ['#javascript', '#react', '#webdev', '#design', '#photography', '#ai', '#startup', '#coding'];

const MOCK_POSTS = [
  {
    _id: 'mock1', author: { _id: 'u1', name: 'Alex Rivera', username: 'alex_rivera', profilePicture: 'https://i.pravatar.cc/150?u=1', isVerified: true },
    content: 'Just shipped the new feature! The community response has been incredible 🚀 #launch #buildinpublic',
    likes: ['1', '2', '3'], comments: [], hashtags: ['launch', 'buildinpublic'], createdAt: new Date().toISOString()
  },
  {
    _id: 'mock2', author: { _id: 'u2', name: 'Sarah Chen', username: 'sarah_art', profilePicture: 'https://i.pravatar.cc/150?u=2' },
    content: 'Check out my latest photography! 📸 #art #photography',
    image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=800',
    likes: ['1', '2', '3', '4', '5'], comments: [], hashtags: ['art', 'photography'],
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

const MOCK_USERS = [{ _id: 'u3', name: 'Marcus Johnson', username: 'marcus_johnson', isVerified: false, profilePicture: '' }];

const MOCK_COMMUNITIES = [{ _id: 'c1', name: 'React Developers', members: ['1', '2'] }];

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
        <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: 'var(--primary)' }} />
        <p className="font-medium" style={{ color: 'var(--foreground-muted)' }}>Discovering content...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24">
      <div className="card p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center">
            <Compass size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">Explore</h1>
        </div>
        <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border focus-within:ring-2 transition-all"
          style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
        >
          <Search size={20} style={{ color: 'var(--foreground-subtle)' }} />
          <input type="text" placeholder="Search for posts, tags, or people..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm" />
        </div>

        <div className="flex gap-2 mt-6 overflow-x-auto pb-2 no-scrollbar">
          <button onClick={() => setActiveCategory('')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!activeCategory ? 'gradient-primary text-white' : 'btn-ghost border'}`}>
            All
          </button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'gradient-primary text-white' : 'btn-ghost border'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {trendingPosts.length > 0 && !searchQuery && (
            <div>
              <div className="flex items-center gap-2 mb-4 px-1">
                <TrendingUp size={20} style={{ color: 'var(--danger)' }} />
                <h2 className="text-xl font-bold">Trending Now</h2>
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

          {popularPhotos.length > 0 && !searchQuery && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon size={20} style={{ color: 'var(--secondary)' }} />
                <h2 className="text-xl font-bold">Popular Photos</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {popularPhotos.map(post => (
                  <div key={post._id} onClick={() => navigate(`/post/${post._id}`)}
                    className="aspect-square rounded-2xl overflow-hidden cursor-pointer group relative bg-muted">
                    <img src={post.image} alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-medium flex items-center gap-1">
                        <Heart size={16} className="fill-white" /> {post.likes?.length || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-4 px-1">
              <Grid size={20} style={{ color: 'var(--primary)' }} />
              <h2 className="text-xl font-bold">{searchQuery ? 'Search Results' : 'Latest Posts'}</h2>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="card p-10 text-center">
                <AlertCircle size={48} style={{ color: 'var(--foreground-subtle)' }} className="mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-1">No posts found</h3>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Be the first to share something amazing!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPosts.map((post, index) => {
                  if (filteredPosts.length === index + 1) {
                    return <div ref={lastPostElementRef} key={post._id}><PostCard post={post} /></div>;
                  }
                  return <PostCard key={post._id} post={post} />;
                })}
              </div>
            )}

            {isFetchingNextPage && (
              <div className="py-6 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Hash size={20} style={{ color: 'var(--warning)' }} />
              <h2 className="font-bold">Trending Topics</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {MOCK_HASHTAGS.map(tag => (
                <button key={tag} onClick={() => setSearchQuery(tag.replace('#', ''))}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users size={20} style={{ color: 'var(--secondary)' }} />
              <h2 className="font-bold">Communities</h2>
            </div>
            <div className="space-y-4">
              {loadingCommunities ? (
                <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--primary)' }} /></div>
              ) : communities.length > 0 ? communities.slice(0, 4).map(community => (
                <Link key={community._id} to="/communities" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-xl gradient-violet flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                    {community.name ? community.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm group-hover:text-violet-600 transition-colors">{community.name || 'Community'}</h3>
                    <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{community.members?.length || 0} members</p>
                  </div>
                </Link>
              )) : (
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>No communities found.</p>
              )}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users size={20} style={{ color: 'var(--primary)' }} />
              <h2 className="font-bold">People to Follow</h2>
            </div>
            <div className="space-y-4">
              {loadingUsers ? (
                <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--primary)' }} /></div>
              ) : suggestedUsers.length > 0 ? suggestedUsers.slice(0, 5).map(user => (
                <Link key={user._id} to={`/profile/${user.username}`} className="flex items-center gap-3 group">
                  <img src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=2563EB&color=fff`}
                    className="w-10 h-10 rounded-full object-cover" alt={user.name} />
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-sm truncate flex items-center gap-1">
                      {user.name || 'User'}
                      {user.isVerified && (
                        <div className="verified-badge w-3.5 h-3.5">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </h3>
                    <p className="text-xs truncate" style={{ color: 'var(--foreground-muted)' }}>@{user.username || 'user'}</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
                    Follow
                  </button>
                </Link>
              )) : (
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>No suggestions right now.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
