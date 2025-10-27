'use client';

import { useEffect } from 'react';

interface Post {
  id: number;
  title: string;
  content: string;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  images?: string[];
  created_at: number;
  stage_date: string | null;
  time_of_day: string | null;
}

interface PostOverlayProps {
  post: Post | null;
  onClose: () => void;
}

export default function PostOverlay({ post, onClose }: PostOverlayProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && post) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [post, onClose]);

  if (!post) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Backdrop - semi-transparent overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-[60] ${
          post ? 'opacity-30' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-[70]
          transform transition-transform duration-300 ease-in-out
          ${post ? 'translate-x-0' : 'translate-x-full'}
          overflow-y-auto
        `}
      >
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex items-center justify-between shadow-md z-10">
          <h2 className="text-xl font-bold truncate pr-4">{post.title}</h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Metadata */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{formatDate(post.created_at)}</span>
              {post.time_of_day && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>{post.time_of_day}</span>
                </>
              )}
            </div>

            {post.location_name && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{post.location_name}</span>
              </div>
            )}

            {post.latitude && post.longitude && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>📍 {post.latitude.toFixed(5)}, {post.longitude.toFixed(5)}</span>
              </div>
            )}
          </div>

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="space-y-4">
              {post.images.map((image, idx) => (
                <div key={idx} className="rounded-lg overflow-hidden shadow-md">
                  <img
                    src={image}
                    alt={`${post.title} - Image ${idx + 1}`}
                    className="w-full h-auto"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-sm max-w-none">
            <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
