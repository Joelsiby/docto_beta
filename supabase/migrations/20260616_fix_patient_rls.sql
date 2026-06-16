-- ============================================================================
-- Docto — Fix Patient RLS Policy
-- File: supabase/migrations/20260616_fix_patient_rls.sql
--
-- Run this in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Paste this → Run
--
-- This fixes a bug where patients couldn't view their sessions or prescriptions
-- because the RLS policy was comparing the auth.uid() directly against
-- patient_profiles.id instead of user_id.
-- ============================================================================

-- Drop the old incorrect policies
DROP POLICY IF EXISTS "Patient can view their sessions" ON sessions;
DROP POLICY IF EXISTS "Patient can view confirmed prescriptions" ON prescriptions;

-- Recreate with correct logic (check if auth.uid() matches the user_id in patient_profiles)
CREATE POLICY "Patient can view their sessions"
    ON sessions FOR SELECT  
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        ) 
        AND is_confirmed = true
    );

CREATE POLICY "Patient can view confirmed prescriptions"
    ON prescriptions FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        ) 
        AND is_confirmed = true
    );
