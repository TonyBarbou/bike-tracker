'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: number;
  title: string;
  content: string;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  images?: string[];
  created_at: number;
}

export default function LiveFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-lg animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600 text-lg mb-2">📝 No updates yet</p>
        <p className="text-gray-500 text-sm">Check back soon for journey updates!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <article key={post.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h3>
              {post.location_name && (
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  📍 {post.location_name}
                </p>
              )}
            </div>
            <time className="text-sm text-gray-500" dateTime={typeof post.created_at === 'string' ? post.created_at : new Date(post.created_at * 1000).toISOString()}>
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </time>
          </div>
          
          <div className="prose prose-sm max-w-none text-gray-700 mb-4">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
              {post.images.map((image, idx) => (
                <img
                  key={idx}
                  src={image}
                  alt={`${post.title} - Image ${idx + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
            Posted on {new Date(post.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </article>
      ))}
    </div>
  );
}
