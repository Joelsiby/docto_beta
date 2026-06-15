# 📋 Docto — Product Requirements Document (PRD)

> **Version:** 1.0  
> **Last Updated:** June 8, 2026  
> **Author:** Product Team  
> **Status:** Draft — Awaiting Team Review

---

## 1. Executive Summary

**Docto** is an AI-powered medical productivity platform with two distinct user profiles — **Doctors** and **Patients**. The platform eliminates tedious paperwork, automates clinical documentation, provides intelligent research tools, and creates a seamless bridge between healthcare providers and their patients.

> *"Save doctors time. Empower patients with clarity."*

### The Problem

- Doctors spend **~2 hours daily** on administrative paperwork and data entry
- Patients struggle to understand medical jargon in prescriptions, reports, and diagnoses
- Clinical documentation is error-prone and fragmented across systems
- Patients forget to take medications and lack tools to track compliance
- Scheduling and appointment management is scattered across multiple tools

### The Solution

A unified platform where:
- Doctors can **research, record, prescribe, and plan** — all in one place
- Patients can **book, understand, track, and communicate** — effortlessly
- An AI assistant (**Docto Bot**) acts as the intelligent bridge for both sides

---

## 2. Target Users

### 2.1 Primary: Doctors & Medical Professionals

| Attribute | Details |
|-----------|---------|
| **Who** | General practitioners, specialists, clinic owners |
| **Age Range** | 28–65 years |
| **Tech Comfort** | Low to moderate — they are NOT tech folks |
| **Pain Points** | Paperwork, data entry, fragmented tools, time management |
| **Goal** | Spend more time with patients, less time on admin |

### 2.2 Primary: Patients

| Attribute | Details |
|-----------|---------|
| **Who** | Anyone seeking medical care |
| **Age Range** | 18–75 years |
| **Tech Comfort** | Varies widely — must be extremely simple |
| **Pain Points** | Understanding diagnoses, remembering meds, tracking health |
| **Goal** | Understand their health, stay compliant, easy access to records |

---

## 3. Product Vision & Principles

### Vision Statement
> Make healthcare interactions **effortless for doctors** and **transparent for patients** through intelligent automation.

### Core Principles

1. **Zero Unnecessary Clicks** — Every action should take the fewest steps possible
2. **AI as Assistant, Not Replacement** — Docto Bot assists, never diagnoses independently
3. **Doctor Always Verifies** — All AI-generated content (transcriptions, prescriptions, summaries) must be verified by the doctor before becoming final
4. **Patient Clarity** — Everything shown to patients is in simple, understandable language
5. **Data Portability** — Medical data can be exported in standard formats (HL7 FHIR, CDA, PDF)
6. **Privacy First** — HIPAA/DISHA compliant, end-to-end encryption for all medical data

---

## 4. Feature Specifications

### 4.1 🩺 DOCTOR SIDE

---

#### 4.1.1 Research Hub

**Purpose:** Allow doctors to upload, read, and deeply understand medical research papers, articles, and documents.

**Input Methods:**
- PDF upload (drag & drop or file picker)
- Copy-paste paragraphs/text blocks
- Paste website URLs (auto-scrape and render)
- Drag & drop images (with OCR + analysis)

**Document Viewer Features:**

| Action | Trigger | Output |
|--------|---------|--------|
| **Word Selection** | Select a single word | Popup with: Definition, Meaning in context, Root/Etymology, Pronunciation (audio) |
| **Passage Selection** | Select multiple lines | Popup with: Summary, Function of selected text in the paper, Simplified version, Key takeaways (bullet points) |
| **Full Document** | Auto-generated on upload | Complete summary, Key takeaways, Image analysis, Section-by-section breakdown |

**Popup Behavior:**
- Small floating popup appears near the selection
- Non-blocking — doctor can continue reading
- Dismissible with click outside or X button
- Option to "Pin" the popup for reference
- Copy-to-clipboard on any section

**Image Analysis:**
- Diagrams, charts, medical images uploaded or embedded in PDFs
- AI provides: description, key data points, clinical relevance

---

#### 4.1.2 Docto Bot (AI Assistant)

**Purpose:** An AI-powered chatbot that serves as the central command center of the entire platform.

**Placement:** Persistent sidebar (collapsible) on all doctor-side pages.

**Capabilities:**
- Explain any paragraph or concept from uploaded research
- Summarize sessions, papers, patient histories
- Answer medical knowledge questions
- Modify todo lists and schedules via natural language
- Help draft referral letters
- Assist with prescription formatting

**Tone Settings (Doctor-selectable):**

| Tone | Description |
|------|-------------|
| 🎓 Professor | Academic, detailed, uses medical terminology with explanations |
| 👨‍⚕️ Senior Medical Professional | Peer-to-peer, concise, clinical language |
| 📚 Teacher | Simplified, educational, uses analogies |

**Key Rules:**
- Docto Bot does NOT independently diagnose patients
- All Bot-generated content is clearly labeled as AI-generated
- Bot can reference uploaded documents, session transcripts, and patient history (with appropriate access controls)

---

#### 4.1.3 Smart Planner (Todo / Schedule)

**Purpose:** Help doctors organize their professional and personal life with AI-assisted planning.

**Features:**
- **Input:** Doctors upload tasks, reminders, deadlines (text, voice, or via Docto Bot)
- **AI Planning:** System creates a balanced schedule considering:
  - Work commitments (appointments, surgeries, rounds)
  - Personal time (family, exercise, hobbies)
  - Buffer time for emergencies
  - Realistic time estimates
- **Views:** Daily, Weekly, Monthly views
- **Edit via Bot:** "Hey Docto, move my Monday meeting to Wednesday" → auto-updates
- **Reminders:** Push notifications, email, or in-app alerts
- **Categories:** Work, Personal, Urgent, Follow-up, Learning

**Smart Features:**
- Conflict detection (overlapping appointments)
- Workload balancing suggestions
- Weekly summary reports
- Integration with appointment system

---

#### 4.1.4 Appointment Management

**Purpose:** Manage patient appointment bookings — both teleconsultation and in-clinic visits.

**Features:**
- **Booking Types:**
  - 📹 Teleconsultation (video call)
  - 🏥 In-Clinic Visit
- **Triage Configuration:** Doctors define custom triage questions per appointment type
  - Example: "Rate your pain (1-10)", "How long have you had symptoms?", "Any allergies?"
- **Calendar View:** Day/Week/Month with color-coded appointment types
- **Slot Management:** Set available hours, break times, max patients per slot
- **Patient Queue:** Live queue view for in-clinic days
- **No-show Tracking:** Mark and track missed appointments

---

#### 4.1.5 Patient History & Records

**Purpose:** Complete view of a patient's medical journey on the platform.

**Access Points:**
- Search by patient name, ID, or phone number
- Click from appointment list

**History View:**
- Timeline of all visits (chronological)
- Per visit: Date, Type (tele/clinic), Summary, Diagnosis, Prescriptions, Referrals
- Uploaded documents (reports, scans, images)
- Session recordings (with timestamps)
- Prescription history
- Medication compliance data (from patient-side tracking)

---

#### 4.1.6 Clinical Session Recording & Documentation

**Purpose:** Record doctor-patient conversations, auto-generate clinical documentation.

**Flow:**

```
Doctor selects patient → Opens profile → Clicks "Start Session" 
→ Recording begins → Conversation is transcribed in real-time
→ AI extracts: Issues, Diagnosis, Referrals, Prescriptions
→ Doctor clicks "End Session" → Summary generated
→ Doctor reviews & verifies → Final documents generated
```

**Transcription Engine:**
- Primary: Microsoft Dragon Copilot (medical-grade, trained on clinical language)
- Fallback: WhisperFlow (open-source, customizable)
- Real-time transcription with speaker diarization (Doctor vs. Patient)

**Auto-Extracted Data:**

| Data | Format |
|------|--------|
| **Issues/Complaints** | Bullet list with severity markers |
| **Diagnosis** | ICD-10 coded (when possible) |
| **Referrals** | Specialist type + reason |
| **Prescriptions** | Structured table (see below) |

**Prescription Table Format:**

| # | Medicine Name | Dosage | When to Take | Timing | Meals | Duration | Notes |
|---|--------------|--------|-------------|--------|-------|----------|-------|
| 1 | Amoxicillin 500mg | 1 capsule | Morning, Afternoon, Night | 8am, 2pm, 9pm | After meals | 7 days | Take with warm water |
| 2 | Paracetamol 650mg | 1 tablet | As needed | When fever >100°F | Any | 5 days | Max 3 per day |

**Verification Step (CRITICAL):**
- Doctor sees full editable table after session ends
- Can edit any cell directly
- Can add rows manually (for prescriptions mentioned but not captured)
- Can delete incorrect entries
- Must explicitly click "Confirm & Generate" to finalize
- ⚠️ **No document is generated without doctor verification**

**Output Documents:**
- 📄 **Prescription PDF** — Formatted, branded, printable
- 🧾 **Invoice PDF** — With consultation fees, itemized
- 📊 **Session Summary** — For medical records

---

#### 4.1.7 Data Export & Interoperability

**Purpose:** Ensure data can be used in any hospital/clinical system without manual re-entry.

**Features:**
- Export to standard medical formats:
  - HL7 FHIR (JSON/XML)
  - CDA (Clinical Document Architecture)
  - CSV/Excel
  - Custom format mapping (hospital-specific templates)
- One-click export of patient records
- Batch export for compliance/auditing
- API for integration with Hospital Information Systems (HIS)
- Data format converter: "Convert to [X Hospital] format"

---

### 4.2 🧑‍🦱 PATIENT SIDE

---

#### 4.2.1 Doctor Discovery & Profiles

**Purpose:** Browse and view doctor profiles before booking.

**Profile Includes:**
- Doctor's name, photo, qualifications
- Specialization & experience
- Available appointment types (tele/clinic)
- Clinic location(s) with map
- Available slots
- Rating & reviews (future phase)

---

#### 4.2.2 Appointment Booking

**Purpose:** Book teleconsultation or in-clinic appointments.

**Flow:**
```
Select Doctor → Choose Type (Tele/Clinic) → Select Date & Time
→ Fill Triage Form (doctor-defined) → Confirm & Pay → Booking Confirmed
```

**Triage Integration:**
- Pre-appointment questionnaire defined by the doctor
- Responses visible to doctor before the session
- Helps doctor prepare and reduces session time

---

#### 4.2.3 Health Report Upload & Analysis

**Purpose:** Upload health reports (blood work, scans, etc.) and get intelligent analysis.

**Upload Types:**
- Blood count reports (CBC, lipid panel, etc.)
- Imaging reports (X-ray, MRI, CT scan summaries)
- Lab reports (urine, thyroid, diabetes panels)
- Any other diagnostic report (PDF/Image)

**Analysis Features:**

| Feature | Description |
|---------|-------------|
| **Parameter Breakdown** | Every value explained in plain language |
| **Normal vs. Yours** | Side-by-side comparison graph for each parameter |
| **Flagged Values** | Values outside normal range highlighted with explanation |
| **Visual Diagrams** | Charts showing where patient falls on the normal distribution |
| **Indian Reference Ranges** | Uses India-specific normal ranges where applicable |
| **Tips for Doctor Visit** | "Tell your doctor that you've been experiencing [X] — this could be related to your [low RBC]" |
| **Body Signals** | "You might have noticed [fatigue, dizziness] — this is common with low hemoglobin" |

> ⚠️ **Disclaimer always shown:** "This analysis is informational only. Always consult your doctor for diagnosis and treatment."

---

#### 4.2.4 Session & Records Access

**Purpose:** Patients can review their past sessions and all generated documents.

**Available to Patient:**
- Session recording (audio playback)
- Session summary (simplified language)
- Prescription PDF (downloadable)
- Invoice PDF (downloadable)
- Diagnosis summary
- Referral details

---

#### 4.2.5 Medication Tracker & Calendar

**Purpose:** Help patients take the right medicine at the right time — and make it fun.

**Features:**
- **Calendar View:** Visual daily timeline showing each medicine and time
- **Reminders:** Push notifications before each scheduled dose
- **Mark as Done:** Patient taps to confirm medicine taken
- **Progress Tracking:** Daily/weekly compliance percentage

**Gamification (GenZ Style 🎮):**

| Scenario | Result |
|----------|--------|
| ✅ All meds taken on time for the day | 🎉 "PERFECT DAY! You're on fire 🔥" + Progress streak |
| ✅ Full week streak | 🏆 Unlock discount coupon (X% off next consultation) |
| ❌ Missed a dose | 💀 "Oops! Your streak just died. RIP discount 🪦" |
| ❌ Missed timing (took late) | 😬 "Close but no cigar! You were 2 hours late. Coupon is toast 🍞" |
| 🔥 30-day streak | 🎊 "LEGENDARY! Your doctor will be proud. Here's a special reward!" |

**Rules:**
- Must mark within ±30 minutes of scheduled time
- Can't retroactively mark (no cheating!)
- Streak resets on any miss
- Discount coupons are real and applicable on next booking

---

#### 4.2.6 Patient Docto Bot

**Purpose:** AI assistant for patients to understand their medical information.

**Key Difference from Doctor Bot:**
- **ONLY answers based on what the doctor has said/documented**
- Does NOT independently diagnose or suggest treatments
- Re-frames medical information in simple language

**Capabilities:**
- "What did the doctor mean by [X]?"
- "Explain my prescription in Hindi"
- "What should I eat while taking this medicine?"
- "When is my next appointment?"
- Summarize previous session
- Explain report analysis in different language

**Multi-language Support:**
- Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, and more
- Auto-detect patient's preferred language

---

## 5. Additional Feature Ideas (For Consideration)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Voice Commands for Doctors** | "Docto, add Paracetamol 500mg twice daily" during sessions | High |
| **Drug Interaction Alerts** | Warn doctors if prescribed medicines interact negatively | High |
| **Auto-Follow-Up Scheduling** | After session, suggest follow-up date based on diagnosis | Medium |
| **Patient Vitals Dashboard** | Track BP, sugar, weight over time with graphs | Medium |
| **Family Profiles** | One patient account manages family members | Medium |
| **Emergency SOS** | Quick-dial emergency contacts or ambulance | Low |
| **Doctor-to-Doctor Referral Chat** | Secure messaging between referring doctors | Medium |
| **Offline Prescription Access** | Download prescriptions for offline viewing | High |
| **Smart Billing** | Auto-generate GST-compliant invoices | Medium |
| **Waiting Room Updates** | "You're #3 in queue, est. wait: 15 min" for clinic visits | Low |

---

## 6. Success Metrics

| Metric | Target (6 months) |
|--------|-------------------|
| Doctor onboarding | 500 active doctors |
| Patient registrations | 10,000 users |
| Avg. time saved per doctor/day | 45 minutes |
| Prescription accuracy (post-verification) | 99.5% |
| Patient medication compliance | 70% avg weekly |
| Session transcription accuracy | 95%+ |
| NPS Score (Doctors) | 60+ |
| NPS Score (Patients) | 50+ |

---

## 7. Compliance & Security

| Requirement | Standard |
|-------------|----------|
| Data Privacy (India) | DISHA (Digital Information Security in Healthcare Act) |
| Data Privacy (Global) | HIPAA, GDPR compliant architecture |
| Data Encryption | AES-256 at rest, TLS 1.3 in transit |
| Access Control | Role-based (Doctor, Patient, Admin) |
| Audit Logs | All data access logged and traceable |
| Consent | Explicit consent before session recording |
| Data Residency | Indian servers (primary), with geo-compliance |

---

## 8. Out of Scope (V1)

- Pharmacy integration (ordering medicines directly)
- Insurance claim processing
- Multi-clinic chain management
- Wearable device integration (smartwatches, etc.)
- Video call infrastructure (will use third-party integration)

---

## 9. Timeline Overview

| Phase | Duration | Focus |
|-------|----------|-------|
| **Phase 1: Foundation** | Weeks 1–6 | Auth, Doctor dashboard, Research hub, Docto Bot |
| **Phase 2: Clinical Core** | Weeks 7–12 | Session recording, Prescription generation, Patient records |
| **Phase 3: Patient Side** | Weeks 13–18 | Patient app, Report analysis, Medication tracker |
| **Phase 4: Intelligence** | Weeks 19–22 | Data export, Analytics, Gamification, Multi-language |
| **Phase 5: Polish & Launch** | Weeks 23–26 | Testing, Security audit, Beta launch |

---

> 📌 **Next Steps:** Review this PRD with the team → Finalize feature priorities → Begin technical architecture
