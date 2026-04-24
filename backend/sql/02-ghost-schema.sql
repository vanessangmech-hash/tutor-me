-- Ghost PostgreSQL Schema: Context, Embeddings, and Research Cache
-- Used for conversation caching, semantic search, and TinyFish research results

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Conversation context: cached conversation windows per room
CREATE TABLE IF NOT EXISTS conversation_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL,
  messages JSONB DEFAULT '[]',
  summary TEXT DEFAULT '',
  token_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_context_room ON conversation_context(room_id);

-- Topic embeddings: vector store for persona knowledge
CREATE TABLE IF NOT EXISTS topic_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_embeddings_persona ON topic_embeddings(persona_id);

-- Research cache: cached TinyFish web research results
CREATE TABLE IF NOT EXISTS research_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash VARCHAR(64) UNIQUE NOT NULL,
  query TEXT NOT NULL,
  subject TEXT NOT NULL,
  sources JSONB DEFAULT '[]',
  extracted_content TEXT DEFAULT '',
  embedding vector(1536),
  ttl_hours INTEGER DEFAULT 24,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_research_hash ON research_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_research_subject ON research_cache(subject);

-- Call research log: audit trail of web research during user calls
CREATE TABLE IF NOT EXISTS call_research_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID,
  user_id TEXT,
  user_query TEXT NOT NULL,
  search_queries JSONB DEFAULT '[]',
  sources_used JSONB DEFAULT '[]',
  research_summary TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_research_log_room ON call_research_log(room_id);
CREATE INDEX IF NOT EXISTS idx_research_log_user ON call_research_log(user_id);

-- Function for cosine similarity search on topic embeddings
CREATE OR REPLACE FUNCTION match_topic_embeddings(
  query_embedding vector(1536),
  match_persona_id UUID,
  match_threshold FLOAT DEFAULT 0.78,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  persona_id UUID,
  topic TEXT,
  content TEXT,
  source_url TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    te.id,
    te.persona_id,
    te.topic,
    te.content,
    te.source_url,
    1 - (te.embedding <=> query_embedding) AS similarity
  FROM topic_embeddings te
  WHERE te.persona_id = match_persona_id
    AND 1 - (te.embedding <=> query_embedding) > match_threshold
  ORDER BY te.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function for finding similar cached research
CREATE OR REPLACE FUNCTION match_research_cache(
  query_embedding vector(1536),
  match_subject TEXT,
  match_threshold FLOAT DEFAULT 0.85,
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  query TEXT,
  subject TEXT,
  sources JSONB,
  extracted_content TEXT,
  similarity FLOAT,
  is_expired BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rc.id,
    rc.query,
    rc.subject,
    rc.sources,
    rc.extracted_content,
    1 - (rc.embedding <=> query_embedding) AS similarity,
    (rc.created_at + (rc.ttl_hours || ' hours')::interval < now()) AS is_expired
  FROM research_cache rc
  WHERE rc.subject = match_subject
    AND 1 - (rc.embedding <=> query_embedding) > match_threshold
  ORDER BY rc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Auto-update updated_at for conversation_context
CREATE OR REPLACE FUNCTION update_context_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER context_updated_at
  BEFORE UPDATE ON conversation_context FOR EACH ROW EXECUTE FUNCTION update_context_timestamp();
