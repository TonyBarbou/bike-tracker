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

interface Post {
  id: number;
  title: string;
  content: string;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  images: string[];
  created_at: string;
}

export default function LiveMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const postMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

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

      // Fetch and display posts
      const postsRes = await fetch('/api/posts');
      if (postsRes.ok) {
        const posts = await postsRes.json();
        displayPosts(posts);
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  };

  const displayPosts = (posts: Post[]) => {
    if (!map.current) return;

    // Remove existing post markers
    postMarkersRef.current.forEach(marker => marker.remove());
    postMarkersRef.current = [];

    // Filter posts that have coordinates
    const postsWithCoordinates = posts.filter(
      post => post.latitude !== null && post.longitude !== null
    );

    const addPostMarkers = () => {
      if (!map.current) return;

      postsWithCoordinates.forEach(post => {
        if (post.latitude === null || post.longitude === null) return;

        const coordinates: [number, number] = [post.longitude, post.latitude];

        // Create custom marker element (pin icon for posts)
        const el = document.createElement('div');
        el.className = 'post-marker';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMzk4MmZmIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgMTBjMCA3LTkgMTMtOSAxM3MtOS02LTktMTNhOSA5IDAgMCAxIDE4IDB6Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIgZmlsbD0iI2ZmZmZmZiIvPjwvc3ZnPg==)';
        el.style.backgroundSize = 'contain';
        el.style.cursor = 'pointer';

        // Format the post content for the popup
        const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const imagesHtml = post.images && post.images.length > 0
          ? `<div style="margin-top: 8px; display: flex; flex-direction: column; gap: 8px;">
              ${post.images.map((img, idx) => 
                `<img src="${img}" alt="${post.title}" data-image-src="${img}" class="popup-image" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 4px; cursor: pointer; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'" />`
              ).join('')}
            </div>`
          : '';

        // Create marker with popup
        const popup = new mapboxgl.Popup({ offset: 25, maxWidth: '300px' })
          .setHTML(`
            <div style="padding: 12px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px; color: #1f2937;">${post.title}</h3>
              ${post.location_name ? `<p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280;"><strong>📍 ${post.location_name}</strong></p>` : ''}
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151; line-height: 1.5;">${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
              ${imagesHtml}
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">${formattedDate}</p>
            </div>
          `);

        // Add event listener for popup images
        popup.on('open', () => {
          const popupImages = document.querySelectorAll('.popup-image');
          popupImages.forEach(img => {
            img.addEventListener('click', (e) => {
              const target = e.target as HTMLImageElement;
              const imageSrc = target.getAttribute('data-image-src');
              if (imageSrc) {
                setLightboxImage(imageSrc);
              }
            });
          });
        });

        const marker = new mapboxgl.Marker(el)
          .setLngLat(coordinates)
          .setPopup(popup)
          .addTo(map.current!);

        postMarkersRef.current.push(marker);
      });
    };

    // If map is already loaded, add markers immediately
    if (map.current.loaded()) {
      addPostMarkers();
    } else {
      // Wait for map to load before adding markers
      map.current.once('load', addPostMarkers);
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
                Time: ${location.timestamp ? new Date(location.timestamp * 1000).toLocaleString() : 'N/A'}
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

    const addRouteToMap = () => {
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
    };

    // If map is already loaded, add route immediately
    if (map.current.loaded()) {
      addRouteToMap();
    } else {
      // Wait for map to load before adding source and layer
      map.current.once('load', addRouteToMap);
    }
  };

  return (
    <>
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
              Updated: {currentLocation.timestamp ? new Date(currentLocation.timestamp * 1000).toLocaleTimeString() : 'N/A'}
            </p>
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
