-- Core Tables Migration for Docto

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patient_profiles(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled, in-progress
    type VARCHAR(50) DEFAULT 'consultation', -- consultation, follow-up, procedure
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Planner Tasks
CREATE TABLE IF NOT EXISTS planner_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high
    category VARCHAR(50) DEFAULT 'general', -- appointment, follow-up, research, personal
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patient_profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'completed', -- in-progress, completed
    audio_url VARCHAR(500),
    transcript TEXT,
    summary TEXT,
    clinical_notes JSONB, -- stores structured clinical insights like symptoms, diagnosis, suggestions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patient_profiles(id) ON DELETE CASCADE,
    diagnosis TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescription Items
CREATE TABLE IF NOT EXISTS prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL, -- e.g., 500mg
    frequency VARCHAR(100) NOT NULL, -- e.g., Once daily, Twice daily
    duration VARCHAR(100), -- e.g., 7 days
    instructions TEXT, -- e.g., Take after food
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research Documents
CREATE TABLE IF NOT EXISTS research_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    summary TEXT,
    insights JSONB,
    file_url VARCHAR(500),
    is_saved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bot Conversations
CREATE TABLE IF NOT EXISTS bot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Chat',
    tone VARCHAR(50) DEFAULT 'professional',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bot Messages
CREATE TABLE IF NOT EXISTS bot_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES bot_conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- user, assistant
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Appointments
CREATE POLICY "Doctors can manage their appointments"
    ON appointments FOR ALL
    USING (doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Patients can view their appointments"
    ON appointments FOR SELECT
    USING (patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid()));

-- Planner Tasks
CREATE POLICY "Users can manage their own planner tasks"
    ON planner_tasks FOR ALL
    USING (user_id = auth.uid());

-- Sessions
CREATE POLICY "Doctors can manage their sessions"
    ON sessions FOR ALL
    USING (doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Patients can view their own sessions"
    ON sessions FOR SELECT
    USING (patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid()));

-- Prescriptions
CREATE POLICY "Doctors can manage their prescriptions"
    ON prescriptions FOR ALL
    USING (doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Patients can view their own prescriptions"
    ON prescriptions FOR SELECT
    USING (patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid()));

-- Prescription Items
CREATE POLICY "Doctors can manage prescription items"
    ON prescription_items FOR ALL
    USING (prescription_id IN (
        SELECT id FROM prescriptions WHERE doctor_id IN (
            SELECT id FROM doctor_profiles WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Patients can view prescription items"
    ON prescription_items FOR SELECT
    USING (prescription_id IN (
        SELECT id FROM prescriptions WHERE patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
    ));

-- Research Documents
CREATE POLICY "Doctors can manage their research documents"
    ON research_documents FOR ALL
    USING (doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid()));

-- Bot Conversations
CREATE POLICY "Users can manage their own bot conversations"
    ON bot_conversations FOR ALL
    USING (user_id = auth.uid());

-- Bot Messages
CREATE POLICY "Users can manage messages in their conversations"
    ON bot_messages FOR ALL
    USING (conversation_id IN (SELECT id FROM bot_conversations WHERE user_id = auth.uid()));
