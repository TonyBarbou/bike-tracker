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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_locations_timestamp ON locations(timestamp);
CREATE INDEX IF NOT EXISTS idx_locations_created_at ON locations(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

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

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE 'Tables created: locations, posts';
  RAISE NOTICE 'Indexes and RLS policies applied';
END $$;
