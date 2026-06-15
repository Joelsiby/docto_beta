# 📌 Docto — Requirements Specification

> **Version:** 1.0  
> **Last Updated:** June 8, 2026  
> **Status:** Draft

---

## 1. Functional Requirements

### 1.1 Authentication & User Management

| ID | Requirement | Priority | User |
|----|------------|----------|------|
| AUTH-001 | Users can register with email + password | P0 | Both |
| AUTH-002 | Users can register/login with Google OAuth | P0 | Both |
| AUTH-003 | Users can register/login with Phone + OTP | P0 | Both |
| AUTH-004 | System assigns role (Doctor/Patient) during registration | P0 | Both |
| AUTH-005 | Doctor must provide medical license number during signup | P0 | Doctor |
| AUTH-006 | Password reset via email and phone OTP | P0 | Both |
| AUTH-007 | Session management with JWT + refresh tokens | P0 | Both |
| AUTH-008 | Profile editing (name, photo, preferences) | P1 | Both |
| AUTH-009 | Account deactivation and data deletion request | P2 | Both |
| AUTH-010 | Two-factor authentication (optional) | P2 | Both |

---

### 1.2 Research Hub (Doctor)

| ID | Requirement | Priority |
|----|------------|----------|
| RES-001 | Upload PDF files via drag-and-drop or file picker | P0 |
| RES-002 | Paste text/paragraphs directly into the viewer | P0 |
| RES-003 | Paste website URL and auto-extract content | P1 |
| RES-004 | Upload images with OCR text extraction | P1 |
| RES-005 | Render uploaded document in a readable viewer | P0 |
| RES-006 | Select a single word → show popup with definition, context meaning, root/etymology, pronunciation | P0 |
| RES-007 | Select a passage → show popup with summary, function in paper, simplified version, key takeaways | P0 |
| RES-008 | Popup is non-blocking, dismissible, pinnable, and supports copy-to-clipboard | P0 |
| RES-009 | Auto-generate full document summary upon upload | P0 |
| RES-010 | Auto-generate key takeaways as bullet points | P0 |
| RES-011 | Analyze embedded images (charts, diagrams, medical images) | P1 |
| RES-012 | Bookmark/save research documents for later | P1 |
| RES-013 | Search through previously uploaded documents | P2 |

---

### 1.3 Docto Bot (AI Assistant)

| ID | Requirement | Priority | User |
|----|------------|----------|------|
| BOT-001 | Persistent sidebar chat interface on all pages | P0 | Doctor |
| BOT-002 | Full-screen chat interface for patients | P0 | Patient |
| BOT-003 | Bot can answer questions about uploaded research documents | P0 | Doctor |
| BOT-004 | Bot can explain paragraphs, summarize content | P0 | Doctor |
| BOT-005 | Doctor can select tone: Professor, Senior Medical Professional, Teacher | P0 | Doctor |
| BOT-006 | Bot can modify Smart Planner via natural language commands | P1 | Doctor |
| BOT-007 | Bot can pull patient history when requested by doctor | P1 | Doctor |
| BOT-008 | Patient bot ONLY answers based on doctor-documented information | P0 | Patient |
| BOT-009 | Patient bot does NOT independently diagnose or suggest treatments | P0 | Patient |
| BOT-010 | Patient bot supports multi-language responses | P1 | Patient |
| BOT-011 | Bot responses are clearly labeled as AI-generated | P0 | Both |
| BOT-012 | Bot supports streaming responses (SSE) | P0 | Both |
| BOT-013 | Chat history is persistent and searchable | P1 | Both |
| BOT-014 | Bot can help draft referral letters | P2 | Doctor |

---

### 1.4 Smart Planner (Doctor)

| ID | Requirement | Priority |
|----|------------|----------|
| PLN-001 | Add tasks manually with title, date, time, category, priority | P0 |
| PLN-002 | AI generates balanced schedule from inputs | P0 |
| PLN-003 | View tasks in Day, Week, Month views | P0 |
| PLN-004 | Edit tasks via Docto Bot natural language | P1 |
| PLN-005 | Drag-and-drop task rearrangement | P1 |
| PLN-006 | Categories: Work, Personal, Urgent, Follow-up, Learning | P0 |
| PLN-007 | Conflict detection for overlapping appointments | P0 |
| PLN-008 | Push notification reminders for tasks | P1 |
| PLN-009 | Auto-sync appointments into planner | P1 |
| PLN-010 | Weekly summary report (email + in-app) | P2 |
| PLN-011 | Workload balancing suggestions | P2 |
| PLN-012 | Recurring tasks support | P2 |

---

### 1.5 Appointment Management

| ID | Requirement | Priority | User |
|----|------------|----------|------|
| APT-001 | Doctor defines available time slots | P0 | Doctor |
| APT-002 | Doctor sets appointment duration (15/30/45/60 min) | P0 | Doctor |
| APT-003 | Doctor configures triage questions per appointment type | P0 | Doctor |
| APT-004 | Patient can browse/search doctors | P0 | Patient |
| APT-005 | Patient can view doctor profile (qualifications, specialization, fees) | P0 | Patient |
| APT-006 | Patient can book teleconsultation appointment | P0 | Patient |
| APT-007 | Patient can book in-clinic visit appointment | P0 | Patient |
| APT-008 | Patient fills triage form before appointment | P0 | Patient |
| APT-009 | Payment processing via Razorpay for booking | P0 | Patient |
| APT-010 | Booking confirmation via SMS + email + in-app | P0 | Patient |
| APT-011 | Doctor sees daily appointment queue | P0 | Doctor |
| APT-012 | Calendar view (day/week/month) for doctors | P0 | Doctor |
| APT-013 | Cancel/reschedule appointments | P1 | Both |
| APT-014 | Appointment reminders (24h + 1h before) | P1 | Patient |
| APT-015 | No-show tracking | P2 | Doctor |
| APT-016 | Waiting room status for clinic visits | P2 | Patient |

---

### 1.6 Clinical Session & Documentation

| ID | Requirement | Priority |
|----|------------|----------|
| SES-001 | Doctor selects patient and opens their profile | P0 |
| SES-002 | "Start Session" button initiates recording | P0 |
| SES-003 | Real-time audio transcription during session | P0 |
| SES-004 | Speaker diarization (Doctor vs Patient) | P1 |
| SES-005 | AI extracts issues/complaints from transcript | P0 |
| SES-006 | AI extracts diagnosis with ICD-10 coding (when possible) | P0 |
| SES-007 | AI extracts referrals (specialist + reason) | P0 |
| SES-008 | AI generates prescription table from transcript | P0 |
| SES-009 | Prescription table includes: medicine, dosage, timing, meals, duration, notes | P0 |
| SES-010 | "End Session" stops recording and shows summary | P0 |
| SES-011 | Doctor can edit any cell in the prescription table | P0 |
| SES-012 | Doctor can manually add/delete prescription rows | P0 |
| SES-013 | Doctor must explicitly confirm before document generation | P0 |
| SES-014 | Generate formatted prescription PDF | P0 |
| SES-015 | Generate itemized invoice PDF | P0 |
| SES-016 | Generate session summary for medical records | P0 |
| SES-017 | Session recording stored securely (S3) | P0 |
| SES-018 | Patient consent required before recording starts | P0 |

---

### 1.7 Patient History & Records

| ID | Requirement | Priority | User |
|----|------------|----------|------|
| HIS-001 | Doctor can search patients by name, ID, or phone | P0 | Doctor |
| HIS-002 | Timeline view of all patient visits | P0 | Doctor |
| HIS-003 | Per-visit details: date, type, summary, diagnosis, prescriptions | P0 | Doctor |
| HIS-004 | View uploaded patient documents and reports | P0 | Doctor |
| HIS-005 | View session recordings with timestamps | P1 | Doctor |
| HIS-006 | Patient can view own session summaries | P0 | Patient |
| HIS-007 | Patient can download prescription PDFs | P0 | Patient |
| HIS-008 | Patient can download invoice PDFs | P0 | Patient |
| HIS-009 | Patient can listen to session recordings | P1 | Patient |

---

### 1.8 Health Report Analysis (Patient)

| ID | Requirement | Priority |
|----|------------|----------|
| RPT-001 | Upload health reports as PDF or image | P0 |
| RPT-002 | OCR extraction for scanned/photographed reports | P0 |
| RPT-003 | AI identifies report parameters and values | P0 |
| RPT-004 | Compare each parameter against normal reference ranges | P0 |
| RPT-005 | Use India-specific reference ranges where applicable | P1 |
| RPT-006 | Visual graph: Normal vs Patient value per parameter | P0 |
| RPT-007 | Highlight and explain flagged (abnormal) values | P0 |
| RPT-008 | Plain language explanation of each parameter | P0 |
| RPT-009 | "Body Signals" — potential symptoms the patient may be experiencing | P1 |
| RPT-010 | "Tips for Doctor" — things to mention during next visit | P1 |
| RPT-011 | Disclaimer: "This is informational only. Consult your doctor." | P0 |
| RPT-012 | Ask Docto Bot for further explanation of any parameter | P1 |

---

### 1.9 Medication Tracker & Gamification (Patient)

| ID | Requirement | Priority |
|----|------------|----------|
| MED-001 | Auto-generate medication calendar from prescriptions | P0 |
| MED-002 | Daily timeline view of scheduled medications | P0 |
| MED-003 | Push notification reminders before each dose | P0 |
| MED-004 | Patient can mark medication as "Done" | P0 |
| MED-005 | On-time validation: must mark within ±30 minutes of schedule | P1 |
| MED-006 | No retroactive marking (can't mark past doses) | P1 |
| MED-007 | Track medication compliance percentage | P0 |
| MED-008 | Streak tracking — consecutive days of full compliance | P0 |
| MED-009 | GenZ-style fun messages for streak milestones | P1 |
| MED-010 | Discount coupon earned at 7-day streak (5% off) | P1 |
| MED-011 | Better discount at 14-day streak (10% off) | P1 |
| MED-012 | Special reward at 30-day streak (20% off) | P1 |
| MED-013 | Streak resets on any missed dose | P1 |
| MED-014 | Discount coupon applicable on next appointment booking | P1 |
| MED-015 | Fun "RIP" message when streak is broken | P1 |

---

### 1.10 Data Export & Interoperability

| ID | Requirement | Priority |
|----|------------|----------|
| EXP-001 | Export patient records in HL7 FHIR (R4) format | P1 |
| EXP-002 | Export in CDA (Clinical Document Architecture) format | P2 |
| EXP-003 | Export as CSV/Excel | P0 |
| EXP-004 | Export as PDF | P0 |
| EXP-005 | Custom format mapping for hospital-specific templates | P1 |
| EXP-006 | One-click export of single patient's complete records | P0 |
| EXP-007 | Batch export for multiple patients | P1 |
| EXP-008 | Export logs for compliance auditing | P1 |

---

## 2. Non-Functional Requirements

### 2.1 Performance

| ID | Requirement | Target |
|----|------------|--------|
| PERF-001 | Page load time (First Contentful Paint) | < 1.2 seconds |
| PERF-002 | API response time (95th percentile) | < 500ms |
| PERF-003 | Real-time transcription latency | < 2 seconds |
| PERF-004 | AI summary generation time | < 10 seconds |
| PERF-005 | PDF generation time | < 5 seconds |
| PERF-006 | Concurrent users supported | 1,000+ |
| PERF-007 | Uptime SLA | 99.9% |
| PERF-008 | Database query time (95th percentile) | < 100ms |

### 2.2 Security

| ID | Requirement | Standard |
|----|------------|----------|
| SEC-001 | All data encrypted at rest | AES-256 |
| SEC-002 | All data encrypted in transit | TLS 1.3 |
| SEC-003 | Role-based access control (RBAC) | Custom |
| SEC-004 | Audit logging for all patient data access | HIPAA |
| SEC-005 | HIPAA-compliant data handling | HIPAA |
| SEC-006 | DISHA-compliant data handling (India) | DISHA |
| SEC-007 | GDPR data subject rights support | GDPR |
| SEC-008 | Explicit consent before session recording | Legal |
| SEC-009 | Password hashing with bcrypt (12+ rounds) | OWASP |
| SEC-010 | Rate limiting on all API endpoints | Security |
| SEC-011 | CSRF protection on all forms | OWASP |
| SEC-012 | SQL injection prevention (ORM + parameterized queries) | OWASP |
| SEC-013 | XSS prevention (content sanitization) | OWASP |
| SEC-014 | Regular security audits (quarterly) | Compliance |
| SEC-015 | Vulnerability scanning (automated) | DevSecOps |

### 2.3 Scalability

| ID | Requirement | Details |
|----|------------|---------|
| SCL-001 | Horizontal scaling of application servers | Auto-scaling |
| SCL-002 | Database read replicas for heavy queries | PostgreSQL |
| SCL-003 | CDN for static assets | Vercel/Cloudflare |
| SCL-004 | Object storage scaling for files | S3/R2 |
| SCL-005 | Queue-based processing for heavy operations | BullMQ |

### 2.4 Reliability

| ID | Requirement | Details |
|----|------------|---------|
| REL-001 | Automated database backups | Daily, 30-day retention |
| REL-002 | Point-in-time recovery for database | Within 7 days |
| REL-003 | Disaster recovery plan | RTO: 4h, RPO: 1h |
| REL-004 | Graceful degradation when AI services fail | Fallback to manual |
| REL-005 | Automatic retry for failed transcriptions | 3 retries with backoff |
| REL-006 | File upload resume capability | Multipart upload |

### 2.5 Usability

| ID | Requirement | Details |
|----|------------|---------|
| USA-001 | Mobile-responsive design | All pages |
| USA-002 | WCAG 2.1 AA accessibility compliance | All pages |
| USA-003 | Support for screen readers | ARIA labels |
| USA-004 | Keyboard navigation support | All interactive elements |
| USA-005 | Maximum 3-click depth for any action | Navigation |
| USA-006 | Multi-language support (8+ Indian languages) | Patient side |
| USA-007 | Offline access to downloaded prescriptions | Patient side |
| USA-008 | Touch-friendly interface (44px minimum targets) | Mobile |

### 2.6 Compliance & Legal

| ID | Requirement | Details |
|----|------------|---------|
| CMP-001 | Terms of Service and Privacy Policy displayed | Legal |
| CMP-002 | Cookie consent management | GDPR |
| CMP-003 | Data processing agreements with third parties | Legal |
| CMP-004 | Patient data residency in India (primary) | DISHA |
| CMP-005 | Right to data portability | GDPR |
| CMP-006 | Right to erasure (data deletion) | GDPR |
| CMP-007 | Medical disclaimer on all AI-generated content | Legal |
| CMP-008 | Recording consent management and storage | Legal |

---

## 3. Integration Requirements

| ID | Integration | Type | Priority |
|----|------------|------|----------|
| INT-001 | Razorpay Payment Gateway | REST API | P0 |
| INT-002 | Twilio / MSG91 (SMS + OTP) | REST API | P0 |
| INT-003 | SendGrid / Resend (Email) | REST API | P0 |
| INT-004 | Google OAuth 2.0 | OAuth | P0 |
| INT-005 | Microsoft Dragon Copilot | REST/WebSocket | P0 |
| INT-006 | OpenAI Whisper (Fallback STT) | REST API | P1 |
| INT-007 | Google Gemini (LLM) | REST API | P0 |
| INT-008 | Pinecone (Vector DB) | REST API | P0 |
| INT-009 | Daily.co / Twilio (Video) | SDK | P0 |
| INT-010 | Firebase Cloud Messaging | REST API | P1 |
| INT-011 | Google Calendar Sync | REST API | P2 |
| INT-012 | WhatsApp Business API | REST API | P2 |
| INT-013 | Google Vision AI (OCR) | REST API | P1 |

---

## 4. Data Requirements

### 4.1 Data Retention

| Data Type | Retention Period | Reasoning |
|-----------|-----------------|-----------|
| Patient medical records | 10 years | Legal requirement (India) |
| Session recordings | 5 years | Medical audit trail |
| Prescriptions | 10 years | Legal requirement |
| Appointment records | 5 years | Business analytics |
| Chat history (Bot) | 1 year | Storage optimization |
| Research documents | Indefinite (doctor owns) | User data |
| Payment records | 7 years | Tax compliance (India) |
| Audit logs | 3 years | Compliance |
| Notification logs | 90 days | Storage optimization |

### 4.2 Data Volume Estimates (Year 1)

| Data Type | Estimated Volume |
|-----------|-----------------|
| Users (total) | 10,000 |
| Doctor profiles | 500 |
| Patient profiles | 9,500 |
| Appointments (total) | 50,000 |
| Sessions (with recording) | 30,000 |
| Session recordings (audio) | 30,000 files (~5TB) |
| Prescriptions | 30,000 |
| Health reports | 20,000 |
| Research documents | 5,000 |
| Bot messages | 500,000 |
| Notifications | 1,000,000 |

---

## 5. Hardware & Infrastructure Requirements

| Component | Specification | Environment |
|-----------|--------------|-------------|
| App Servers | 2 vCPU, 4GB RAM minimum | Production |
| Database | 4 vCPU, 16GB RAM, 500GB SSD | Production |
| Redis | 2 vCPU, 4GB RAM | Production |
| File Storage | 10TB initial capacity | Production |
| Dev Server | 2 vCPU, 4GB RAM | Development |
| Dev Database | 2 vCPU, 8GB RAM, 100GB SSD | Development |

---

## 6. Testing Requirements

| Type | Coverage Target | Tools |
|------|----------------|-------|
| Unit Tests | 80% code coverage | Vitest |
| Integration Tests | All API endpoints | Vitest + Supertest |
| E2E Tests | Critical user flows | Playwright |
| Performance Tests | Key APIs under load | k6 / Artillery |
| Security Tests | OWASP Top 10 | OWASP ZAP |
| Accessibility Tests | WCAG 2.1 AA | axe-core |
| AI Output Tests | Prescription accuracy benchmarks | Custom suite |

### Critical E2E Test Scenarios

1. Doctor registration → Profile setup → First login
2. Patient registration → Book appointment → Pay → Confirmation
3. Doctor starts session → Recording → End → Verify → Generate PDFs
4. Patient uploads report → Analysis generated → View results
5. Medication tracking → Mark as done → Streak update → Discount earned
6. Bot conversation (Doctor) → Research context → Answer generated
7. Bot conversation (Patient) → Session context → Restricted answer
8. Data export → FHIR format → Validate output

---

> 📌 **Priority Legend:** P0 = Must-have for MVP, P1 = Should-have for launch, P2 = Nice-to-have (post-launch)
