-- VerdictFlow Hackathon SQL Setup Script
-- Paste this entire script into your Supabase SQL Editor and click "Run".

-- 1. Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number TEXT,
  title TEXT NOT NULL,
  court TEXT,
  filed_date DATE,
  judgment_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'verified', 'archived')),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW', 'CRITICAL')),
  department TEXT,
  summary TEXT,
  raw_text TEXT,
  tags TEXT[],
  penalties TEXT,
  next_hearing_date DATE,
  bench TEXT,
  pdf_url TEXT,
  pdf_filename TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. Create compliance_actions table
CREATE TABLE IF NOT EXISTS compliance_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  responsible_department TEXT,
  deadline DATE,
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW', 'CRITICAL')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done', 'overdue')),
  category TEXT DEFAULT 'OTHER',
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add Full-Text Search Vector to cases table
ALTER TABLE cases ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(case_number, '') || ' ' || coalesce(department, ''))
  ) STORED;

-- Create an index to speed up text search
CREATE INDEX IF NOT EXISTS cases_search_idx ON cases USING GIN(search_vector);

-- 4. Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_cases_updated_at ON cases;
CREATE TRIGGER update_cases_updated_at
BEFORE UPDATE ON cases
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_compliance_actions_updated_at ON compliance_actions;
CREATE TRIGGER update_compliance_actions_updated_at
BEFORE UPDATE ON compliance_actions
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 5. Row Level Security (RLS) - Government Grade Access Control
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_actions ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow authenticated users to read cases" 
ON cases FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to read compliance_actions" 
ON compliance_actions FOR SELECT 
TO authenticated 
USING (true);

-- Allow insert/update/delete access to authenticated users
-- (In a real scenario, you'd restrict this further, e.g., auth.uid() = created_by)
CREATE POLICY "Allow authenticated users to insert cases" 
ON cases FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update cases" 
ON cases FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert compliance_actions" 
ON compliance_actions FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update compliance_actions" 
ON compliance_actions FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Allow public access to storage (if 'judgments' bucket exists)
-- This allows anyone to view the pdf via getPublicUrl if they have the link
-- Note: You should create the 'judgments' bucket manually via the Supabase Storage UI,
-- and make sure it is set to "Public" if you want public access.
