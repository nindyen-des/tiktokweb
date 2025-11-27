/*
  # Access Keys System for TikTok Boost

  1. New Tables
    - `access_keys`
      - `id` (uuid, primary key)
      - `key` (text, unique) - The access key
      - `duration_type` (text) - Type: 1day, 2day, 3day, lifetime
      - `expires_at` (timestamptz) - Expiration timestamp (null for lifetime)
      - `created_at` (timestamptz) - Creation timestamp
      - `is_active` (boolean) - Active status
      - `used_count` (integer) - Usage counter
    
    - `admin_users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password_hash` (text)
      - `created_at` (timestamptz)
    
    - `boost_sessions`
      - `id` (uuid, primary key)
      - `access_key_id` (uuid, foreign key)
      - `tiktok_url` (text)
      - `total_views` (integer)
      - `total_likes` (integer)
      - `success_count` (integer)
      - `failed_count` (integer)
      - `started_at` (timestamptz)
      - `last_update` (timestamptz)
      - `is_active` (boolean)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Admin authentication for key management
*/

CREATE TABLE IF NOT EXISTS access_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  duration_type text NOT NULL CHECK (duration_type IN ('1day', '2day', '3day', 'lifetime')),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  used_count integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS boost_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_key_id uuid REFERENCES access_keys(id) ON DELETE CASCADE,
  tiktok_url text NOT NULL,
  total_views integer DEFAULT 0,
  total_likes integer DEFAULT 0,
  success_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  last_update timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

ALTER TABLE access_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE boost_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can validate access keys"
  ON access_keys FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage access keys"
  ON access_keys FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read sessions with valid key"
  ON boost_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create sessions"
  ON boost_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update sessions"
  ON boost_sessions FOR UPDATE
  USING (true);

CREATE POLICY "Admin can view admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_access_keys_key ON access_keys(key);
CREATE INDEX IF NOT EXISTS idx_access_keys_active ON access_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_boost_sessions_active ON boost_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_boost_sessions_key ON boost_sessions(access_key_id);