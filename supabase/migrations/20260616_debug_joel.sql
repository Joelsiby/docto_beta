-- ============================================================================
-- Docto — Diagnostic for Joel (joellsiby@gmail.com)
-- Run each query SEPARATELY in Supabase SQL Editor
-- ============================================================================

-- ── QUERY 1: Find Joel's auth user + patient profile ─────────────────────────
-- Run this first to get his patient_profile_id
SELECT 
  au.id           AS auth_user_id,
  au.email        AS auth_email,
  pp.id           AS patient_profile_id,
  pp.full_name
FROM auth.users au
LEFT JOIN patient_profiles pp ON pp.user_id = au.id
WHERE au.email = 'joellsiby@gmail.com';


-- ── QUERY 2: All sessions for Joel ───────────────────────────────────────────
-- Paste the patient_profile_id from Query 1 here
SELECT 
  id,
  patient_id,
  doctor_id,
  is_confirmed,
  status,
  length(coalesce(ai_summary, ''))    AS summary_chars,
  length(coalesce(patient_summary,'')) AS patient_summary_chars,
  started_at,
  ended_at
FROM sessions
WHERE patient_id = (
  SELECT pp.id FROM patient_profiles pp
  JOIN auth.users au ON au.id = pp.user_id
  WHERE au.email = 'joellsiby@gmail.com'
  LIMIT 1
)
ORDER BY started_at DESC;


-- ── QUERY 3: Prescriptions for Joel ──────────────────────────────────────────
SELECT 
  id,
  session_id,
  patient_id,
  doctor_id,
  is_confirmed,
  created_at
FROM prescriptions
WHERE patient_id = (
  SELECT pp.id FROM patient_profiles pp
  JOIN auth.users au ON au.id = pp.user_id
  WHERE au.email = 'joellsiby@gmail.com'
  LIMIT 1
)
ORDER BY created_at DESC;


-- ── QUERY 4: Prescription items for Joel ─────────────────────────────────────
SELECT 
  pi.id,
  pi.medicine_name,
  pi.dosage,
  pi.when_to_take,
  pi.timing,
  pi.duration_days,
  pi.meal_relation,
  pi.notes
FROM prescription_items pi
WHERE pi.prescription_id IN (
  SELECT id FROM prescriptions WHERE patient_id = (
    SELECT pp.id FROM patient_profiles pp
    JOIN auth.users au ON au.id = pp.user_id
    WHERE au.email = 'joellsiby@gmail.com'
    LIMIT 1
  )
);


-- ── QUERY 5: Medication schedule for Joel ────────────────────────────────────
SELECT 
  id,
  medication_name,
  dosage,
  scheduled_date,
  scheduled_time,
  time_of_day,
  status
FROM medication_schedule
WHERE patient_id = (
  SELECT pp.id FROM patient_profiles pp
  JOIN auth.users au ON au.id = pp.user_id
  WHERE au.email = 'joellsiby@gmail.com'
  LIMIT 1
)
ORDER BY scheduled_date, scheduled_time;
