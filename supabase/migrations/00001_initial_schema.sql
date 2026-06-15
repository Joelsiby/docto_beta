-- Initial Schema Migration for Docto

-- Doctor Profiles
CREATE TABLE IF NOT EXISTS doctor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    qualifications TEXT[],
    license_number VARCHAR(100) NOT NULL,
    experience_years INTEGER,
    bio TEXT,
    profile_image_url VARCHAR(500),
    clinic_name VARCHAR(255),
    clinic_address JSONB,
    working_hours JSONB,
    appointment_duration INTEGER DEFAULT 30,
    consultation_fee DECIMAL(10,2),
    teleconsultation BOOLEAN DEFAULT TRUE,
    clinic_visit BOOLEAN DEFAULT TRUE,
    bot_tone VARCHAR(50) DEFAULT 'professional',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient Profiles
CREATE TABLE IF NOT EXISTS patient_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    emergency_contact JSONB,
    address JSONB,
    profile_image_url VARCHAR(500),
    medical_history JSONB,
    preferred_lang VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own doctor profile" ON doctor_profiles;
CREATE POLICY "Users can view own doctor profile"
    ON doctor_profiles FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own doctor profile" ON doctor_profiles;
CREATE POLICY "Users can update own doctor profile"
    ON doctor_profiles FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view active doctor profiles" ON doctor_profiles;
CREATE POLICY "Anyone can view active doctor profiles"
    ON doctor_profiles FOR SELECT
    USING (is_active = true);

DROP POLICY IF EXISTS "Users can view own patient profile" ON patient_profiles;
CREATE POLICY "Users can view own patient profile"
    ON patient_profiles FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own patient profile" ON patient_profiles;
CREATE POLICY "Users can update own patient profile"
    ON patient_profiles FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own doctor profile" ON doctor_profiles;
CREATE POLICY "Users can insert own doctor profile"
    ON doctor_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own patient profile" ON patient_profiles;
CREATE POLICY "Users can insert own patient profile"
    ON patient_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);


