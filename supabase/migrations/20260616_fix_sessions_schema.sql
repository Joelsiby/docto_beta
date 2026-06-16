-- ============================================================================
-- Docto — Fix Sessions Schema (Add Missing Columns)
-- File: supabase/migrations/20260616_fix_sessions_schema.sql
--
-- Run this in Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Paste → Run
--
-- Why needed:
--   The live sessions table was created before the full clinical sessions
--   migration was run, so it's missing several columns that the API expects.
-- ============================================================================

-- Add missing columns to sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS started_at       TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ended_at         TIMESTAMPTZ;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS recording_url    VARCHAR(500);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS transcript       JSONB DEFAULT '[]';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ai_summary       TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS patient_summary  TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ai_issues        JSONB DEFAULT '[]';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ai_diagnosis     JSONB DEFAULT '[]';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ai_referrals     JSONB DEFAULT '[]';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS lifestyle_suggestions JSONB DEFAULT '[]';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS doctor_notes     TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS is_confirmed     BOOLEAN DEFAULT FALSE;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS status           VARCHAR(20) DEFAULT 'active';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS session_token    VARCHAR(64);

-- Backfill session_token for any rows that don't have one
UPDATE sessions SET session_token = encode(gen_random_bytes(32), 'hex') WHERE session_token IS NULL;

-- Add status constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sessions_status_check') THEN
        ALTER TABLE sessions ADD CONSTRAINT sessions_status_check
            CHECK (status IN ('active', 'ended', 'confirmed', 'archived'));
    END IF;
END $$;

-- Add prescriptions table if not exists (in case it's also missing columns)
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS is_confirmed         BOOLEAN DEFAULT FALSE;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS session_id           UUID;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS prescription_pdf_url VARCHAR(500);

-- Add prescription_items table columns
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS medicine_name   VARCHAR(255);
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS when_to_take    JSONB DEFAULT '[]';
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS timing          JSONB DEFAULT '[]';
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS meal_relation    VARCHAR(20) DEFAULT 'any';
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS duration_days   INTEGER;
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS notes           TEXT;
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS actions         TEXT;
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS sort_order      INTEGER DEFAULT 0;

-- Fix RLS: patients can view their sessions (the key fix)
DROP POLICY IF EXISTS "Patient can view their sessions" ON sessions;
CREATE POLICY "Patient can view their sessions"
    ON sessions FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
        AND is_confirmed = true
    );

-- Fix RLS: patients can view their confirmed prescriptions
DROP POLICY IF EXISTS "Patient can view confirmed prescriptions" ON prescriptions;
CREATE POLICY "Patient can view confirmed prescriptions"
    ON prescriptions FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
        AND is_confirmed = true
    );

-- Medication schedule: add missing columns + RLS
ALTER TABLE medication_schedule ADD COLUMN IF NOT EXISTS session_id            UUID;
ALTER TABLE medication_schedule ADD COLUMN IF NOT EXISTS prescription_item_id  UUID;
ALTER TABLE medication_schedule ADD COLUMN IF NOT EXISTS time_of_day           TEXT DEFAULT 'morning';

ALTER TABLE medication_schedule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Patients can view their medication schedule" ON medication_schedule;
CREATE POLICY "Patients can view their medication schedule"
    ON medication_schedule FOR SELECT
    USING (
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Patients can update their medication schedule" ON medication_schedule;
CREATE POLICY "Patients can update their medication schedule"
    ON medication_schedule FOR UPDATE
    USING (
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Service role can insert medication schedules" ON medication_schedule;
CREATE POLICY "Service role can insert medication schedules"
    ON medication_schedule FOR INSERT
    WITH CHECK (true);

-- Verify: run after applying to confirm started_at exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sessions' 
ORDER BY ordinal_position;
