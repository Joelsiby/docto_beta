-- ============================================================================
-- Docto — Fix prescription_items constraints
-- File: supabase/migrations/20260616_fix_prescription_constraints.sql
--
-- Run in Supabase SQL Editor: Dashboard → SQL Editor → New Query → Run
--
-- Why needed:
--   The original prescription_items schema has frequency, dosage as NOT NULL.
--   The new clinical session API uses when_to_take/timing arrays instead of
--   a single frequency string. This migration makes those columns nullable
--   and adds missing columns so both old and new code paths work.
-- ============================================================================

-- Make legacy NOT NULL columns nullable (they are superseded by when_to_take/timing)
ALTER TABLE prescription_items ALTER COLUMN frequency    DROP NOT NULL;
ALTER TABLE prescription_items ALTER COLUMN dosage       DROP NOT NULL;
ALTER TABLE prescription_items ALTER COLUMN medication_name DROP NOT NULL;

-- Also ensure medication_schedule dosage is nullable (AI may not always extract)
ALTER TABLE medication_schedule ALTER COLUMN dosage DROP NOT NULL;

-- Add instructions column to medication_schedule if not present
ALTER TABLE medication_schedule ADD COLUMN IF NOT EXISTS instructions TEXT;

-- Verify
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name IN ('prescription_items', 'medication_schedule')
  AND column_name IN ('frequency', 'dosage', 'medication_name', 'medicine_name', 'instructions')
ORDER BY table_name, column_name;
