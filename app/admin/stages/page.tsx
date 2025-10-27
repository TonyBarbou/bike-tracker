'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { parseGPX, isValidGPX } from '@/lib/gpx-parser';

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
  status: string;
}

export default function StagesAdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Form state
  const [date, setDate] = useState('');
  const [dayNumber, setDayNumber] = useState('');
  const [name, setName] = useState('');
  const [distance, setDistance] = useState('');
  const [elevation, setElevation] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [gpxFile, setGpxFile] = useState<File | null>(null);
  const [gpxParsing, setGpxParsing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStages();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      setIsAuthenticated(true);
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

  const handleGPXUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGpxParsing(true);
    setMessage('');

    try {
      const text = await file.text();
      
      if (!isValidGPX(text)) {
        setMessage('❌ Invalid GPX file format');
        setGpxParsing(false);
        return;
      }

      const parsed = parseGPX(text);
      
      // Auto-fill form with parsed data
      setDistance(parsed.totalDistance.toFixed(2));
      setElevation(Math.round(parsed.totalElevationGain).toString());
      
      if (parsed.name && !name) {
        setName(parsed.name);
      }
      
      if (parsed.routeCoordinates.length > 0) {
        const start = parsed.routeCoordinates[0];
        const end = parsed.routeCoordinates[parsed.routeCoordinates.length - 1];
        
        if (!startLocation) {
          setStartLocation(`${start.lat.toFixed(4)}, ${start.lon.toFixed(4)}`);
        }
        if (!endLocation) {
          setEndLocation(`${end.lat.toFixed(4)}, ${end.lon.toFixed(4)}`);
        }
      }

      setGpxFile(file);
      setMessage('✅ GPX file parsed successfully!');
    } catch (error) {
      console.error('Error parsing GPX:', error);
      setMessage('❌ Error parsing GPX file');
    } finally {
      setGpxParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let gpxData = null;
      let routeCoordinates = null;
      let waypoints = null;

      if (gpxFile) {
        const text = await gpxFile.text();
        const parsed = parseGPX(text);
        gpxData = text;
        routeCoordinates = parsed.routeCoordinates;
        waypoints = parsed.waypoints;
      }

      const response = await fetch('/api/stages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`,
        },
        body: JSON.stringify({
          date,
          day_number: dayNumber ? parseInt(dayNumber) : null,
          name,
          planned_distance_km: parseFloat(distance),
          planned_elevation_gain_m: parseFloat(elevation),
          gpx_data: gpxData,
          route_coordinates: routeCoordinates,
          waypoints: waypoints,
          start_location: startLocation || null,
          end_location: endLocation || null,
          notes: notes || null,
          status: 'pending',
        }),
      });

      if (response.ok) {
        setMessage('✅ Stage created successfully!');
        // Reset form
        setDate('');
        setDayNumber('');
        setName('');
        setDistance('');
        setElevation('');
        setStartLocation('');
        setEndLocation('');
        setNotes('');
        setGpxFile(null);
        // Refresh stages list
        fetchStages();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await response.json();
        setMessage(`❌ Error: ${error.error || 'Failed to create stage'}`);
      }
    } catch (error) {
      setMessage('❌ Error: Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this stage?')) return;

    try {
      const response = await fetch(`/api/stages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });

      if (response.ok) {
        setMessage('✅ Stage deleted successfully!');
        fetchStages();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Failed to delete stage');
      }
    } catch (error) {
      setMessage('❌ Error deleting stage');
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">🗺️ Stages Admin</h1>
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
          <div className="mt-6 text-center space-y-2">
            <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900 block">
              Posts Admin
            </Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 block">
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <Link href="/" className="text-white/80 hover:text-white">
              ← Back to Home
            </Link>
            <Link href="/admin" className="text-white/80 hover:text-white">
              Posts Admin →
            </Link>
          </div>
          <h1 className="text-4xl font-bold">Stages Management</h1>
          <p className="text-white/90 mt-2">Plan your journey with GPX routes</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Add Stage Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Stage</h2>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="dayNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Day Number (optional)
                </label>
                <input
                  type="number"
                  id="dayNumber"
                  value={dayNumber}
                  onChange={(e) => setDayNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., 5"
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Stage Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Brussels to Paris"
                  required
                />
              </div>

              <div>
                <label htmlFor="gpx" className="block text-sm font-medium text-gray-700 mb-2">
                  GPX File (optional)
                </label>
                <input
                  type="file"
                  id="gpx"
                  accept=".gpx"
                  onChange={handleGPXUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={gpxParsing}
                />
                {gpxParsing && <p className="text-sm text-gray-500 mt-1">Parsing GPX file...</p>}
                {gpxFile && <p className="text-sm text-green-600 mt-1">✓ {gpxFile.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-2">
                    Distance (km) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="distance"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="85.5"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="elevation" className="block text-sm font-medium text-gray-700 mb-2">
                    Elevation (m) *
                  </label>
                  <input
                    type="number"
                    id="elevation"
                    value={elevation}
                    onChange={(e) => setElevation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="420"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="startLocation" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Location
                </label>
                <input
                  type="text"
                  id="startLocation"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Brussels, Belgium"
                />
              </div>

              <div>
                <label htmlFor="endLocation" className="block text-sm font-medium text-gray-700 mb-2">
                  End Location
                </label>
                <input
                  type="text"
                  id="endLocation"
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Paris, France"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Any additional notes..."
                />
              </div>

              <button
                type="submit"
                disabled={loading || gpxParsing}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Stage...' : 'Create Stage'}
              </button>
            </form>
          </div>

          {/* Stages List */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Existing Stages ({stages.length})</h2>
            <div className="space-y-4 max-h-[800px] overflow-y-auto">
              {stages.map((stage) => (
                <div key={stage.id} className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-blue-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{stage.name}</h3>
                      <p className="text-sm text-gray-600">
                        📅 {new Date(stage.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                        {stage.day_number && ` • Day ${stage.day_number}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(stage.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                    <div>
                      <span className="text-gray-600">Distance:</span>
                      <span className="font-semibold ml-1">{stage.planned_distance_km} km</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Elevation:</span>
                      <span className="font-semibold ml-1">{stage.planned_elevation_gain_m} m</span>
                    </div>
                  </div>
                  {(stage.start_location || stage.end_location) && (
                    <p className="text-xs text-gray-500 mt-2">
                      {stage.start_location} → {stage.end_location}
                    </p>
                  )}
                  {stage.notes && (
                    <p className="text-xs text-gray-600 mt-2 italic">{stage.notes}</p>
                  )}
                </div>
              ))}
              {stages.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-gray-600">No stages yet. Create your first one!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
