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
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

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
    <>
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
                    className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setLightboxImage(image)}
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

      {/* Image Lightbox Overlay */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={lightboxImage}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
