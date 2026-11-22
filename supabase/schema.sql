
-- ==========================================
-- CIVICPULSE DATABASE
-- Issues / Complaints Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.issues (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    ticket_id TEXT UNIQUE NOT NULL DEFAULT
      ('CIV-' || upper(substr(
        replace(gen_random_uuid()::text, '-', ''),
        1, 8
      ))),

    title TEXT NOT NULL,

    category TEXT NOT NULL,

    description TEXT,

    photo_url TEXT,

    latitude DOUBLE PRECISION,

    longitude DOUBLE PRECISION,

    severity INTEGER DEFAULT 0
      CHECK (severity BETWEEN 0 AND 100),

    impact INTEGER DEFAULT 0
      CHECK (impact BETWEEN 0 AND 100),

    recurrence INTEGER DEFAULT 0
      CHECK (recurrence BETWEEN 0 AND 100),

    priority_score NUMERIC(5,2) DEFAULT 0
      CHECK (priority_score BETWEEN 0 AND 100),

    status TEXT NOT NULL DEFAULT 'Reported'
      CHECK (status IN (
        'Reported',
        'Assigned',
        'In Progress',
        'Resolved',
        'Community Verified'
      )),

    department TEXT,

    deadline TIMESTAMPTZ,

    completion_photo_url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.issues
ENABLE ROW LEVEL SECURITY;

-- Indexes for faster complaint retrieval
CREATE INDEX IF NOT EXISTS idx_issues_status
ON public.issues(status);

CREATE INDEX IF NOT EXISTS idx_issues_category
ON public.issues(category);

CREATE INDEX IF NOT EXISTS idx_issues_created_at
ON public.issues(created_at DESC);
