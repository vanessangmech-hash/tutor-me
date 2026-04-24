-- InsForge PostgreSQL Schema: Virtual Classroom Backend
-- Primary data store for rooms, personas, members, messages, rewards, learning progress

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum types
DO $$ BEGIN
  CREATE TYPE room_status AS ENUM ('active', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE member_role AS ENUM ('host', 'student');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE sender_type AS ENUM ('user', 'agent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE message_type AS ENUM ('chat', 'question', 'answer', 'reward');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Personas: shareable AI professor identities
CREATE TABLE IF NOT EXISTS personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id TEXT NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  personality_traits JSONB DEFAULT '{}',
  teaching_style JSONB DEFAULT '{"approach": "socratic", "detail_level": "moderate", "encouragement": true}',
  total_rewards INTEGER DEFAULT 0,
  times_used INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_personas_creator ON personas(creator_id);
CREATE INDEX IF NOT EXISTS idx_personas_subject ON personas(subject);
CREATE INDEX IF NOT EXISTS idx_personas_public ON personas(is_public) WHERE is_public = true;

-- Rooms: classroom instances
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(8) UNIQUE NOT NULL,
  host_id TEXT NOT NULL,
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE RESTRICT,
  status room_status DEFAULT 'active',
  max_participants INTEGER DEFAULT 30,
  settings JSONB DEFAULT '{"allow_voice": true, "allow_chat": true, "auto_reward": true}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_rooms_host ON rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_rooms_active ON rooms(status) WHERE status = 'active';

-- Room members: who is in each room
CREATE TABLE IF NOT EXISTS room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role member_role DEFAULT 'student',
  joined_at TIMESTAMPTZ DEFAULT now(),
  left_at TIMESTAMPTZ,
  UNIQUE(room_id, user_id, joined_at)
);

CREATE INDEX IF NOT EXISTS idx_members_room ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_active ON room_members(room_id) WHERE left_at IS NULL;

-- Messages: chat history
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_type sender_type NOT NULL,
  content TEXT NOT NULL,
  message_type message_type DEFAULT 'chat',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- Rewards: understanding confirmations
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  understanding_score FLOAT DEFAULT 1.0 CHECK (understanding_score >= 0 AND understanding_score <= 1),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rewards_user ON rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_persona ON rewards(persona_id);
CREATE INDEX IF NOT EXISTS idx_rewards_room ON rewards(room_id);

-- Learning progress: per-user per-persona learning state
CREATE TABLE IF NOT EXISTS learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  topics_mastered JSONB DEFAULT '[]',
  learning_style JSONB DEFAULT '{"primary": "unknown", "preferences": {}}',
  total_rewards INTEGER DEFAULT 0,
  interaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, persona_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_persona ON learning_progress(persona_id);

-- Helper function: generate random room codes
CREATE OR REPLACE FUNCTION generate_room_code() RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER personas_updated_at
  BEFORE UPDATE ON personas FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER rooms_updated_at
  BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER learning_progress_updated_at
  BEFORE UPDATE ON learning_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at();
