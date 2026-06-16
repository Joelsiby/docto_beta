-- ============================================================================
-- Docto — Fix ALL Patient RLS Policies (Comprehensive)
-- File: supabase/migrations/20260616_fix_all_patient_rls.sql
--
-- Run this in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Paste this → Run
--
-- ROOT CAUSE:
--   The sessions/prescriptions tables store patient_id as patient_profiles.id
--   (NOT auth.uid()). The old RLS policies compared auth.uid() directly to
--   patient_id, which always failed because they are different values.
--
-- This migration fixes ALL tables that need proper patient RLS:
--   - sessions
--   - prescriptions
--   - prescription_items
--   - medication_schedule (if exists)
-- ============================================================================

-- ── 1. Fix sessions table RLS ────────────────────────────────────────────────

DROP POLICY IF EXISTS "Patient can view their sessions"          ON sessions;
DROP POLICY IF EXISTS "Doctor can manage their sessions"         ON sessions;
DROP POLICY IF EXISTS "Service role full access to sessions"     ON sessions;

-- Doctors can manage their own sessions
CREATE POLICY "Doctor can manage their sessions"
    ON sessions
    USING (auth.uid()::text = doctor_id::text);

-- Patients can view sessions where their patient_profiles.id matches patient_id
CREATE POLICY "Patient can view their sessions"
    ON sessions FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
        AND is_confirmed = true
    );


-- ── 2. Fix prescriptions table RLS ──────────────────────────────────────────

DROP POLICY IF EXISTS "Patient can view confirmed prescriptions"  ON prescriptions;
DROP POLICY IF EXISTS "Doctor can manage prescriptions"           ON prescriptions;

-- Doctors can manage prescriptions they created
CREATE POLICY "Doctor can manage prescriptions"
    ON prescriptions
    USING (auth.uid()::text = doctor_id::text);

-- Patients can view confirmed prescriptions for their profile
CREATE POLICY "Patient can view confirmed prescriptions"
    ON prescriptions FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
        AND is_confirmed = true
    );


-- ── 3. Fix prescription_items table RLS ─────────────────────────────────────

DROP POLICY IF EXISTS "Access through prescription"              ON prescription_items;
DROP POLICY IF EXISTS "Doctor can manage prescription items"     ON prescription_items;

CREATE POLICY "Doctor can manage prescription items"
    ON prescription_items
    USING (
        prescription_id IN (
            SELECT id FROM prescriptions WHERE doctor_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Patient can view prescription items"
    ON prescription_items FOR SELECT
    USING (
        prescription_id IN (
            SELECT id FROM prescriptions
            WHERE patient_id IN (
                SELECT id FROM patient_profiles WHERE user_id = auth.uid()
            )
            AND is_confirmed = true
        )
    );


-- ── 4. Fix medication_schedule table RLS ────────────────────────────────────

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'medication_schedule') THEN

        ALTER TABLE medication_schedule ENABLE ROW LEVEL SECURITY;

        -- Drop old policies
        DROP POLICY IF EXISTS "Patients can view their medication schedule"    ON medication_schedule;
        DROP POLICY IF EXISTS "Patients can update their medication schedule"  ON medication_schedule;
        DROP POLICY IF EXISTS "System can insert medication schedules"         ON medication_schedule;

        -- Patient can view their own schedule
        EXECUTE '
            CREATE POLICY "Patients can view their medication schedule"
                ON medication_schedule FOR SELECT
                USING (
                    patient_id IN (
                        SELECT id FROM patient_profiles WHERE user_id = auth.uid()
                    )
                )
        ';

        -- Patient can mark taken (update status/taken_at)
        EXECUTE '
            CREATE POLICY "Patients can update their medication schedule"
                ON medication_schedule FOR UPDATE
                USING (
                    patient_id IN (
                        SELECT id FROM patient_profiles WHERE user_id = auth.uid()
                    )
                )
        ';

        -- Allow insert via service role (API routes use service role key)
        EXECUTE '
            CREATE POLICY "Service role can insert medication schedules"
                ON medication_schedule FOR INSERT
                WITH CHECK (true)
        ';

    END IF;
END $$;


-- ── 5. Verify ────────────────────────────────────────────────────────────────
-- Run these queries to confirm your sessions are visible:
--
-- SELECT id, is_confirmed, patient_id FROM sessions ORDER BY created_at DESC LIMIT 5;
-- SELECT pp.id, pp.user_id, pp.full_name FROM patient_profiles pp LIMIT 5;
--
-- If sessions exist but patient_id doesn't match any patient_profiles.id,
-- you may need to re-run a session from the doctor side after this fix.
