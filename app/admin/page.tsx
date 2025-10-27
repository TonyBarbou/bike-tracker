'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [locationName, setLocationName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple client-side check - password will be verified server-side
    if (password) {
      setIsAuthenticated(true);
    }
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`,
        },
        body: JSON.stringify({
          title,
          content,
          location_name: locationName || null,
          images: images.length > 0 ? images : null,
        }),
      });

      if (response.ok) {
        setMessage('✅ Post created successfully!');
        setTitle('');
        setContent('');
        setLocationName('');
        setImages([]);
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await response.json();
        setMessage(`❌ Error: ${error.error || 'Failed to create post'}`);
      }
    } catch (error) {
      setMessage('❌ Error: Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">🔐 Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter admin password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all"
            >
              Login
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-white/80 hover:text-white mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold">Admin Panel</h1>
          <p className="text-white/90 mt-2">Create journey updates</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Post Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="e.g., Day 5: Reached Paris!"
              required
            />
          </div>

          <div>
            <label htmlFor="locationName" className="block text-sm font-medium text-gray-700 mb-2">
              Location Name
            </label>
            <input
              type="text"
              id="locationName"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="e.g., Paris, France"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content * (Markdown supported)
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
              placeholder="Write your update here... You can use Markdown formatting:&#10;&#10;**Bold text**&#10;*Italic text*&#10;- Bullet points&#10;&#10;Tell your story!"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Tip: Use **bold**, *italic*, and - bullet points for formatting
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images (optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Add
              </button>
            </div>
            {images.length > 0 && (
              <div className="space-y-2 mt-3">
                {images.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <span className="flex-1 text-sm text-gray-600 truncate">{img}</span>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Post...' : 'Create Post'}
          </button>
        </form>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">💡 Tips for posting</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Images should be uploaded to an image hosting service (Imgur, Cloudinary, etc.)</li>
            <li>• Use Markdown for rich text formatting in your content</li>
            <li>• Posts appear immediately on the home page</li>
            <li>• Keep your admin password secure!</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
