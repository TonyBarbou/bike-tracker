'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totalDistance: number;
  totalElevationGain: number;
  daysOnRoad: number;
  averageSpeed: number;
  currentSpeed: number;
  countries: string[];
}

export default function StatsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800">No tracking data available yet. Start tracking to see statistics!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Total Distance"
        value={`${stats.totalDistance.toFixed(1)} km`}
        icon="🚴"
      />
      <StatCard
        label="Days on Road"
        value={stats.daysOnRoad.toString()}
        icon="📅"
      />
      <StatCard
        label="Elevation Gain"
        value={`${stats.totalElevationGain.toLocaleString()} m`}
        icon="⛰️"
      />
      <StatCard
        label="Avg Speed"
        value={`${stats.averageSpeed.toFixed(1)} km/h`}
        icon="⚡"
      />
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600 font-medium">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
