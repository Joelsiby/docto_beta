-- Phase 4: Patient-Side Tables Migration

-- Health Reports (uploaded by patients for AI analysis)
CREATE TABLE IF NOT EXISTS health_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patient_profiles(id) ON DELETE CASCADE,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50), -- 'CBC', 'lipid_panel', 'thyroid', 'liver', 'kidney', 'general', etc.
    file_url VARCHAR(500),
    file_type VARCHAR(20), -- 'pdf', 'image'
    extracted_data JSONB, -- raw OCR / extracted parameters
    ai_analysis JSONB, -- AI-generated analysis results
    flagged_parameters JSONB, -- array of flagged values with explanations
    status VARCHAR(20) DEFAULT 'uploaded', -- 'uploaded', 'analyzing', 'analyzed', 'error'
    analyzed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication Schedule (generated from prescription_items)
CREATE TABLE IF NOT EXISTS medication_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patient_profiles(id) ON DELETE CASCADE,
    prescription_item_id UUID REFERENCES prescription_items(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    instructions TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'taken', 'missed', 'skipped'
    taken_at TIMESTAMPTZ,
    is_on_time BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication Streaks (one per patient)
CREATE TABLE IF NOT EXISTS medication_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patient_profiles(id) ON DELETE CASCADE UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_streak_date DATE,
    total_on_time INTEGER DEFAULT 0,
    total_doses INTEGER DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0.00,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: health_reports
CREATE POLICY "Patients can manage their own health reports"
    ON health_reports FOR ALL
    USING (patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid()));

-- RLS Policies: medication_schedule
CREATE POLICY "Patients can manage their own medication schedule"
    ON medication_schedule FOR ALL
    USING (patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid()));

-- RLS Policies: medication_streaks
CREATE POLICY "Patients can manage their own medication streaks"
    ON medication_streaks FOR ALL
    USING (patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid()));

-- Allow patients to insert appointments (for booking)
CREATE POLICY "Patients can create appointments"
    ON appointments FOR INSERT
    WITH CHECK (patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid()));

-- Allow anyone to view doctor profiles (for discovery)
CREATE POLICY "Anyone can view doctor profiles for booking"
    ON doctor_profiles FOR SELECT
    USING (true);
