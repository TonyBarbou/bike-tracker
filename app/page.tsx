'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';
import StatsPanel from '@/components/StatsPanel';
import DayTimeline from '@/components/DayTimeline';
import DonationSection from '@/components/DonationSection';
import JourneyTimelineSidebar from '@/components/JourneyTimelineSidebar';
import PostOverlay from '@/components/PostOverlay';

// Dynamically import map to avoid SSR issues
const LiveMap = dynamic(() => import('@/components/LiveMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-600">Loading map...</p>
    </div>
  ),
});

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

export default function Home() {
  const [dayData, setDayData] = useState<DayData[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  // Fetch and organize day data
  useEffect(() => {
    fetchDayData();
    fetchCurrentLocation();
    const interval = setInterval(() => {
      fetchDayData();
      fetchCurrentLocation();
    }, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentLocation = async () => {
    try {
      const res = await fetch('/api/location');
      if (res.ok) {
        const location = await res.json();
        setCurrentLocation(location);
      }
    } catch (error) {
      console.error('Error fetching current location:', error);
    }
  };

  const fetchDayData = async () => {
    try {
      const [stagesRes, postsRes] = await Promise.all([
        fetch('/api/stages'),
        fetch('/api/posts')
      ]);

      if (stagesRes.ok && postsRes.ok) {
        const stages: Stage[] = await stagesRes.json();
        const posts: Post[] = await postsRes.json();

        const today = new Date().toISOString().split('T')[0];
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
          }
        });

        // Sort posts within each day
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
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([_, data]) => data);

        setDayData(sortedDays);

        // Auto-select today's stage on initial load
        if (!selectedDay) {
          const todayData = sortedDays.find(d => d.isToday);
          if (todayData && todayData.stage) {
            setSelectedDay(todayData.stage.date);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching day data:', error);
    }
  };

  const handleSelectDay = (date: string, stage: Stage | null, posts: Post[]) => {
    setSelectedDay(date);
    setSelectedPost(null); // Clear post selection when selecting a day
  };

  const handleSelectPost = (post: Post) => {
    setSelectedPost(post);
    if (post.stage_date) {
      setSelectedDay(post.stage_date);
    }
  };

  const handleMapPostClick = (post: Post) => {
    setSelectedPost(post);
    if (post.stage_date) {
      setSelectedDay(post.stage_date);
    }
  };

  const handleClosePostOverlay = () => {
    setSelectedPost(null);
  };

  return (
    <>
      <div className="hidden md:block">
        <Navigation />
      </div>
      <main className="h-screen md:h-auto md:min-h-screen bg-white md:bg-gradient-to-b md:from-gray-50 md:to-gray-100">
      {/* Hero Section */}
      <section className="hidden md:block bg-gradient-to-r from-red-600 to-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">🚴‍♂️ En vélo vers le grand nord</h1>
          <p className="text-xl mb-2">Suivez-nous en direct en direction du grand nord</p>
          <p className="text-lg opacity-90"></p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto md:px-4 md:sm:px-6 md:lg:px-8 md:py-12 md:space-y-12">
        {/* Statistics Panel */}
        <section className="hidden md:block">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">📊 Statistiques</h2>
          <StatsPanel />
        </section>

        {/* Live Map with Timeline Sidebar */}
        <section className="relative">
          <h2 className="hidden md:block text-3xl font-bold text-gray-900 mb-6">🗺️ Position en direct</h2>
          <div className="flex flex-col md:flex-row md:gap-0 relative h-screen md:h-auto">
            {/* Map Container */}
            <div className="w-full md:w-[70%] relative h-[60vh] md:h-[600px]">
              <LiveMap 
                selectedDay={selectedDay}
                selectedPost={selectedPost}
                onPostClick={handleMapPostClick}
                dayData={dayData}
              />
            </div>
            
            {/* Timeline Sidebar - overlay on mobile, sidebar on desktop */}
            <div className="md:w-[30%] md:h-[600px] md:relative">
              <JourneyTimelineSidebar
                dayData={dayData}
                selectedDay={selectedDay}
                onSelectDay={handleSelectDay}
                onSelectPost={handleSelectPost}
                isExpanded={false}
                onToggleExpanded={() => {}}
                currentLocation={currentLocation}
              />
            </div>
          </div>
        </section>

        {/* Donation Section */}
        <section className="hidden md:block">
          <DonationSection />
        </section>

        {/* Journey Timeline */}
        <section className="hidden md:block">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">📅 Journey Timeline</h2>
          <DayTimeline />
        </section>
      </div>

      {/* Footer */}
      <footer className="hidden md:block bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-300">
            Following our cycling journey across Europe 🚴‍♂️
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Built with Next.js • Powered by Mapbox • Tracking with OwnTracks
          </p>
        </div>
      </footer>
    </main>

    {/* Post Overlay */}
    <PostOverlay post={selectedPost} onClose={handleClosePostOverlay} />
    </>
  );
}
