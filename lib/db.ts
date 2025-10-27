import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'tracker.db');

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize database schema immediately
function initDatabase() {
  // Locations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      altitude REAL,
      speed REAL,
      battery INTEGER,
      accuracy REAL,
      tracker_id TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  // Posts table for blog updates
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      location_name TEXT,
      images TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_locations_timestamp ON locations(timestamp);
    CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
  `);

  console.log('Database initialized successfully');
}

// Initialize database immediately on import
initDatabase();

// Location operations
export const locationQueries = {
  insertLocation: db.prepare(`
    INSERT INTO locations (timestamp, latitude, longitude, altitude, speed, battery, accuracy, tracker_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  
  getCurrentLocation: db.prepare(`
    SELECT * FROM locations 
    ORDER BY timestamp DESC 
    LIMIT 1
  `),
  
  getLocationHistory: db.prepare(`
    SELECT * FROM locations 
    ORDER BY timestamp ASC
  `),
  
  getLocationsSince: db.prepare(`
    SELECT * FROM locations 
    WHERE timestamp >= ?
    ORDER BY timestamp ASC
  `),
  
  getLocationCount: db.prepare(`
    SELECT COUNT(*) as count FROM locations
  `),
};

// Post operations
export const postQueries = {
  insertPost: db.prepare(`
    INSERT INTO posts (title, content, latitude, longitude, location_name, images)
    VALUES (?, ?, ?, ?, ?, ?)
  `),
  
  getAllPosts: db.prepare(`
    SELECT * FROM posts 
    ORDER BY created_at DESC
  `),
  
  getPostById: db.prepare(`
    SELECT * FROM posts 
    WHERE id = ?
  `),
  
  updatePost: db.prepare(`
    UPDATE posts 
    SET title = ?, content = ?, updated_at = strftime('%s', 'now')
    WHERE id = ?
  `),
  
  deletePost: db.prepare(`
    DELETE FROM posts 
    WHERE id = ?
  `),
};

// Calculate trip statistics
export function getTripStatistics() {
  const locations = locationQueries.getLocationHistory.all() as any[];
  
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
  
  const speeds = locations.filter(l => l.speed).map(l => l.speed);
  const averageSpeed = speeds.length > 0 
    ? speeds.reduce((a, b) => a + b, 0) / speeds.length 
    : 0;
  
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
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export default db;
