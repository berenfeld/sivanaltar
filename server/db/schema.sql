-- Sivanaltar database schema
-- Matches base44 exported CSV columns exactly.
-- created_by_id and is_sample are imported but not used by the app.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture TEXT,
  role TEXT DEFAULT 'user',
  lang TEXT DEFAULT 'he',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title TEXT,
  summary TEXT,
  content TEXT,
  category TEXT,
  image_url TEXT,
  published BOOLEAN DEFAULT false,
  publish_date TIMESTAMPTZ,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ,
  created_by_id TEXT,
  is_sample BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS gallery_images (
  id SERIAL PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  image_url TEXT,
  published BOOLEAN DEFAULT true,
  "order" INT DEFAULT 0,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ,
  created_by_id TEXT,
  is_sample BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  user_name TEXT,
  user_email TEXT,
  user_phone TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  price_nis NUMERIC,
  appointment_location TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ,
  created_by_id TEXT,
  is_sample BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS working_hours (
  id SERIAL PRIMARY KEY,
  day_of_week INT,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT true,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ,
  created_by_id TEXT,
  is_sample BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  replied BOOLEAN DEFAULT false,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ,
  created_by_id TEXT,
  is_sample BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS page_content (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE,
  content TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ,
  created_by_id TEXT,
  is_sample BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS user_guidance_sessions (
  id SERIAL PRIMARY KEY,
  user_email TEXT,
  user_full_name TEXT,
  user_phone TEXT,
  status TEXT DEFAULT 'active',
  qa_history JSONB DEFAULT '[]',
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ,
  created_by_id TEXT,
  is_sample BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS ai_config (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE,
  value TEXT,
  system_prompt TEXT,
  forbidden_words TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ,
  created_by_id TEXT,
  is_sample BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS ai_interaction_log (
  id SERIAL PRIMARY KEY,
  session_id TEXT,
  user_email TEXT,
  user_name TEXT,
  user_question TEXT,
  question TEXT,
  llm_answer TEXT,
  full_prompt TEXT,
  model TEXT,
  question_number INT,
  timestamp TIMESTAMPTZ,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ,
  created_by_id TEXT,
  is_sample BOOLEAN DEFAULT false
);
