'use client';

import { useEffect, useRef } from 'react';

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
  route_coordinates?: any[];
}

interface DayData {
  stage: Stage | null;
  posts: Post[];
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
  altitude?: number;
  speed?: number;
}

interface JourneyTimelineSidebarProps {
  dayData: DayData[];
  selectedDay: string | null;
  onSelectDay: (date: string, stage: Stage | null, posts: Post[]) => void;
  onSelectPost: (post: Post) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  currentLocation: Location | null;
}

export default function JourneyTimelineSidebar({
  dayData,
  selectedDay,
  onSelectDay,
  onSelectPost,
  isExpanded,
  onToggleExpanded,
  currentLocation,
}: JourneyTimelineSidebarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to show today at the top on mount
  useEffect(() => {
    if (todayRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const element = todayRef.current;
      
      // Scroll to show today at the top of the container
      container.scrollTo({
        top: element.offsetTop - 10, // Small offset from top
        behavior: 'smooth',
      });
    }
  }, [dayData]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return { day, month };
  };

  return (
    <>
      

      {/* Timeline Sidebar Container */}
      <div
        className={`
          bg-white shadow-xl
          md:h-[600px]
          md:relative md:overflow-hidden md:rounded-r-lg
          fixed bottom-0 left-0 right-0 z-20
          h-[40vh]
          md:h-[600px]
        `}
      >
        {/* Mobile Header */}
        <div className="md:hidden bg-gradient-to-r from-orange-500 to-red-500 text-white p-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold">📅 Journey Timeline</span>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
          <h3 className="text-lg font-bold">📅 Journey Timeline</h3>
          <p className="text-xs opacity-90 mt-1">Click to navigate</p>
        </div>

        {/* Scrollable Timeline */}
        <div
          ref={scrollContainerRef}
          className="overflow-y-auto h-[calc(100%-52px)] md:h-[calc(100%-80px)] px-4 py-2"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#e5e7eb #ffffff',
          }}
        >
          {dayData.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <p>📝 No journey data yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {dayData.map((day, idx) => {
                if (!day.stage) return null;

                const dateInfo = formatDate(day.stage.date);
                const isSelected = selectedDay === day.stage.date;

                return (
                  <div
                    key={idx}
                    ref={day.isToday ? todayRef : null}
                    onClick={() => onSelectDay(day.stage!.date, day.stage, day.posts)}
                    className={`
                      relative cursor-pointer rounded-lg p-3 transition-all
                      ${isSelected ? 'bg-orange-100 border-l-4 border-orange-500 shadow-md' : 'hover:bg-gray-50'}
                      ${day.isToday ? 'ring-2 ring-orange-400' : ''}
                      ${day.isPast ? 'opacity-70' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {/* Date Circle */}
                      <div
                        className={`
                          flex-shrink-0 w-12 h-12 rounded-full flex flex-col items-center justify-center text-xs font-bold
                          ${day.isPast ? 'bg-gray-300 text-gray-700' : ''}
                          ${day.isToday ? 'bg-orange-500 text-white' : ''}
                          ${day.isFuture ? 'bg-blue-100 text-blue-700' : ''}
                        `}
                      >
                        <span className="text-lg leading-none">{dateInfo.day}</span>
                        <span className="text-[10px] opacity-80">{dateInfo.month}</span>
                      </div>

                      {/* Day Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm text-gray-900 truncate">
                            {day.stage.day_number && `Day ${day.stage.day_number}: `}
                            {day.stage.name}
                          </h4>
                          {day.isToday && (
                            <span className="flex-shrink-0 px-2 py-0.5 bg-orange-500 text-white text-[10px] rounded-full">
                              NOW
                            </span>
                          )}
                        </div>

                        {/* Stats - desktop only */}
                        <div className="hidden md:flex items-center gap-3 text-[11px] text-gray-600 mb-1">
                          <span>📏 {day.stage.planned_distance_km}km</span>
                          <span>⛰️ {day.stage.planned_elevation_gain_m}m</span>
                        </div>

                        {/* Posts with previews - desktop only */}
                        {day.posts.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {day.posts.map((post, postIdx) => (
                              <button
                                key={postIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectPost(post);
                                }}
                                className="w-full text-left p-2 rounded bg-blue-50 hover:bg-blue-100 transition-colors group"
                                title={post.title}
                              >
                                <div className="flex items-start gap-2">
                                  {post.images && post.images.length > 0 ? (
                                    <img
                                      src={post.images[0]}
                                      alt={post.title}
                                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded bg-blue-200 flex items-center justify-center flex-shrink-0">
                                      <span className="text-sm">📝</span>
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-semibold text-gray-900 truncate group-hover:text-blue-700">
                                      {post.title}
                                    </p>
                                    <p className="text-[10px] text-gray-600 line-clamp-2">
                                      {post.content}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Mobile: Simple post count */}
                        <div className="md:hidden mt-2">
                          {day.posts.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-gray-500">
                                {day.posts.length} post{day.posts.length > 1 ? 's' : ''}
                              </span>
                              <div className="flex gap-1 flex-wrap">
                                {day.posts.map((post, postIdx) => (
                                  <button
                                    key={postIdx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectPost(post);
                                    }}
                                    className="w-2 h-2 rounded-full bg-blue-500 cursor-pointer hover:scale-125 transition-transform"
                                    title={post.title}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Connector line - not for last item */}
                    {idx < dayData.filter(d => d.stage).length - 1 && (
                      <div className="absolute left-[30px] top-[60px] w-0.5 h-4 bg-gray-200"></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
