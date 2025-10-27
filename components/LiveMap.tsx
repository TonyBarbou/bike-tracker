'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { map as mapColors, text as textColors, overlay as overlayColors } from '@/lib/colors';

interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
  altitude?: number;
  speed?: number;
  battery?: number;
  accuracy?: number;
}

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

interface LiveMapProps {
  selectedDay?: string | null;
  selectedPost?: Post | null;
  onPostClick?: (post: Post) => void;
  dayData?: DayData[];
}

export default function LiveMap({ 
  selectedDay = null, 
  selectedPost = null, 
  onPostClick,
  dayData = []
}: LiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const postMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/tonybarbou/cmh8v4u0k00dh01qte4hn43bj',
      center: [4.3517, 50.8503], // Brussels default
      zoom: 5,
      projection: 'globe' as any,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Wait for map to be fully loaded before fetching data
    map.current.on('load', () => {
      console.log('🗺️ Map fully loaded, fetching location data...');
      
      // Fetch and display location data only after map is ready
      fetchLocationData();

      // Set up interval to refresh location every 30 seconds
      const interval = setInterval(fetchLocationData, 30000);
      
      // Store interval ID for cleanup
      (map.current as any)._refreshInterval = interval;
    });

    return () => {
      if (map.current && (map.current as any)._refreshInterval) {
        clearInterval((map.current as any)._refreshInterval);
      }
      map.current?.remove();
    };
  }, []);

  // Handle selected day changes - fit map to show full stage route
  useEffect(() => {
    if (!map.current || !selectedDay || dayData.length === 0) return;

    const selectedDayData = dayData.find(d => d.stage?.date === selectedDay);
    if (!selectedDayData) return;

    // If stage has route coordinates, fit bounds to show entire route
    if (selectedDayData.stage?.route_coordinates && selectedDayData.stage.route_coordinates.length > 0) {
      const coords = selectedDayData.stage.route_coordinates;
      
      // Calculate bounds of the route
      const bounds = new mapboxgl.LngLatBounds();
      
      // Add all route coordinates
      coords.forEach((c: any) => {
        bounds.extend([c.lon, c.lat]);
      });
      
      // If viewing today's route and we have a current location, include it in bounds
      const today = new Date().toISOString().split('T')[0];
      if (selectedDayData.stage.date === today && currentLocation) {
        bounds.extend([currentLocation.longitude, currentLocation.latitude]);
      }
      
      // Fit map to show entire route with generous padding to ensure both start and end are visible
      map.current.fitBounds(bounds, {
        padding: { top: 80, bottom: 80, left: 80, right: 80 },
        maxZoom: 14, // Allow closer zoom for shorter routes, but not too close
        duration: 1000,
        essential: true,
      });
      return;
    }

    // Fallback: if there are posts for this day, center on the first post
    if (selectedDayData.posts.length > 0) {
      const firstPost = selectedDayData.posts[0];
      if (firstPost.latitude != null && firstPost.longitude != null) {
        map.current.flyTo({
          center: [firstPost.longitude, firstPost.latitude],
          zoom: 12,
          essential: true,
          duration: 1000,
        });
      }
    }
  }, [selectedDay, dayData, currentLocation]);

  // Handle selected post changes - center map on the specific post
  useEffect(() => {
    if (!map.current || !selectedPost) return;

    if (selectedPost.latitude != null && selectedPost.longitude != null) {
      map.current.flyTo({
        center: [selectedPost.longitude, selectedPost.latitude],
        zoom: 13,
        essential: true,
      });

      // Find and open the popup for this post
      const existingMarker = postMarkersRef.current.find((marker: any) => {
        const lngLat = marker.getLngLat();
        return lngLat.lng === selectedPost.longitude && lngLat.lat === selectedPost.latitude;
      });

      if (existingMarker) {
        existingMarker.togglePopup();
      }
    }
  }, [selectedPost]);

  const fetchLocationData = async () => {
    try {
      // Fetch current location
      let location: Location | null = null;
      const currentRes = await fetch('/api/location');
      if (currentRes.ok) {
        location = await currentRes.json();
        setCurrentLocation(location);
      }

      // Fetch and display planned routes first to get stages data
      const stagesRes = await fetch('/api/stages');
      let fetchedStages: Stage[] = [];
      if (stagesRes.ok) {
        fetchedStages = await stagesRes.json();
        setStages(fetchedStages);
        drawPlannedRoutes(fetchedStages);
      }

      // Fetch location history for route
      const historyRes = await fetch('/api/location/history');
      if (historyRes.ok) {
        const history = await historyRes.json();
        // Filter to only show today's locations
        const todayLocations = filterTodayLocations(history);
        drawRoute(todayLocations);
        // Update marker and fit bounds to show full day trace
        if (location) {
          updateMarkerWithDayTrace(location, todayLocations, fetchedStages);
        }
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

  // Filter locations to only include today's data (from midnight to now)
  const filterTodayLocations = (locations: Location[]): Location[] => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStartTimestamp = Math.floor(todayStart.getTime() / 1000);
    
    return locations.filter(loc => loc.timestamp >= todayStartTimestamp);
  };

  const drawPlannedRoutes = (stages: Stage[]) => {
    if (!map.current || stages.length === 0) return;

    const today = new Date().toISOString().split('T')[0];

    const addPlannedRoutesToMap = () => {
      if (!map.current) return;

      // Remove ALL existing planned route layers and sources
      const existingLayers = map.current.getStyle()?.layers || [];
      const existingSources = Object.keys(map.current.getStyle()?.sources || {});

      // Remove all stage-related layers
      existingLayers.forEach((layer: any) => {
        if (layer.id.startsWith('planned-route-') || layer.id.startsWith('stage-route-')) {
          try {
            map.current!.removeLayer(layer.id);
          } catch (e) {
            console.warn(`Could not remove layer ${layer.id}:`, e);
          }
        }
      });

      // Remove all stage-related sources
      existingSources.forEach((sourceId: string) => {
        if (sourceId.startsWith('planned-') || sourceId.startsWith('stage-')) {
          try {
            map.current!.removeSource(sourceId);
          } catch (e) {
            console.warn(`Could not remove source ${sourceId}:`, e);
          }
        }
      });

      // Helper function to validate route coordinates
      const hasValidRouteCoordinates = (stage: Stage): boolean => {
        if (!stage.route_coordinates) {
          console.warn(`Stage "${stage.name}" (${stage.date}) has no route_coordinates`);
          return false;
        }
        
        if (!Array.isArray(stage.route_coordinates)) {
          console.warn(`Stage "${stage.name}" (${stage.date}) route_coordinates is not an array:`, typeof stage.route_coordinates);
          return false;
        }
        
        if (stage.route_coordinates.length === 0) {
          console.warn(`Stage "${stage.name}" (${stage.date}) has empty route_coordinates array`);
          return false;
        }

        if (stage.route_coordinates.length < 2) {
          console.warn(`Stage "${stage.name}" (${stage.date}) has less than 2 coordinates (${stage.route_coordinates.length})`);
          return false;
        }

        // Validate that coordinates have required properties
        const firstCoord = stage.route_coordinates[0];
        if (!firstCoord || typeof firstCoord.lon !== 'number' || typeof firstCoord.lat !== 'number') {
          console.warn(`Stage "${stage.name}" (${stage.date}) has invalid coordinate format:`, firstCoord);
          return false;
        }

        // Validate all coordinates are valid numbers
        const allValid = stage.route_coordinates.every((coord: any) => {
          return coord && 
                 typeof coord.lon === 'number' && 
                 typeof coord.lat === 'number' &&
                 !isNaN(coord.lon) && 
                 !isNaN(coord.lat) &&
                 coord.lon >= -180 && coord.lon <= 180 &&
                 coord.lat >= -90 && coord.lat <= 90;
        });

        if (!allValid) {
          console.warn(`Stage "${stage.name}" (${stage.date}) has some invalid coordinates`);
          return false;
        }

        return true;
      };

      // Helper function to add a single stage route
      const addStageRoute = (stage: Stage, category: 'completed' | 'today' | 'future', index: number) => {
        if (!map.current) return false;

        try {
          // Create unique IDs for this stage
          const sourceId = `stage-${category}-${stage.id}-${index}`;
          const layerId = `stage-route-${category}-${stage.id}-${index}`;

          // Convert coordinates to Mapbox format
          const coordinates = stage.route_coordinates!.map((coord: any) => [coord.lon, coord.lat]);

          // Add source for this stage
          map.current.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {
                name: stage.name,
                date: stage.date,
                category: category,
              },
              geometry: {
                type: 'LineString',
                coordinates: coordinates,
              },
            },
          });

          // Determine style based on category
          let lineColor: string = mapColors.routePlanned;
          let lineWidth = 3;
          let lineOpacity = 0.6;
          let lineDasharray: number[] | undefined = undefined;

          if (category === 'today') {
            lineColor = mapColors.routeCompleted;
            lineWidth = 4;
            lineOpacity = 0.8;
          } else if (category === 'future') {
            lineColor = mapColors.routeGpx;
            lineWidth = 3;
            lineOpacity = 0.7;
            lineDasharray = [2, 2];
          }

          // Add layer for this stage
          map.current.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': lineColor,
              'line-width': lineWidth,
              'line-opacity': lineOpacity,
              ...(lineDasharray && { 'line-dasharray': lineDasharray }),
            },
          });

          console.log(`✅ Added ${category} stage route: "${stage.name}" (${stage.date}) with ${coordinates.length} points`);
          return true;
        } catch (error) {
          console.error(`❌ Error adding ${category} stage "${stage.name}" (${stage.date}):`, error);
          return false;
        }
      };

      // Categorize and add stages individually
      let completedCount = 0;
      let todayCount = 0;
      let futureCount = 0;
      let failedCount = 0;

      stages.forEach((stage, index) => {
        if (!hasValidRouteCoordinates(stage)) {
          failedCount++;
          return;
        }

        let category: 'completed' | 'today' | 'future';
        if (stage.date < today) {
          category = 'completed';
        } else if (stage.date === today) {
          category = 'today';
        } else {
          category = 'future';
        }

        const success = addStageRoute(stage, category, index);
        
        if (success) {
          if (category === 'completed') completedCount++;
          else if (category === 'today') todayCount++;
          else if (category === 'future') futureCount++;
        } else {
          failedCount++;
        }
      });

      console.log(`📊 Stage routes summary - Completed: ${completedCount}, Today: ${todayCount}, Future: ${futureCount}, Failed: ${failedCount}, Total: ${stages.length}`);
    };

    // Ensure map AND style are fully loaded before adding routes
    // This is critical for reliability - layers can only be added when style is ready
    if (!map.current.isStyleLoaded()) {
      console.log('⏳ Waiting for map style to load before adding stage routes...');
      map.current.once('styledata', () => {
        console.log('✅ Map style loaded, adding stage routes now');
        addPlannedRoutesToMap();
      });
    } else {
      // Style is already loaded, add routes immediately
      addPlannedRoutesToMap();
    }
  };

  const displayPosts = (posts: Post[]) => {
    if (!map.current) return;

    // Remove existing post markers
    postMarkersRef.current.forEach(marker => marker.remove());
    postMarkersRef.current = [];

    // Filter posts that have coordinates
    const postsWithCoordinates = posts.filter(
      post => post.latitude != null && post.longitude != null
    );

    const addPostMarkers = () => {
      if (!map.current) return;

      postsWithCoordinates.forEach(post => {
        if (post.latitude == null || post.longitude == null) return;

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
              <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px; color: ${mapColors.popup.heading};">${post.title}</h3>
              ${post.location_name ? `<p style="margin: 0 0 8px 0; font-size: 12px; color: ${mapColors.popup.muted};"><strong>📍 ${post.location_name}</strong></p>` : ''}
              <p style="margin: 0 0 8px 0; font-size: 14px; color: ${mapColors.popup.text}; line-height: 1.5;">${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
              ${imagesHtml}
              <p style="margin: 8px 0 0 0; font-size: 12px; color: ${mapColors.popup.meta};">${formattedDate}</p>
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

        // Add click handler to notify parent component
        el.addEventListener('click', () => {
          if (onPostClick) {
            onPostClick(post);
          }
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

  const updateMarkerWithDayTrace = (location: Location, todayLocations: Location[], stagesData: Stage[]) => {
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
    el.style.backgroundImage = 'url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPg0KPHN2ZyB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTIgM0MxMS40NDc3IDMgMTEgMy40NDc3MiAxMSA0QzExIDQuNTUyMjggMTEuNDQ3NyA1IDEyIDVIMTMuNTU4NUMxMy45ODg5IDUgMTQuMzcxMSA1LjI3NTQzIDE0LjUwNzIgNS42ODM3N0wxNS4yNzkyIDhIOC43NTAwOUw4LjAwMDA5IDdDOC41NTIzMyA2Ljk5OTk1IDkgNi41NTIyNiA5IDZDOSA1LjQ0NzcyIDguNTUyMjggNSA4IDVINUM0LjQ0NzcyIDUgNCA1LjQ0NzcyIDQgNkM0IDYuNTUyMjggNC40NDc3MiA3IDUgN0g1LjUwMDA5TDYuOTU5NTkgOC45NDYwMUM2LjkwNzM2IDkuMDMwMyA2Ljg2MDk4IDkuMTE5MTYgNi44MjExMiA5LjIxMjE2TDYuMDExMDcgMTEuMTAyM0M1LjY4NDUzIDExLjAzNTIgNS4zNDYzOCAxMSA1IDExQzIuMjM4NTggMTEgMCAxMy4yMzg2IDAgMTZDMCAxOC43NjE0IDIuMjM4NTggMjEgNSAyMUM3Ljc2MTQyIDIxIDEwIDE4Ljc2MTQgMTAgMTZDMTAgMTUuODcwNiA5Ljk5NTA5IDE1Ljc0MjQgOS45ODU0NCAxNS42MTU1TDExLjk2NzkgMTUuMDQ5MUMxMi4zNjcxIDE0LjkzNTEgMTIuNzIwOSAxNC42OTk2IDEyLjk4MDIgMTQuMzc1NUwxNi4xMDMyIDEwLjQ3MThMMTYuNTAxOSAxMS42Njc4QzE1LjAwNjMgMTIuNTMyMSAxNCAxNC4xNDg1IDE0IDE2QzE0IDE4Ljc2MTQgMTYuMjM4NiAyMSAxOSAyMUMyMS43NjE0IDIxIDI0IDE4Ljc2MTQgMjQgMTZDMjQgMTMuMjM4NiAyMS43NjE0IDExIDE5IDExQzE4Ljc5NjcgMTEgMTguNTk2MyAxMS4wMTIxIDE4LjM5OTMgMTEuMDM1N0wxNi40MDQ1IDUuMDUxMzJDMTUuOTk2MiAzLjgyNjI5IDE0Ljg0OTggMyAxMy41NTg1IDNIMTJaTTE3LjE0NTggMTMuNTk5OEwxOC4wNTEzIDE2LjMxNjJDMTguMjI2IDE2Ljg0MDIgMTguNzkyMyAxNy4xMjMzIDE5LjMxNjIgMTYuOTQ4N0MxOS44NDAyIDE2Ljc3NCAyMC4xMjMzIDE2LjIwNzcgMTkuOTQ4NyAxNS42ODM4TDE5LjA0MzIgMTIuOTY3NEMyMC42OTgzIDEyLjk5MDYgMjIuMDMyOSAxNC4zMzk0IDIyLjAzMjkgMTZDMjIuMDMyOSAxNy42NzUgMjAuNjc1IDE5LjAzMjkgMTkgMTkuMDMyOUMxNy4zMjUgMTkuMDMyOSAxNS45NjcxIDE3LjY3NSAxNS45NjcxIDE2QzE1Ljk2NzEgMTUuMDIzMyAxNi40Mjg4IDE0LjE1NDUgMTcuMTQ1OCAxMy41OTk4Wk03Ljg0OTE0IDExLjg5MDZMOC4zMjg3NSAxMC43NzE1TDEwLjMyODMgMTMuNDM3Nkw5LjQzNjc1IDEzLjY5MjNDOS4wNjA1OCAxMi45NzA2IDguNTEzNDggMTIuMzUyMSA3Ljg0OTE0IDExLjg5MDZaTTEwLjI1MDEgMTBMMTIuMDI1NSAxMi4zNjczTDEzLjkxOTMgMTBMMTAuMjUwMSAxMFpNNy40NTgwNiAxNC4yNTc2QzcuMzM1MTggMTQuMDg0NiA3LjE5NDQ4IDEzLjkyNTEgNy4wMzg2NSAxMy43ODE4TDYuNzQ3NzQgMTQuNDYwNkw3LjQ1ODA2IDE0LjI1NzZaTTUuMjg3MzEgMTYuOTU3OUM1LjA3MDUgMTcuMDIzIDQuODMwNDYgMTcuMDE1MyA0LjYwNjA5IDE2LjkxOTFDNC4wOTg0NiAxNi43MDE2IDMuODYzMzEgMTYuMTEzNyA0LjA4MDg3IDE1LjYwNjFMNS4yMDA0IDEyLjk5MzhDNS4xMzQxNiAxMi45ODk1IDUuMDY3MzQgMTIuOTg3MyA1IDEyLjk4NzNDMy4zMzYxMiAxMi45ODczIDEuOTg3MjggMTQuMzM2MSAxLjk4NzI4IDE2QzEuOTg3MjggMTcuNjYzOSAzLjMzNjEyIDE5LjAxMjcgNSAxOS4wMTI3QzYuNjAzMjEgMTkuMDEyNyA3LjkxMzk0IDE3Ljc2MDUgOC4wMDczOSAxNi4xODA3TDUuMjg3MzEgMTYuOTU3OVoiIGZpbGw9IiMwRjBGMEYiLz4NCjwvc3ZnPg==)';
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

    // Dynamic view: Show current position, start point, and planned end point
    const bounds = new mapboxgl.LngLatBounds();
    
    // Always include current position
    bounds.extend(coordinates);
    
    // Include start point of the day (first location)
    if (todayLocations.length > 0) {
      const startPoint = todayLocations[0];
      bounds.extend([startPoint.longitude, startPoint.latitude]);
    }
    
    // Try to include planned end point from today's stage
    const today = new Date().toISOString().split('T')[0];
    const todayStage = stagesData.find(s => s.date === today);
    
    if (todayStage?.route_coordinates && todayStage.route_coordinates.length > 0) {
      // Get the last coordinate from the planned route (end point)
      const endPoint = todayStage.route_coordinates[todayStage.route_coordinates.length - 1];
      if (endPoint && typeof endPoint.lon === 'number' && typeof endPoint.lat === 'number') {
        bounds.extend([endPoint.lon, endPoint.lat]);
        console.log(`📍 Including planned end point from stage: ${todayStage.name}`);
      }
    }
    
    // Fit the map to show all key points (current, start, planned end)
    // Check if we have at least 2 points to create valid bounds
    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, {
        padding: { top: 100, bottom: 100, left: 100, right: 100 },
        maxZoom: 14, // Don't zoom in too close even if points are near each other
        duration: 1000,
        essential: true,
      });
    } else {
      // Fallback: just center on current position if no other points available
      map.current.flyTo({
        center: coordinates,
        zoom: 10,
        essential: true,
        duration: 1000,
      });
    }
  };

  const drawRoute = (locations: Location[]) => {
    if (!map.current || locations.length === 0) return;

    const coordinates = locations.map(loc => [loc.longitude, loc.latitude]);

    const addRouteToMap = () => {
      if (!map.current) return;

      // Remove existing route if any
      if (map.current.getSource('route')) {
        try {
          map.current.removeLayer('route');
          map.current.removeSource('route');
          console.log('🗑️ Removed existing location history route');
        } catch (e) {
          console.warn('Could not remove existing route:', e);
        }
      }

      try {
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
            'line-color': mapColors.livePosition,
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });

        console.log(`✅ Added location history route with ${coordinates.length} points`);
      } catch (error) {
        console.error('❌ Error adding location history route:', error);
      }
    };

    // Ensure map AND style are fully loaded before adding route
    // This is critical for reliability - layers can only be added when style is ready
    if (!map.current.isStyleLoaded()) {
      console.log('⏳ Waiting for map style to load before adding location history route...');
      map.current.once('styledata', () => {
        console.log('✅ Map style loaded, adding location history route now');
        addRouteToMap();
      });
    } else {
      // Style is already loaded, add route immediately
      addRouteToMap();
    }
  };

  return (
    <>
      <div className="relative w-full h-full md:h-[600px] md:rounded-l-lg overflow-hidden md:shadow-xl">
        <div ref={mapContainer} className="w-full h-full" />
      {currentLocation && (
        <div className="absolute top-4 left-4 md:top-auto md:bottom-4 md:left-4 bg-white/95 backdrop-blur-sm p-2 md:p-4 rounded-lg shadow-lg md:min-w-[200px]">
          <h3 className="hidden md:inline font-bold text-xs md:text-sm mb-2 md:mb-3 text-gray-900">
            <span className="hidden md:inline">📍 Position en direct</span>
          </h3>
          <div className="space-y-0.5 md:space-y-1 text-xs">
            {currentLocation.speed !== undefined && currentLocation.speed !== null && (
              <div className="flex justify-between items-center gap-2">
                <span className="text-gray-600">
                  <span className="md:hidden" title="Speed">🚴</span>
                  <span className="hidden md:inline">Vitesse:</span>
                </span>
                <span className="font-semibold text-gray-900 text-[11px] md:text-xs">{Math.round(currentLocation.speed * 3.6)} km/h</span>
              </div>
            )}
            {currentLocation.altitude !== undefined && currentLocation.altitude !== null && (
              <div className="flex justify-between items-center gap-2">
                <span className="text-gray-600">
                  <span className="md:hidden" title="Altitude">⛰️</span>
                  <span className="hidden md:inline">Altitude:</span>
                </span>
                <span className="font-semibold text-gray-900 text-[11px] md:text-xs">{Math.round(currentLocation.altitude)}m</span>
              </div>
            )}
            {currentLocation.accuracy !== undefined && currentLocation.accuracy !== null && (
              <div className="hidden md:flex justify-between items-center gap-2">
                <span className="text-gray-600">Précision:</span>
                <span className="font-semibold text-gray-900 text-xs">{Math.round(currentLocation.accuracy)}m</span>
              </div>
            )}
            <div className="hidden md:block pt-2 mt-2 border-t border-gray-200">
              <div className="mb-2">
                <p className="text-gray-700 font-semibold text-[10px] mb-1">Légende:</p>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-0.5 rounded" style={{ backgroundColor: mapColors.routeCompleted }}></div>
                    <span className="text-gray-600 text-[9px]">Parcours du jour</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-0.5 rounded border-t-2 border-dashed" style={{ borderColor: mapColors.routeGpx }}></div>
                    <span className="text-gray-600 text-[9px]">Parcours à venir</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-0.5 rounded opacity-60" style={{ backgroundColor: mapColors.routePlanned }}></div>
                    <span className="text-gray-600 text-[9px]">Déjà parcouru</span>
                  </div>
                </div>
              </div>
              <span className="text-gray-500 text-[10px]">
                Updated: {currentLocation.timestamp ? new Date(currentLocation.timestamp * 1000).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>
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
