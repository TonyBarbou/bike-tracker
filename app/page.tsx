'use client';

import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';
import StatsPanel from '@/components/StatsPanel';
import DayTimeline from '@/components/DayTimeline';
import DonationSection from '@/components/DonationSection';

// Dynamically import map to avoid SSR issues
const LiveMap = dynamic(() => import('@/components/LiveMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-600">Loading map...</p>
    </div>
  ),
});

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">🚴‍♂️ Cycling Across Europe</h1>
          <p className="text-xl mb-2">Follow our journey as we bike across Europe for charity</p>
          <p className="text-lg opacity-90">Live tracking • Real-time updates • Every kilometer counts</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Statistics Panel */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">📊 Journey Statistics</h2>
          <StatsPanel />
        </section>

        {/* Live Map */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">🗺️ Live Location Tracker</h2>
          <LiveMap />
        </section>

        {/* Donation Section */}
        <section>
          <DonationSection />
        </section>

        {/* Journey Timeline */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">📅 Journey Timeline</h2>
          <DayTimeline />
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
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
    </>
  );
}
