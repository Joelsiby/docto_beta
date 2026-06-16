-- ============================================================================
-- Docto — Patient Health Tracking Migration
-- File: supabase/migrations/20260616_patient_health_tracking.sql
--
-- Adds parameter trend tracking across multiple lab reports.
-- Run in Supabase SQL Editor: Dashboard → SQL Editor → New Query → Run
-- ============================================================================

-- ── 1. Health Report Parameter Trend Table ───────────────────────────────────
-- Tracks individual test values from each report so we can show trend charts
-- (e.g. Hemoglobin over 6 months across multiple CBC reports)

CREATE TABLE IF NOT EXISTS health_report_parameters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL,
  report_id       UUID NOT NULL REFERENCES health_reports(id) ON DELETE CASCADE,
  parameter_name  TEXT NOT NULL,
  value           NUMERIC,
  unit            TEXT,
  normal_min      NUMERIC,
  normal_max      NUMERIC,
  status          TEXT DEFAULT 'normal', -- 'normal', 'low', 'high', 'borderline', 'critical'
  recorded_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast trend queries: "Give me all Hemoglobin readings for this patient"
CREATE INDEX IF NOT EXISTS idx_health_params_patient_name
  ON health_report_parameters(patient_id, parameter_name, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_health_params_report
  ON health_report_parameters(report_id);

-- ── 2. RLS Policies ─────────────────────────────────────────────────────────
ALTER TABLE health_report_parameters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating (idempotent)
DROP POLICY IF EXISTS "Patients can view their own parameters" ON health_report_parameters;
DROP POLICY IF EXISTS "Patients can insert their own parameters" ON health_report_parameters;

-- Patients can read their own parameter data
CREATE POLICY "Patients can view their own parameters"
  ON health_report_parameters FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

-- System / service role inserts on upload
CREATE POLICY "Patients can insert their own parameters"
  ON health_report_parameters FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

-- ── 3. Add analyzed_at to health_reports if missing ─────────────────────────
ALTER TABLE health_reports ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMPTZ;
ALTER TABLE health_reports ADD COLUMN IF NOT EXISTS report_type TEXT DEFAULT 'general';

-- ── 4. Add session_id to medication_schedule if missing ─────────────────────
-- This links auto-populated schedules back to the doctor's session
ALTER TABLE medication_schedule ADD COLUMN IF NOT EXISTS session_id UUID;
ALTER TABLE medication_schedule ADD COLUMN IF NOT EXISTS prescription_item_id UUID;
ALTER TABLE medication_schedule ADD COLUMN IF NOT EXISTS time_of_day TEXT DEFAULT 'morning';

-- ── 5. Sessions table: ensure patient_summary column exists ─────────────────
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS patient_summary TEXT;

-- ── Done ─────────────────────────────────────────────────────────────────────
-- Run this in Supabase SQL Editor and confirm: "Success. No rows returned."
