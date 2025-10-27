'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stage {
  id: number;
  date: string;
  day_number: number | null;
  name: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  location_name: string | null;
  images: string[];
  stage_date: string | null;
  time_of_day: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [locationName, setLocationName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedStageId, setSelectedStageId] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple client-side check - password will be verified server-side
    if (password) {
      setIsAuthenticated(true);
      fetchStages();
      fetchPosts();
    }
  };

  const fetchStages = async () => {
    try {
      const res = await fetch('/api/stages');
      if (res.ok) {
        const data = await res.json();
        setStages(data);
      }
    } catch (error) {
      console.error('Error fetching stages:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
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

  const handleEdit = (post: Post) => {
    // Populate form with post data
    setEditingPostId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setLocationName(post.location_name || '');
    setImages(post.images || []);
    
    // If no specific time_of_day was set, use the creation time
    if (post.time_of_day) {
      setTimeOfDay(post.time_of_day);
    } else {
      // Extract time from created_at timestamp
      const createdDate = new Date(post.created_at);
      const hours = createdDate.getHours().toString().padStart(2, '0');
      const minutes = createdDate.getMinutes().toString().padStart(2, '0');
      setTimeOfDay(`${hours}:${minutes}`);
    }
    
    // Find the stage ID if post has a stage_date
    if (post.stage_date) {
      const stage = stages.find(s => s.date === post.stage_date);
      setSelectedStageId(stage ? stage.id.toString() : '');
    } else {
      setSelectedStageId('');
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setTitle('');
    setContent('');
    setLocationName('');
    setImages([]);
    setSelectedStageId('');
    setTimeOfDay('');
    setMessage('');
  };

  const handleDelete = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });

      if (response.ok) {
        setMessage('✅ Post deleted successfully!');
        fetchPosts();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await response.json();
        setMessage(`❌ Error: ${error.error || 'Failed to delete post'}`);
      }
    } catch (error) {
      setMessage('❌ Error: Failed to connect to server');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Find the selected stage's date
      const selectedStage = stages.find(s => s.id.toString() === selectedStageId);
      
      const postData = {
        title,
        content,
        location_name: locationName || null,
        images: images.length > 0 ? images : null,
        stage_date: selectedStage?.date || null,
        time_of_day: timeOfDay || null,
      };

      let response;
      
      if (editingPostId) {
        // Update existing post
        response = await fetch(`/api/posts/${editingPostId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${password}`,
          },
          body: JSON.stringify(postData),
        });
      } else {
        // Create new post
        response = await fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${password}`,
          },
          body: JSON.stringify(postData),
        });
      }

      if (response.ok) {
        setMessage(editingPostId ? '✅ Post updated successfully!' : '✅ Post created successfully!');
        setTitle('');
        setContent('');
        setLocationName('');
        setImages([]);
        setSelectedStageId('');
        setTimeOfDay('');
        setEditingPostId(null);
        fetchPosts();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await response.json();
        setMessage(`❌ Error: ${error.error || 'Failed to save post'}`);
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
          <p className="text-white/90 mt-2">Create and manage journey updates</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingPostId ? '✏️ Edit Post' : '➕ Create New Post'}
            </h2>
            {editingPostId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel Edit
              </button>
            )}
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="stageSelect" className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Stage (optional)
              </label>
              <select
                id="stageSelect"
                value={selectedStageId}
                onChange={(e) => setSelectedStageId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">-- No stage --</option>
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.day_number ? `Day ${stage.day_number}: ` : ''}{stage.name} ({new Date(stage.date).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {stages.length === 0 ? (
                  <>No stages yet. <Link href="/admin/stages" className="text-blue-600 hover:underline">Create one first</Link></>
                ) : (
                  'Link this post to a specific stage/day'
                )}
              </p>
            </div>

            <div>
              <label htmlFor="timeOfDay" className="block text-sm font-medium text-gray-700 mb-2">
                Time of Day (optional)
              </label>
              <input
                type="time"
                id="timeOfDay"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Time shown prominently on timeline</p>
            </div>
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
            {loading ? (editingPostId ? 'Updating Post...' : 'Creating Post...') : (editingPostId ? 'Update Post' : 'Create Post')}
          </button>
        </form>

        {/* Existing Posts List */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📝 Existing Posts ({posts.length})</h2>
          
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No posts yet. Create your first post above!
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                // Get display time - use time_of_day if set, otherwise extract from created_at
                const displayTime = post.time_of_day || (() => {
                  const createdDate = new Date(post.created_at);
                  const hours = createdDate.getHours().toString().padStart(2, '0');
                  const minutes = createdDate.getMinutes().toString().padStart(2, '0');
                  return `${hours}:${minutes}`;
                })();
                
                return (
                  <div key={post.id} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-start gap-6">
                      {/* Time indicator on the left */}
                      <div className="flex-shrink-0 text-center">
                        <div className="text-3xl font-bold text-red-600">{displayTime}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      
                      {/* Vertical divider */}
                      <div className="w-px bg-gray-200 self-stretch"></div>
                      
                      {/* Post content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                        {post.location_name && (
                          <p className="text-sm text-gray-600 mb-2">📍 {post.location_name}</p>
                        )}
                        <p className="text-sm text-gray-500 mb-3">
                          Created: {new Date(post.created_at).toLocaleString()}
                          {post.updated_at !== post.created_at && (
                            <> • Updated: {new Date(post.updated_at).toLocaleString()}</>
                          )}
                        </p>
                        <p className="text-gray-700 line-clamp-3">{post.content.substring(0, 200)}...</p>
                        {post.images && post.images.length > 0 && (
                          <p className="text-sm text-gray-500 mt-2">🖼️ {post.images.length} image(s)</p>
                        )}
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(post)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium whitespace-nowrap"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium whitespace-nowrap"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">💡 Tips for posting</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Images should be uploaded to an image hosting service (Imgur, Cloudinary, etc.)</li>
            <li>• Use Markdown for rich text formatting in your content</li>
            <li>• Posts appear immediately on the home page</li>
            <li>• You can edit or delete posts anytime from the list below</li>
            <li>• Keep your admin password secure!</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
