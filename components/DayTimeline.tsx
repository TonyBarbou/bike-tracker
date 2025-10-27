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
  stage_date: string | null;
  time_of_day: string | null;
}

interface Stage {
  id: number;
  date: string;
  day_number: number | null;
  name: string;
  planned_distance_km: number;
  planned_elevation_gain_m: number;
  start_location: string | null;
  end_location: string | null;
  notes: string | null;
}

interface DayData {
  stage: Stage | null;
  posts: Post[];
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export default function DayTimeline() {
  const [dayData, setDayData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [stagesRes, postsRes] = await Promise.all([
        fetch('/api/stages'),
        fetch('/api/posts')
      ]);

      if (stagesRes.ok && postsRes.ok) {
        const stages: Stage[] = await stagesRes.json();
        const posts: Post[] = await postsRes.json();

        // Group posts by stage date
        const today = new Date().toISOString().split('T')[0];
        
        // Create a map of dates to day data
        const daysMap = new Map<string, DayData>();

        // Add all stages
        stages.forEach(stage => {
          daysMap.set(stage.date, {
            stage,
            posts: [],
            isToday: stage.date === today,
            isPast: stage.date < today,
            isFuture: stage.date > today,
          });
        });

        // Add posts to their respective days
        posts.forEach(post => {
          if (post.stage_date) {
            const dayData = daysMap.get(post.stage_date);
            if (dayData) {
              dayData.posts.push(post);
            }
          } else {
            // Posts without stage_date go to a "no stage" entry
            if (!daysMap.has('no-stage')) {
              daysMap.set('no-stage', {
                stage: null,
                posts: [],
                isToday: false,
                isPast: false,
                isFuture: false,
              });
            }
            daysMap.get('no-stage')!.posts.push(post);
          }
        });

        // Sort posts within each day by time (most recent first)
        daysMap.forEach(dayData => {
          dayData.posts.sort((a, b) => {
            if (a.time_of_day && b.time_of_day) {
              return b.time_of_day.localeCompare(a.time_of_day);
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
        });

        // Convert to array and sort chronologically (oldest to newest)
        const sortedDays = Array.from(daysMap.entries())
          .sort((a, b) => {
            // Always put 'no-stage' at the end
            if (a[0] === 'no-stage') return 1;
            if (b[0] === 'no-stage') return -1;
            
            // Sort chronologically by date
            return a[0].localeCompare(b[0]);
          })
          .map(([_, data]) => data);

        setDayData(sortedDays);
      }
    } catch (error) {
      console.error('Error fetching timeline data:', error);
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

  return (
    <>
      <div className="space-y-6">
        {dayData.map((day, idx) => {
          return (
            <div key={idx} className={day.isPast ? 'opacity-60' : ''}>
              <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                day.isToday ? 'ring-4 ring-orange-400' : ''
              }`}>
            {/* Stage Header */}
            {day.stage && (
              <div className={`p-6 ${
                day.isPast ? 'bg-gray-50 border-l-4 border-gray-400' :
                day.isToday ? 'bg-orange-50 border-l-4 border-orange-500' :
                'bg-blue-50 border-l-4 border-blue-500'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {day.stage.day_number && `Day ${day.stage.day_number}: `}{day.stage.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      📅 {new Date(day.stage.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      {day.isToday && <span className="ml-2 px-2 py-1 bg-orange-500 text-white text-xs rounded-full">TODAY</span>}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/50 p-3 rounded">
                    <span className="text-gray-600 block">📏 Distance</span>
                    <span className="font-bold text-lg">{day.stage.planned_distance_km} km</span>
                  </div>
                  <div className="bg-white/50 p-3 rounded">
                    <span className="text-gray-600 block">⛰️ Elevation</span>
                    <span className="font-bold text-lg">{day.stage.planned_elevation_gain_m} m</span>
                  </div>
                </div>

                {day.stage.notes && (
                  <p className="mt-3 text-sm text-gray-600 italic">{day.stage.notes}</p>
                )}
              </div>
            )}

            {/* Posts for this day */}
            {day.posts.length > 0 && (
              <div className="p-6 space-y-6">
                {day.posts.map(post => {
                  // Get display time - use time_of_day if set, otherwise extract from created_at
                  const displayTime = (() => {
                    if (post.time_of_day) {
                      // Strip seconds if present (e.g., "14:30:00" -> "14:30")
                      return post.time_of_day.substring(0, 5);
                    }
                    const createdDate = new Date(post.created_at);
                    const hours = createdDate.getHours().toString().padStart(2, '0');
                    const minutes = createdDate.getMinutes().toString().padStart(2, '0');
                    return `${hours}:${minutes}`;
                  })();

                  return (
                    <article key={post.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
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
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h3>
                              {post.location_name && (
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  📍 {post.location_name}
                                </p>
                              )}
                            </div>
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
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {!day.stage && day.posts.length > 0 && (
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-700 mb-4">📝 Other Updates</h3>
                <div className="space-y-6">
                  {day.posts.map(post => (
                    <article key={post.id}>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h4>
                      {post.location_name && (
                        <p className="text-sm text-gray-600 mb-2">📍 {post.location_name}</p>
                      )}
                      <div className="prose prose-sm max-w-none text-gray-700 mb-3">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                      </div>
                      {post.images && post.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
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
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            )}
              </div>
            </div>
          );
        })}

        {dayData.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 text-lg mb-2">📝 No journey updates yet</p>
            <p className="text-gray-500 text-sm">Check back soon for updates!</p>
          </div>
        )}
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
