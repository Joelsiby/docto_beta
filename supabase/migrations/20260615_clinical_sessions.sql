-- ============================================================================
-- Docto — Clinical Session SQL Migration (SAFE / IDEMPOTENT VERSION)
-- File: supabase/migrations/20260615_clinical_sessions.sql
--
-- Run this in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Paste this → Run
--
-- This version safely handles existing tables by:
-- 1. Creating tables only if they don't exist
-- 2. Adding any missing columns with ALTER TABLE ... ADD COLUMN IF NOT EXISTS
-- 3. Dropping existing policies before recreating them
-- ============================================================================

-- ── 1. Sessions Table ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sessions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token           VARCHAR(64) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    doctor_id               UUID,
    patient_id              UUID,
    appointment_id          UUID,
    started_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at                TIMESTAMPTZ,
    recording_url           VARCHAR(500),
    transcript              JSONB DEFAULT '[]',
    ai_summary              TEXT,
    patient_summary         TEXT,
    ai_issues               JSONB DEFAULT '[]',
    ai_diagnosis            JSONB DEFAULT '[]',
    ai_referrals            JSONB DEFAULT '[]',
    lifestyle_suggestions   JSONB DEFAULT '[]',
    doctor_notes            TEXT,
    is_confirmed            BOOLEAN DEFAULT FALSE,
    status                  VARCHAR(20) DEFAULT 'active',
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add any columns that might be missing on an existing sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS session_token        VARCHAR(64);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS doctor_id            UUID;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS patient_id           UUID;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS appointment_id       UUID;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ended_at             TIMESTAMPTZ;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS recording_url        VARCHAR(500);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS transcript           JSONB DEFAULT '[]';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ai_summary           TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS patient_summary      TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ai_issues            JSONB DEFAULT '[]';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ai_diagnosis         JSONB DEFAULT '[]';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ai_referrals         JSONB DEFAULT '[]';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS lifestyle_suggestions JSONB DEFAULT '[]';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS doctor_notes         TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS is_confirmed         BOOLEAN DEFAULT FALSE;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS status               VARCHAR(20) DEFAULT 'active';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS updated_at           TIMESTAMPTZ DEFAULT NOW();

-- Backfill session_token for any existing rows that don't have one
UPDATE sessions
SET session_token = encode(gen_random_bytes(32), 'hex')
WHERE session_token IS NULL;

-- Make session_token NOT NULL and UNIQUE after backfill
ALTER TABLE sessions ALTER COLUMN session_token SET NOT NULL;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'sessions_session_token_key'
    ) THEN
        ALTER TABLE sessions ADD CONSTRAINT sessions_session_token_key UNIQUE (session_token);
    END IF;
END $$;

-- Add status CHECK constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'sessions_status_check'
    ) THEN
        ALTER TABLE sessions ADD CONSTRAINT sessions_status_check
            CHECK (status IN ('active', 'ended', 'confirmed', 'archived'));
    END IF;
END $$;

-- ── 2. Prescriptions Table ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS prescriptions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id              UUID,
    doctor_id               UUID,
    patient_id              UUID,
    is_confirmed            BOOLEAN DEFAULT FALSE,
    prescription_pdf_url    VARCHAR(500),
    invoice_pdf_url         VARCHAR(500),
    total_fee               DECIMAL(10,2),
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add any missing columns to an existing prescriptions table
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS session_id              UUID;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS doctor_id               UUID;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS patient_id              UUID;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS is_confirmed            BOOLEAN DEFAULT FALSE;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS prescription_pdf_url    VARCHAR(500);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS invoice_pdf_url         VARCHAR(500);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS total_fee               DECIMAL(10,2);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS updated_at              TIMESTAMPTZ DEFAULT NOW();

-- Add foreign key to sessions if not already present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'prescriptions_session_id_fkey'
    ) THEN
        ALTER TABLE prescriptions
            ADD CONSTRAINT prescriptions_session_id_fkey
            FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ── 3. Prescription Items Table ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS prescription_items (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id         UUID,
    medicine_name           VARCHAR(255) NOT NULL,
    dosage                  VARCHAR(100),
    dosage_unit             VARCHAR(20),
    when_to_take            JSONB DEFAULT '[]',
    timing                  JSONB DEFAULT '[]',
    meal_relation           VARCHAR(20) DEFAULT 'any',
    duration_days           INTEGER,
    start_date              DATE,
    end_date                DATE,
    notes                   TEXT,
    actions                 TEXT,
    confidence_level        VARCHAR(10) DEFAULT 'high',
    interaction_warning     TEXT,
    sort_order              INTEGER DEFAULT 0,
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add any missing columns to an existing prescription_items table
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS prescription_id    UUID;
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS dosage_unit        VARCHAR(20);
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS when_to_take       JSONB DEFAULT '[]';
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS timing             JSONB DEFAULT '[]';
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS meal_relation      VARCHAR(20) DEFAULT 'any';
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS duration_days      INTEGER;
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS start_date         DATE;
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS end_date           DATE;
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS actions            TEXT;
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS confidence_level   VARCHAR(10) DEFAULT 'high';
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS interaction_warning TEXT;
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS sort_order         INTEGER DEFAULT 0;

-- Add CHECK constraints safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'prescription_items_meal_relation_check'
    ) THEN
        ALTER TABLE prescription_items ADD CONSTRAINT prescription_items_meal_relation_check
            CHECK (meal_relation IN ('before_meals', 'after_meals', 'with_meals', 'any'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'prescription_items_confidence_check'
    ) THEN
        ALTER TABLE prescription_items ADD CONSTRAINT prescription_items_confidence_check
            CHECK (confidence_level IN ('high', 'medium', 'low'));
    END IF;
END $$;

-- Add foreign key to prescriptions if not already present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'prescription_items_prescription_id_fkey'
    ) THEN
        ALTER TABLE prescription_items
            ADD CONSTRAINT prescription_items_prescription_id_fkey
            FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating (safe to re-run)
DROP POLICY IF EXISTS "Doctor can manage their sessions"         ON sessions;
DROP POLICY IF EXISTS "Patient can view their sessions"          ON sessions;
DROP POLICY IF EXISTS "Doctor can manage prescriptions"          ON prescriptions;
DROP POLICY IF EXISTS "Patient can view confirmed prescriptions"  ON prescriptions;
DROP POLICY IF EXISTS "Access through prescription"              ON prescription_items;
DROP POLICY IF EXISTS "Doctor can manage prescription items"     ON prescription_items;

-- Sessions policies
CREATE POLICY "Doctor can manage their sessions"
    ON sessions
    USING (auth.uid()::text = doctor_id::text);

CREATE POLICY "Patient can view their sessions"
    ON sessions FOR SELECT
    USING (auth.uid()::text = patient_id::text AND is_confirmed = true);

-- Prescriptions policies
CREATE POLICY "Doctor can manage prescriptions"
    ON prescriptions
    USING (auth.uid()::text = doctor_id::text);

CREATE POLICY "Patient can view confirmed prescriptions"
    ON prescriptions FOR SELECT
    USING (auth.uid()::text = patient_id::text AND is_confirmed = true);

-- Prescription items policies
CREATE POLICY "Access through prescription"
    ON prescription_items FOR SELECT
    USING (
        prescription_id IN (
            SELECT id FROM prescriptions
            WHERE doctor_id::text = auth.uid()::text
               OR (patient_id::text = auth.uid()::text AND is_confirmed = true)
        )
    );

CREATE POLICY "Doctor can manage prescription items"
    ON prescription_items
    USING (
        prescription_id IN (
            SELECT id FROM prescriptions WHERE doctor_id::text = auth.uid()::text
        )
    );

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_sessions_doctor_id              ON sessions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_patient_id             ON sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token                  ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_status                 ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_session_id        ON prescriptions(session_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id        ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescription_items_rx_id        ON prescription_items(prescription_id);

-- ── Auto-updated_at Trigger ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prescriptions_updated_at ON prescriptions;
CREATE TRIGGER update_prescriptions_updated_at
    BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Verify ────────────────────────────────────────────────────────────────────
-- Run these to confirm success:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'sessions';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'prescriptions';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'prescription_items';
