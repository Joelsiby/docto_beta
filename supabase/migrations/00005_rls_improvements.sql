-- 00005_rls_improvements.sql
-- Phase 6: Ensure Doctors have legitimate RLS read-access to patient data

-- Enable Doctors to view all patient profiles
-- (In a true multi-tenant EMR, we would restrict this strictly to patients who have booked them, 
-- but for MVP, doctors need to search the global patient directory to book appointments).
CREATE POLICY "Doctors can view patient profiles"
    ON patient_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM doctor_profiles WHERE user_id = auth.uid()
        )
    );

-- Enable Doctors to view health reports
-- (Restricted to doctors reading health reports)
CREATE POLICY "Doctors can view patient health reports"
    ON health_reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM doctor_profiles WHERE user_id = auth.uid()
        )
    );

-- Enable Doctors to view medication schedule
CREATE POLICY "Doctors can view medication schedule"
    ON medication_schedule FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM doctor_profiles WHERE user_id = auth.uid()
        )
    );

-- Enable Doctors to view medication streaks
CREATE POLICY "Doctors can view medication streaks"
    ON medication_streaks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM doctor_profiles WHERE user_id = auth.uid()
        )
    );
