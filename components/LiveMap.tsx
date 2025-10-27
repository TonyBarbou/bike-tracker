'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
  altitude?: number;
  speed?: number;
}

export default function LiveMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [4.3517, 50.8503], // Brussels default
      zoom: 5,
      projection: 'globe' as any,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Fetch and display location data
    fetchLocationData();

    // Set up interval to refresh location every 30 seconds
    const interval = setInterval(fetchLocationData, 30000);

    return () => {
      clearInterval(interval);
      map.current?.remove();
    };
  }, []);

  const fetchLocationData = async () => {
    try {
      // Fetch current location
      const currentRes = await fetch('/api/location');
      if (currentRes.ok) {
        const location = await currentRes.json();
        setCurrentLocation(location);
        updateMarker(location);
      }

      // Fetch location history for route
      const historyRes = await fetch('/api/location/history');
      if (historyRes.ok) {
        const history = await historyRes.json();
        drawRoute(history);
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  };

  const updateMarker = (location: Location) => {
    if (!map.current) return;

    const coordinates: [number, number] = [location.longitude, location.latitude];

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Create custom marker element (bike icon)
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.width = '40px';
    el.style.height = '40px';
    el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNlZjQ0NDQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSI1LjUiIGN5PSIxNy41IiByPSIzLjUiLz48Y2lyY2xlIGN4PSIxOC41IiBjeT0iMTcuNSIgcj0iMy41Ii8+PHBhdGggZD0iTTE1IDZhMSAxIDAgMSAwIDAgMiAxIDEgMCAxIDAgMC0yeiIvPjxwYXRoIGQ9Ik0xMiAxN1Y3bC01IDVNMTIgN2w1IDUiLz48L3N2Zz4=)';
    el.style.backgroundSize = 'contain';
    el.style.cursor = 'pointer';

    // Add new marker
    markerRef.current = new mapboxgl.Marker(el)
      .setLngLat(coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold;">Current Location</h3>
              <p style="margin: 4px 0; font-size: 14px;">
                ${location.speed ? `Speed: ${Math.round(location.speed * 3.6)} km/h<br>` : ''}
                ${location.altitude ? `Altitude: ${Math.round(location.altitude)}m<br>` : ''}
                Time: ${new Date(location.timestamp * 1000).toLocaleString()}
              </p>
            </div>
          `)
      )
      .addTo(map.current);

    // Center map on current location
    map.current.flyTo({
      center: coordinates,
      zoom: 12,
      essential: true,
    });
  };

  const drawRoute = (locations: Location[]) => {
    if (!map.current || locations.length === 0) return;

    const coordinates = locations.map(loc => [loc.longitude, loc.latitude]);

    // Wait for map to load before adding source and layer
    map.current.on('load', () => {
      if (!map.current) return;

      // Remove existing route if any
      if (map.current.getSource('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }

      // Add route line
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates,
          },
        },
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#ef4444',
          'line-width': 4,
          'line-opacity': 0.8,
        },
      });
    });

    // If map is already loaded, add route immediately
    if (map.current.loaded()) {
      if (map.current.getSource('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }

      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates,
          },
        },
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#ef4444',
          'line-width': 4,
          'line-opacity': 0.8,
        },
      });
    }
  };

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-xl">
      <div ref={mapContainer} className="w-full h-full" />
      {currentLocation && (
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg">
          <h3 className="font-bold text-sm mb-2">Live Location</h3>
          <p className="text-xs text-gray-600">
            {currentLocation.speed && (
              <>Speed: {Math.round(currentLocation.speed * 3.6)} km/h<br /></>
            )}
            {currentLocation.altitude && (
              <>Altitude: {Math.round(currentLocation.altitude)}m<br /></>
            )}
            Updated: {new Date(currentLocation.timestamp * 1000).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
