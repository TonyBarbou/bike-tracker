import * as toGeoJSON from '@tmcw/togeojson';

export interface GPXPoint {
  lat: number;
  lon: number;
  ele?: number;
}

export interface GPXWaypoint {
  name: string;
  lat: number;
  lon: number;
  ele?: number;
  desc?: string;
  type?: string;
}

export interface ParsedGPX {
  routeCoordinates: GPXPoint[];
  waypoints: GPXWaypoint[];
  totalDistance: number;
  totalElevationGain: number;
  name?: string;
  description?: string;
}

/**
 * Parse GPX file and extract route data
 */
export function parseGPX(gpxText: string): ParsedGPX {
  // Parse XML
  const parser = new DOMParser();
  const gpxDoc = parser.parseFromString(gpxText, 'text/xml');

  // Check for parsing errors
  const parserError = gpxDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Invalid GPX file format');
  }

  // Convert to GeoJSON
  const geoJSON = toGeoJSON.gpx(gpxDoc);

  // Extract route coordinates
  const routeCoordinates: GPXPoint[] = [];
  const waypoints: GPXWaypoint[] = [];

  // Process features
  geoJSON.features.forEach((feature: any) => {
    if (feature.geometry.type === 'LineString') {
      // Track/route data
      feature.geometry.coordinates.forEach((coord: number[]) => {
        routeCoordinates.push({
          lon: coord[0],
          lat: coord[1],
          ele: coord[2] || undefined,
        });
      });
    } else if (feature.geometry.type === 'Point') {
      // Waypoint
      waypoints.push({
        name: feature.properties?.name || 'Waypoint',
        lon: feature.geometry.coordinates[0],
        lat: feature.geometry.coordinates[1],
        ele: feature.geometry.coordinates[2] || undefined,
        desc: feature.properties?.desc,
        type: feature.properties?.type,
      });
    }
  });

  // Calculate total distance and elevation gain
  const { distance, elevationGain } = calculateStats(routeCoordinates);

  // Extract metadata
  const nameElement = gpxDoc.querySelector('metadata name, trk name');
  const descElement = gpxDoc.querySelector('metadata desc, trk desc');

  return {
    routeCoordinates,
    waypoints,
    totalDistance: distance,
    totalElevationGain: elevationGain,
    name: nameElement?.textContent || undefined,
    description: descElement?.textContent || undefined,
  };
}

/**
 * Calculate distance and elevation gain from route points
 */
function calculateStats(points: GPXPoint[]): {
  distance: number;
  elevationGain: number;
} {
  if (points.length < 2) {
    return { distance: 0, elevationGain: 0 };
  }

  let totalDistance = 0;
  let totalElevationGain = 0;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    // Calculate distance between points (Haversine formula)
    totalDistance += calculateDistance(prev.lat, prev.lon, curr.lat, curr.lon);

    // Calculate elevation gain
    if (prev.ele !== undefined && curr.ele !== undefined) {
      const elevationDiff = curr.ele - prev.ele;
      if (elevationDiff > 0) {
        totalElevationGain += elevationDiff;
      }
    }
  }

  return {
    distance: totalDistance,
    elevationGain: totalElevationGain,
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Validate GPX file content
 */
export function isValidGPX(text: string): boolean {
  try {
    const parser = new DOMParser();
    const gpxDoc = parser.parseFromString(text, 'text/xml');
    
    const parserError = gpxDoc.querySelector('parsererror');
    if (parserError) {
      return false;
    }

    // Check if it has GPX root element
    const gpxElement = gpxDoc.querySelector('gpx');
    return gpxElement !== null;
  } catch (error) {
    return false;
  }
}
