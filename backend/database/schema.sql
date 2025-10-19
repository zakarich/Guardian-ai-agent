-- Guardian AI Database Schema
-- PostgreSQL 16 + pgvector extension

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(255) UNIQUE NOT NULL,
    device_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW(),
    settings JSONB DEFAULT '{}'::jsonb
);

-- Conversations table (text only, no audio)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    transcript TEXT NOT NULL,
    summary TEXT,
    embedding vector(384),  -- MiniLM-L6 embeddings
    intent VARCHAR(50),
    confidence FLOAT,
    speakers INTEGER DEFAULT 1,
    duration INTEGER,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guidance messages
CREATE TABLE guidance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    context TEXT,
    confidence FLOAT,
    requires_confirmation BOOLEAN DEFAULT false,
    spoken BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transmission logs (for transparency)
CREATE TABLE transmissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    size INTEGER,
    purpose VARCHAR(100),
    endpoint VARCHAR(255),
    status VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_intent ON conversations(intent);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_guidance_conversation_id ON guidance(conversation_id);
CREATE INDEX idx_transmissions_user_id ON transmissions(user_id);

-- Vector similarity search index
CREATE INDEX idx_conversations_embedding ON conversations 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Auto-delete old conversations (7 days retention)
CREATE OR REPLACE FUNCTION delete_old_conversations()
RETURNS void AS $$
BEGIN
    DELETE FROM conversations 
    WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule daily cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-old-conversations', '0 2 * * *', 'SELECT delete_old_conversations()');
