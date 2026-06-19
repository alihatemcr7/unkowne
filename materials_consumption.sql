-- SQL Script to create the materials_consumption table in Supabase SQL Editor
-- Run this in your Supabase project's SQL editor to enable database storage for materials consumption inventory.

CREATE TABLE IF NOT EXISTS public.materials_consumption (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    day TEXT,
    start_time TEXT,
    end_time TEXT,
    prepared_by TEXT,
    basics JSONB,
    marble JSONB,
    sealants JSONB,
    bulk JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) if you want to protect it, or let it open for active development
ALTER TABLE public.materials_consumption ENABLE ROW LEVEL SECURITY;

-- Allow read/write access to authenticated/anon roles
CREATE POLICY "Allow all public operations" 
ON public.materials_consumption 
FOR ALL 
USING (true) 
WITH CHECK (true);
