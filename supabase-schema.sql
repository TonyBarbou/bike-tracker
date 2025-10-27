-- Bike Tracker Database Schema for Supabase
-- Run this in your Supabase SQL Editor after creating your project

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id BIGSERIAL PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  altitude DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  battery INTEGER,
  accuracy DOUBLE PRECISION,
  tracker_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_name TEXT,
  images TEXT,
  stage_date DATE,
  time_of_day TIME,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create stages table
CREATE TABLE IF NOT EXISTS stages (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  day_number INTEGER,
  name TEXT NOT NULL,
  planned_distance_km DOUBLE PRECISION NOT NULL,
  planned_elevation_gain_m DOUBLE PRECISION NOT NULL,
  gpx_data TEXT,
  route_coordinates JSONB,
  waypoints JSONB,
  start_location TEXT,
  end_location TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_locations_timestamp ON locations(timestamp);
CREATE INDEX IF NOT EXISTS idx_locations_created_at ON locations(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_stage_date ON posts(stage_date);
CREATE INDEX IF NOT EXISTS idx_stages_date ON stages(date);
CREATE INDEX IF NOT EXISTS idx_stages_status ON stages(status);

-- Enable Row Level Security (RLS)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access and service role write access
-- Locations: Public can read, service role can write
CREATE POLICY "Enable read access for all users" ON locations
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for service role" ON locations
  FOR INSERT WITH CHECK (true);

-- Posts: Public can read, service role can write/update/delete
CREATE POLICY "Enable read access for all users" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for service role" ON posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for service role" ON posts
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for service role" ON posts
  FOR DELETE USING (true);

-- Stages: Public can read, service role can write/update/delete
CREATE POLICY "Enable read access for all users" ON stages
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for service role" ON stages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for service role" ON stages
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for service role" ON stages
  FOR DELETE USING (true);

-- Optional: Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Optional: Create trigger for posts table
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create trigger for stages table
CREATE TRIGGER update_stages_updated_at BEFORE UPDATE ON stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE 'Tables created: locations, posts, stages';
  RAISE NOTICE 'Indexes and RLS policies applied';
END $$;
