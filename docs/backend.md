# ⚙️ Docto — Backend Architecture

> **Version:** 1.0  
> **Last Updated:** June 8, 2026  
> **Status:** Draft

---

## Architecture Philosophy

> **Monolith-first, extract microservices as needed.**

We start with a well-structured Next.js monolith (App Router + API Routes) to ship fast. Services are logically separated into modules so they can be extracted into independent services when scale demands it.

---

## High-Level Architecture

```
                          ┌─────────────────┐
                          │   CDN (Vercel)   │
                          │   Static Assets  │
                          └────────┬────────┘
                                   │
                          ┌────────┴────────┐
                          │  Load Balancer   │
                          │   (Vercel Edge)  │
                          └────────┬────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
     ┌────────┴────────┐ ┌────────┴────────┐ ┌────────┴────────┐
     │  Next.js App    │ │  Next.js App    │ │  Next.js App    │
     │  Instance 1     │ │  Instance 2     │ │  Instance N     │
     │                 │ │                 │ │                 │
     │  ┌───────────┐  │ │                 │ │                 │
     │  │ API Routes│  │ │                 │ │                 │
     │  │ + tRPC    │  │ │                 │ │                 │
     │  │ + Middleware│ │ │                 │ │                 │
     │  └───────────┘  │ │                 │ │                 │
     └────────┬────────┘ └────────┬────────┘ └────────┬────────┘
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
┌────────┴────────┐  ┌─────────────┴──────────┐  ┌──────────┴────────┐
│   PostgreSQL    │  │       Redis            │  │    S3 / R2        │
│   (Primary DB)  │  │  (Cache + Pub/Sub +    │  │  (File Storage)   │
│                 │  │   Session + Queue)     │  │                   │
│   + Read        │  │                        │  │  PDFs, Audio,     │
│     Replicas    │  │                        │  │  Images, Reports  │
└─────────────────┘  └────────────────────────┘  └───────────────────┘
         │
┌────────┴────────┐
│    Pinecone     │
│  (Vector DB)    │
│  RAG for Bot    │
└─────────────────┘
```

---

## API Architecture

### Route Organization

```
app/api/
├── auth/
│   ├── [...nextauth]/route.ts      # NextAuth handler
│   ├── register/route.ts           # User registration
│   └── verify-otp/route.ts         # OTP verification
│
├── trpc/
│   └── [trpc]/route.ts             # tRPC handler (typesafe internal APIs)
│
├── doctors/
│   ├── route.ts                    # GET: list, POST: create profile
│   ├── [doctorId]/
│   │   ├── route.ts                # GET: profile, PUT: update
│   │   ├── slots/route.ts          # GET: available slots
│   │   ├── triage/route.ts         # GET/POST: triage questions
│   │   └── appointments/route.ts   # GET: doctor's appointments
│   └── search/route.ts             # GET: search doctors
│
├── patients/
│   ├── route.ts                    # GET: list (doctor access), POST: create
│   ├── [patientId]/
│   │   ├── route.ts                # GET: profile, PUT: update
│   │   ├── history/route.ts        # GET: visit history
│   │   ├── reports/route.ts        # GET/POST: health reports
│   │   ├── medications/route.ts    # GET: active medications
│   │   └── compliance/route.ts     # GET/POST: medication compliance
│   └── search/route.ts             # GET: search patients (doctor only)
│
├── appointments/
│   ├── route.ts                    # GET: list, POST: book
│   ├── [appointmentId]/
│   │   ├── route.ts                # GET: details, PUT: update, DELETE: cancel
│   │   └── triage-response/route.ts # POST: submit triage answers
│   └── upcoming/route.ts           # GET: upcoming appointments
│
├── session/
│   ├── start/route.ts              # POST: create new session
│   ├── extract/route.ts            # POST: AI extraction via LLaMA 3.1
│   ├── transcribe/route.ts         # POST: store transcript chunks
│   ├── voice-command/route.ts      # POST: modify prescription via voice
│   └── submit/route.ts             # POST: final session confirmation
│
├── research/
│   ├── upload/route.ts             # POST: upload PDF/image
│   ├── url/route.ts                # POST: scrape URL
│   ├── analyze/route.ts            # POST: analyze text/passage
│   ├── word/route.ts               # POST: word definition/etymology
│   └── summary/route.ts            # POST: document summary
│
├── bot/
│   ├── chat/route.ts               # POST: send message to Docto Bot
│   ├── stream/route.ts             # GET: SSE stream for bot responses
│   └── history/route.ts            # GET: chat history
│
├── planner/
│   ├── route.ts                    # GET: tasks, POST: create task
│   ├── [taskId]/route.ts           # PUT: update, DELETE: remove
│   ├── generate/route.ts           # POST: AI generate schedule
│   └── weekly-summary/route.ts     # GET: weekly report
│
├── reports/
│   ├── upload/route.ts             # POST: upload health report
│   ├── [reportId]/
│   │   ├── route.ts                # GET: report details
│   │   └── analysis/route.ts       # GET: AI analysis results
│   └── analyze/route.ts            # POST: trigger analysis
│
├── export/
│   ├── route.ts                    # POST: export patient data
│   ├── formats/route.ts            # GET: available export formats
│   └── templates/route.ts          # GET/POST: custom format templates
│
├── payments/
│   ├── create-order/route.ts       # POST: create Razorpay order
│   ├── verify/route.ts             # POST: verify payment
│   └── webhook/route.ts            # POST: Razorpay webhook
│
├── notifications/
│   ├── route.ts                    # GET: user notifications
│   ├── read/route.ts               # PUT: mark as read
│   └── preferences/route.ts        # GET/PUT: notification settings
│
└── webhooks/
    ├── razorpay/route.ts           # Payment webhooks
    ├── twilio/route.ts             # SMS delivery status
    └── daily/route.ts              # Video call events
```

---

## Database Schema (PostgreSQL)

### Core Tables

```sql
-- ============================================
-- USERS & AUTH
-- ============================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE,
    phone           VARCHAR(20) UNIQUE,
    password_hash   VARCHAR(255),
    role            VARCHAR(20) NOT NULL CHECK (role IN ('doctor', 'patient', 'admin')),
    is_verified     BOOLEAN DEFAULT FALSE,
    preferred_lang  VARCHAR(10) DEFAULT 'en',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DOCTOR PROFILES
-- ============================================

CREATE TABLE doctor_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name           VARCHAR(255) NOT NULL,
    specialization      VARCHAR(255) NOT NULL,
    qualifications      TEXT[],
    license_number      VARCHAR(100) NOT NULL,
    experience_years    INTEGER,
    bio                 TEXT,
    profile_image_url   VARCHAR(500),
    clinic_name         VARCHAR(255),
    clinic_address      JSONB,          -- { line1, line2, city, state, pin, lat, lng }
    working_hours       JSONB,          -- { mon: {start, end}, tue: ... }
    appointment_duration INTEGER DEFAULT 30,  -- in minutes
    max_patients_per_slot INTEGER DEFAULT 1,
    teleconsultation    BOOLEAN DEFAULT TRUE,
    clinic_visit        BOOLEAN DEFAULT TRUE,
    consultation_fee    DECIMAL(10,2),
    bot_tone            VARCHAR(50) DEFAULT 'teacher',  -- professor, senior, teacher
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PATIENT PROFILES
-- ============================================

CREATE TABLE patient_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name           VARCHAR(255) NOT NULL,
    date_of_birth       DATE,
    gender              VARCHAR(20),
    blood_group         VARCHAR(10),
    emergency_contact   JSONB,          -- { name, phone, relation }
    address             JSONB,
    profile_image_url   VARCHAR(500),
    medical_history     JSONB,          -- { allergies: [], conditions: [], surgeries: [] }
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIAGE QUESTIONS (Doctor-defined)
-- ============================================

CREATE TABLE triage_questions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id           UUID REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    appointment_type    VARCHAR(20) CHECK (appointment_type IN ('teleconsultation', 'clinic_visit', 'both')),
    question_text       TEXT NOT NULL,
    question_type       VARCHAR(20) CHECK (question_type IN ('text', 'number', 'scale', 'select', 'multiselect', 'boolean')),
    options             JSONB,          -- For select/multiselect types
    is_required         BOOLEAN DEFAULT TRUE,
    sort_order          INTEGER DEFAULT 0,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APPOINTMENTS
-- ============================================

CREATE TABLE appointments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id           UUID REFERENCES doctor_profiles(id),
    patient_id          UUID REFERENCES patient_profiles(id),
    appointment_type    VARCHAR(20) NOT NULL CHECK (appointment_type IN ('teleconsultation', 'clinic_visit')),
    scheduled_at        TIMESTAMPTZ NOT NULL,
    duration_minutes    INTEGER DEFAULT 30,
    status              VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    payment_id          UUID,
    payment_status      VARCHAR(20) DEFAULT 'pending',
    notes               TEXT,
    cancelled_by        VARCHAR(20),
    cancellation_reason TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE triage_responses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id      UUID REFERENCES appointments(id) ON DELETE CASCADE,
    question_id         UUID REFERENCES triage_questions(id),
    response            JSONB NOT NULL,     -- Flexible response storage
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLINICAL SESSIONS
-- ============================================

CREATE TABLE sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id      UUID REFERENCES appointments(id),
    doctor_id           UUID REFERENCES doctor_profiles(id),
    patient_id          UUID REFERENCES patient_profiles(id),
    started_at          TIMESTAMPTZ NOT NULL,
    ended_at            TIMESTAMPTZ,
    recording_url       VARCHAR(500),       -- S3 path to audio recording
    transcript          JSONB,              -- Full transcript with timestamps & speakers
    ai_summary          TEXT,
    ai_issues           JSONB,              -- [{ issue, severity, details }]
    ai_diagnosis        JSONB,              -- [{ diagnosis, icd10_code, confidence }]
    ai_referrals        JSONB,              -- [{ specialist, reason }]
    doctor_notes        TEXT,               -- Manual notes by doctor
    is_confirmed        BOOLEAN DEFAULT FALSE,  -- Doctor verified the output
    status              VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'ended', 'confirmed', 'archived')),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRESCRIPTIONS
-- ============================================

CREATE TABLE prescriptions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID REFERENCES sessions(id),
    doctor_id           UUID REFERENCES doctor_profiles(id),
    patient_id          UUID REFERENCES patient_profiles(id),
    is_confirmed        BOOLEAN DEFAULT FALSE,
    prescription_pdf_url VARCHAR(500),
    invoice_pdf_url     VARCHAR(500),
    total_fee           DECIMAL(10,2),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE prescription_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id     UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_name       VARCHAR(255) NOT NULL,
    dosage              VARCHAR(100),       -- "500mg", "5ml"
    dosage_unit         VARCHAR(20),        -- "mg", "ml", "tablet", "capsule"
    frequency           JSONB,              -- ["morning", "afternoon", "night"]
    timing              JSONB,              -- ["8:00", "14:00", "21:00"]
    meal_relation       VARCHAR(20),        -- "before_meals", "after_meals", "with_meals", "any"
    quantity_per_dose   VARCHAR(50),        -- "1 tablet", "5ml", "half tablet"
    duration_days       INTEGER,
    start_date          DATE,
    end_date            DATE,
    notes               TEXT,               -- "Take with warm water"
    sort_order          INTEGER DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MEDICATION TRACKING (Patient side)
-- ============================================

CREATE TABLE medication_schedule (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id          UUID REFERENCES patient_profiles(id),
    prescription_item_id UUID REFERENCES prescription_items(id),
    scheduled_date      DATE NOT NULL,
    scheduled_time      TIME NOT NULL,
    status              VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'taken', 'missed', 'skipped')),
    taken_at            TIMESTAMPTZ,
    is_on_time          BOOLEAN,            -- Within ±30 min window
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE medication_streaks (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id          UUID REFERENCES patient_profiles(id) UNIQUE,
    current_streak      INTEGER DEFAULT 0,
    longest_streak      INTEGER DEFAULT 0,
    last_streak_date    DATE,
    total_on_time       INTEGER DEFAULT 0,
    total_doses         INTEGER DEFAULT 0,
    discount_earned     DECIMAL(5,2) DEFAULT 0.00,  -- Percentage
    discount_active     BOOLEAN DEFAULT FALSE,
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HEALTH REPORTS (Patient uploads)
-- ============================================

CREATE TABLE health_reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id          UUID REFERENCES patient_profiles(id),
    report_type         VARCHAR(50),        -- "blood_work", "imaging", "lab", "other"
    report_name         VARCHAR(255),
    file_url            VARCHAR(500),       -- S3 path
    file_type           VARCHAR(20),        -- "pdf", "image"
    extracted_data      JSONB,              -- OCR/parsed data
    ai_analysis         JSONB,              -- Full analysis results
    flagged_parameters  JSONB,              -- Parameters outside normal range
    status              VARCHAR(20) DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'analyzed', 'error')),
    analyzed_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RESEARCH DOCUMENTS (Doctor side)
-- ============================================

CREATE TABLE research_documents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id           UUID REFERENCES doctor_profiles(id),
    title               VARCHAR(500),
    source_type         VARCHAR(20) CHECK (source_type IN ('pdf', 'text', 'url', 'image')),
    source_url          VARCHAR(1000),
    file_url            VARCHAR(500),       -- S3 path for uploads
    extracted_text      TEXT,
    ai_summary          TEXT,
    ai_key_takeaways    JSONB,              -- Array of bullet points
    ai_image_analysis   JSONB,              -- Analysis of embedded images
    vector_ids          TEXT[],             -- Pinecone vector IDs for RAG
    is_bookmarked       BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SMART PLANNER
-- ============================================

CREATE TABLE planner_tasks (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id           UUID REFERENCES doctor_profiles(id),
    title               VARCHAR(500) NOT NULL,
    description         TEXT,
    category            VARCHAR(20) CHECK (category IN ('work', 'personal', 'urgent', 'followup', 'learning')),
    priority            VARCHAR(10) CHECK (priority IN ('high', 'medium', 'low')),
    scheduled_date      DATE,
    scheduled_time      TIME,
    duration_minutes    INTEGER,
    is_completed        BOOLEAN DEFAULT FALSE,
    completed_at        TIMESTAMPTZ,
    is_recurring        BOOLEAN DEFAULT FALSE,
    recurrence_rule     JSONB,              -- iCal RRULE format
    source              VARCHAR(20) DEFAULT 'manual',  -- "manual", "bot", "appointment"
    linked_appointment_id UUID REFERENCES appointments(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DOCTO BOT CONVERSATIONS
-- ============================================

CREATE TABLE bot_conversations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id),
    context_type        VARCHAR(20),        -- "research", "session", "general", "planner", "report"
    context_id          UUID,               -- ID of the related entity
    title               VARCHAR(255),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bot_messages (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id     UUID REFERENCES bot_conversations(id) ON DELETE CASCADE,
    role                VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content             TEXT NOT NULL,
    metadata            JSONB,              -- { tone, sources, context_refs }
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id),
    type                VARCHAR(50) NOT NULL,   -- "appointment_booked", "session_complete", "medication_due", etc.
    title               VARCHAR(255) NOT NULL,
    body                TEXT,
    data                JSONB,              -- Additional structured data
    is_read             BOOLEAN DEFAULT FALSE,
    sent_via            VARCHAR(20)[],      -- ["push", "sms", "email", "in_app"]
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENTS
-- ============================================

CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id      UUID REFERENCES appointments(id),
    patient_id          UUID REFERENCES patient_profiles(id),
    doctor_id           UUID REFERENCES doctor_profiles(id),
    amount              DECIMAL(10,2) NOT NULL,
    currency            VARCHAR(3) DEFAULT 'INR',
    gateway             VARCHAR(20) DEFAULT 'razorpay',
    gateway_order_id    VARCHAR(255),
    gateway_payment_id  VARCHAR(255),
    status              VARCHAR(20) DEFAULT 'created' CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
    discount_applied    DECIMAL(5,2) DEFAULT 0.00,
    discount_source     VARCHAR(20),        -- "medication_streak"
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DATA EXPORT LOGS
-- ============================================

CREATE TABLE export_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id           UUID REFERENCES doctor_profiles(id),
    export_type         VARCHAR(20),        -- "single_patient", "bulk", "session"
    format              VARCHAR(20),        -- "fhir", "cda", "pdf", "csv", "custom"
    patient_ids         UUID[],
    file_url            VARCHAR(500),
    status              VARCHAR(20) DEFAULT 'processing',
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Service Modules

### 1. Auth Service (`lib/services/auth/`)

```
auth/
├── auth.config.ts          # NextAuth configuration
├── providers.ts            # OAuth + Credentials providers
├── otp.service.ts          # OTP generation, verification (Twilio/MSG91)
├── rbac.ts                 # Role-based access control middleware
├── session.ts              # Session management utilities
└── validators.ts           # Zod schemas for auth inputs
```

**Key Logic:**
- Phone OTP as primary auth for patients (India-first)
- Email + Google OAuth for doctors
- JWT access tokens (15 min) + refresh tokens (7 days)
- RBAC middleware: `requireRole('doctor')`, `requireRole('patient')`

### 2. Research Service (`lib/services/research/`)

```
research/
├── pdf-parser.ts           # Extract text + images from PDFs
├── web-scraper.ts          # Scrape article content from URLs
├── ocr.service.ts          # OCR for image text extraction
├── ai-analyzer.ts          # Word definitions, passage summaries
├── vector-store.ts         # Pinecone operations for RAG
└── research.service.ts     # Main orchestrator
```

**Key Logic:**
- PDF parsing with `pdf-parse` + fallback to OCR for scanned docs
- Web scraping with `cheerio` (static) + `puppeteer` (JS-rendered)
- Text chunking → vector embedding → Pinecone storage for RAG
- Streaming AI responses for summaries (SSE)

### 3. Session Service (`lib/services/session/`)

```
session/
├── recording.service.ts    # Audio recording management
├── transcription.ts        # Dragon Copilot / Whisper integration
├── diarization.ts          # Speaker identification
├── extractor.ts            # NER for medicines, diagnoses
├── prescription.builder.ts # Structure extracted data into tables
├── pdf-generator.ts        # Generate prescription & invoice PDFs
├── session.service.ts      # Main orchestrator
└── fhir-mapper.ts          # Map session data to FHIR resources
```

**Key Logic:**
- WebSocket connection for real-time audio streaming to transcription service
- Dragon Copilot API for medical-grade transcription
- Fallback chain: Dragon → WhisperFlow → manual entry
- NER pipeline: Extract entities → Classify → Structure into prescription format
- PDF generation with branded templates

### 4. Bot Service (`lib/services/bot/`)

```
bot/
├── bot.service.ts          # Main bot orchestrator
├── prompt-templates.ts     # System prompts for different tones
├── context-builder.ts      # Build context from documents, sessions
├── rag.service.ts          # RAG with Pinecone for document-aware responses
├── tools.ts                # LangChain tools (update planner, search history)
├── guardrails.ts           # Patient-mode restrictions
└── stream.ts               # SSE streaming handler
```

**Key Logic:**
- Different system prompts per tone (Professor, Senior, Teacher)
- Patient mode: Context limited to doctor's documented notes only
- RAG: Query Pinecone for relevant document chunks → inject into context
- Tool calling: Bot can update planner, search patient history (doctor only)
- Streaming via Server-Sent Events (SSE)

### 5. Patient Service (`lib/services/patient/`)

```
patient/
├── report-analyzer.ts      # Health report AI analysis
├── compliance.service.ts   # Medication tracking & streak logic
├── gamification.ts         # Streak rewards, discount calculation
├── schedule-builder.ts     # Build medication calendar from prescription
├── notification.service.ts # Medication reminders
└── patient.service.ts      # Main orchestrator
```

**Key Logic:**
- Report analysis pipeline: Upload → OCR/Parse → AI Analysis → Flag abnormals
- India-specific reference ranges for blood work
- Medication schedule auto-generated from prescription items
- Streak calculation: On-time (±30 min) → streak++, Miss → streak = 0
- Discount tiers: 7-day (5%), 14-day (10%), 30-day (20%)

### 6. Export Service (`lib/services/export/`)

```
export/
├── fhir.builder.ts         # FHIR R4 resource builder
├── cda.builder.ts          # CDA document builder
├── csv.builder.ts          # CSV/Excel generator
├── custom-mapper.ts        # Hospital-specific template mapping
├── template.service.ts     # Manage custom format templates
└── export.service.ts       # Main orchestrator
```

---

## Middleware Stack

```typescript
// middleware.ts (Next.js middleware)

export function middleware(request: NextRequest) {
  // 1. Rate limiting (Redis-backed)
  // 2. Authentication check (JWT verification)
  // 3. Role-based route protection
  // 4. Request logging
  // 5. CORS handling
  // 6. Security headers (Helmet-equivalent)
}

export const config = {
  matcher: ['/api/:path*', '/doctor/:path*', '/patient/:path*']
}
```

### Middleware Chain

| Order | Middleware | Purpose |
|-------|-----------|---------|
| 1 | Rate Limiter | 100 req/min per IP, 30 req/min for AI endpoints |
| 2 | Auth Verifier | Validate JWT, refresh if needed |
| 3 | Role Guard | Ensure user has required role for route |
| 4 | Request Logger | Log method, path, duration, status |
| 5 | Error Handler | Catch errors, format response, log to Sentry |

---

## Background Jobs & Queues

| Job | Trigger | Processing |
|-----|---------|------------|
| **Transcription Processing** | Session ends | Process audio → Generate transcript |
| **Report Analysis** | Report uploaded | OCR → Parse → AI Analysis |
| **PDF Generation** | Doctor confirms session | Generate prescription + invoice PDFs |
| **Medication Reminders** | Cron (every minute) | Check upcoming doses → Send push |
| **Streak Calculation** | Daily at midnight | Calculate missed doses → Update streaks |
| **Weekly Summary** | Cron (Sunday 8pm) | Generate doctor's weekly planner summary |
| **Data Export** | Doctor requests | Process export → Generate file → Notify |
| **Embedding Pipeline** | Research doc uploaded | Chunk text → Generate embeddings → Store in Pinecone |

**Queue Implementation:** Redis-backed with BullMQ for reliable job processing with retries.

---

## Caching Strategy

| Data | Cache Location | TTL | Invalidation |
|------|---------------|-----|--------------|
| User session | Redis | 15 min | On logout / token refresh |
| Doctor profile (public) | Redis | 1 hour | On profile update |
| Available slots | Redis | 5 min | On booking / cancellation |
| Bot conversation context | Redis | 30 min | On session close |
| Report analysis results | Redis | 24 hours | On re-analysis |
| Search results | Redis | 10 min | Time-based |

---

## Security Implementation

### Data Encryption

```
At Rest:
├── PostgreSQL: TDE (Transparent Data Encryption)
├── S3/R2: SSE-S3 encryption
├── Redis: TLS + AUTH
└── Sensitive fields: Application-level AES-256-GCM
    ├── patient_profiles.medical_history
    ├── sessions.transcript
    ├── prescriptions.*
    └── health_reports.extracted_data

In Transit:
├── TLS 1.3 everywhere
├── Certificate pinning for mobile
└── HSTS headers
```

### Audit Logging

Every access to patient data is logged:

```typescript
interface AuditLog {
  actor_id: string;          // Who accessed
  actor_role: string;        // doctor / patient / admin
  action: string;            // read / write / delete / export
  resource_type: string;     // patient_profile / session / prescription
  resource_id: string;       // Specific record ID
  patient_id: string;        // Which patient's data
  ip_address: string;
  user_agent: string;
  timestamp: Date;
  details?: object;          // Additional context
}
```

### Consent Management

- Session recording requires explicit patient consent (recorded in DB)
- Data sharing requires consent per recipient
- Export actions logged with purpose
- Patient can request data deletion (GDPR Article 17)

---

## Error Handling

```typescript
// Standardized error response format
interface ApiError {
  status: number;
  code: string;           // "AUTH_INVALID_TOKEN", "SESSION_NOT_FOUND"
  message: string;        // Human-readable message
  details?: object;       // Validation errors, etc.
  request_id: string;     // For tracing
}

// Error codes by domain
enum ErrorCode {
  // Auth
  AUTH_INVALID_TOKEN = "AUTH_INVALID_TOKEN",
  AUTH_EXPIRED_TOKEN = "AUTH_EXPIRED_TOKEN",
  AUTH_INSUFFICIENT_ROLE = "AUTH_INSUFFICIENT_ROLE",
  
  // Session
  SESSION_NOT_FOUND = "SESSION_NOT_FOUND",
  SESSION_ALREADY_ENDED = "SESSION_ALREADY_ENDED",
  SESSION_NOT_CONFIRMED = "SESSION_NOT_CONFIRMED",
  
  // Prescription
  PRESCRIPTION_NOT_VERIFIED = "PRESCRIPTION_NOT_VERIFIED",
  
  // AI
  AI_TRANSCRIPTION_FAILED = "AI_TRANSCRIPTION_FAILED",
  AI_ANALYSIS_TIMEOUT = "AI_ANALYSIS_TIMEOUT",
  
  // Payment
  PAYMENT_FAILED = "PAYMENT_FAILED",
  PAYMENT_ALREADY_CAPTURED = "PAYMENT_ALREADY_CAPTURED",
}
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/docto
DATABASE_URL_REPLICA=postgresql://user:pass@replica:5432/docto

# Redis
REDIS_URL=redis://user:pass@host:6379

# Auth
NEXTAUTH_SECRET=<secret>
NEXTAUTH_URL=https://docto.in
GOOGLE_CLIENT_ID=<id>
GOOGLE_CLIENT_SECRET=<secret>

# AI Services
GEMINI_API_KEY=<key>
DRAGON_COPILOT_API_KEY=<key>
OPENAI_API_KEY=<key>  # For Whisper fallback
PINECONE_API_KEY=<key>
PINECONE_INDEX=docto-research

# Storage
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_S3_BUCKET=docto-files
AWS_REGION=ap-south-1

# Payments
RAZORPAY_KEY_ID=<key>
RAZORPAY_KEY_SECRET=<secret>
RAZORPAY_WEBHOOK_SECRET=<secret>

# Communications
TWILIO_ACCOUNT_SID=<sid>
TWILIO_AUTH_TOKEN=<token>
TWILIO_PHONE_NUMBER=<number>
SENDGRID_API_KEY=<key>

# Video (Teleconsultation)
DAILY_API_KEY=<key>

# Monitoring
SENTRY_DSN=<dsn>
POSTHOG_KEY=<key>
```

---

## Scaling Strategy

### Phase 1: Launch (0–1000 users)
- Single Next.js instance on Vercel
- PostgreSQL on Neon / Supabase
- Redis on Upstash
- S3 on Cloudflare R2

### Phase 2: Growth (1K–10K users)
- Vercel Pro with Edge Functions
- PostgreSQL with read replicas
- Dedicated Redis instance
- CDN for static assets

### Phase 3: Scale (10K+ users)
- Extract heavy services (transcription, AI) into separate APIs
- Kubernetes on AWS EKS
- PostgreSQL with connection pooling (PgBouncer)
- Message queue (RabbitMQ) for async jobs
- Horizontal scaling of API instances

---

> 📌 **This architecture supports rapid development while maintaining a clear path to scale. Every module is designed to be extractable into a microservice when needed.**
