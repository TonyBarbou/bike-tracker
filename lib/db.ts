import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Location operations
export const locationQueries = {
  async insertLocation(
    timestamp: number,
    latitude: number,
    longitude: number,
    altitude: number | null,
    speed: number | null,
    battery: number | null,
    accuracy: number | null,
    tracker_id: string
  ) {
    const { data, error } = await supabase
      .from('locations')
      .insert({
        timestamp,
        latitude,
        longitude,
        altitude,
        speed,
        battery,
        accuracy,
        tracker_id,
      })
      .select();

    if (error) throw error;
    return data;
  },

  async getCurrentLocation() {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  },

  async getLocationHistory() {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getLocationsSince(timestamp: number) {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .gte('timestamp', timestamp)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getLocationCount() {
    const { count, error } = await supabase
      .from('locations')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  },
};

// Post operations
export const postQueries = {
  async insertPost(
    title: string,
    content: string,
    latitude: number | null,
    longitude: number | null,
    location_name: string | null,
    images: string | null
  ) {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        latitude,
        longitude,
        location_name,
        images,
      })
      .select();

    if (error) throw error;
    return data;
  },

  async getAllPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPostById(id: number) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updatePost(id: number, title: string, content: string) {
    const { data, error } = await supabase
      .from('posts')
      .update({
        title,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data;
  },

  async deletePost(id: number) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Calculate trip statistics
export async function getTripStatistics() {
  const locations = await locationQueries.getLocationHistory();

  if (locations.length === 0) {
    return {
      totalDistance: 0,
      totalElevationGain: 0,
      daysOnRoad: 0,
      averageSpeed: 0,
      currentSpeed: 0,
      countries: [],
    };
  }

  // Calculate total distance using Haversine formula
  let totalDistance = 0;
  let totalElevationGain = 0;

  for (let i = 1; i < locations.length; i++) {
    const prev = locations[i - 1];
    const curr = locations[i];

    totalDistance += calculateDistance(
      prev.latitude,
      prev.longitude,
      curr.latitude,
      curr.longitude
    );

    if (curr.altitude && prev.altitude && curr.altitude > prev.altitude) {
      totalElevationGain += curr.altitude - prev.altitude;
    }
  }

  const firstTimestamp = locations[0].timestamp;
  const lastTimestamp = locations[locations.length - 1].timestamp;
  const daysOnRoad = Math.ceil((lastTimestamp - firstTimestamp) / 86400);

  const speeds = locations.filter((l) => l.speed).map((l) => l.speed);
  const averageSpeed =
    speeds.length > 0 ? speeds.reduce((a, b) => a! + b!, 0)! / speeds.length : 0;

  const currentSpeed = locations[locations.length - 1].speed || 0;

  return {
    totalDistance: Math.round(totalDistance * 100) / 100,
    totalElevationGain: Math.round(totalElevationGain),
    daysOnRoad: daysOnRoad || 1,
    averageSpeed: Math.round(averageSpeed * 100) / 100,
    currentSpeed: Math.round(currentSpeed * 100) / 100,
    countries: [], // Could be enhanced with reverse geocoding
  };
}

// Haversine formula to calculate distance between two coordinates
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
