# 📊 Docto — Project Status Tracker

> **Last Updated:** June 8, 2026  
> **Sprint:** Pre-Development  
> **Overall Status:** 🟡 Planning Phase

---

## Project Overview

| Item | Details |
|------|---------|
| **Product Name** | Docto |
| **Project Start** | June 8, 2026 |
| **Target MVP Launch** | TBD (after team review) |
| **Team Size** | TBD |
| **Current Phase** | Documentation & Planning |

---

## Phase Tracker

| Phase | Name | Status | Start Date | End Date | Progress |
|-------|------|--------|------------|----------|----------|
| 0 | 📝 Documentation & Planning | 🟢 In Progress | Jun 8, 2026 | — | ██████████░░░░░░ 60% |
| 1 | 🏗️ Foundation (Auth, Dashboard, Research Hub, Bot) | ⚪ Not Started | — | — | ░░░░░░░░░░░░░░░░ 0% |
| 2 | 🏥 Clinical Core (Session, Prescriptions, Records) | 🔵 In Progress | Jun 14, 2026 | — | ████████░░░░░░░░ 50% |
| 3 | 🧑 Patient Side (App, Reports, Medication Tracker) | ⚪ Not Started | — | — | ░░░░░░░░░░░░░░░░ 0% |
| 4 | 🧠 Intelligence (Export, Analytics, Gamification) | ⚪ Not Started | — | — | ░░░░░░░░░░░░░░░░ 0% |
| 5 | ✨ Polish & Launch (Testing, Security, Beta) | ⚪ Not Started | — | — | ░░░░░░░░░░░░░░░░ 0% |

---

## Documentation Status

| Document | Status | Owner | Last Updated |
|----------|--------|-------|-------------|
| [prd.md](./prd.md) | ✅ Complete (Draft) | Product | Jun 8, 2026 |
| [techstack.md](./techstack.md) | ✅ Complete (Draft) | Engineering | Jun 8, 2026 |
| [flow.md](./flow.md) | ✅ Complete (Draft) | Product/Design | Jun 8, 2026 |
| [frontend.md](./frontend.md) | ✅ Complete (Draft) | Frontend | Jun 8, 2026 |
| [backend.md](./backend.md) | ✅ Complete (Draft) | Backend | Jun 8, 2026 |
| [requirements.md](./requirements.md) | ✅ Complete (Draft) | Product | Jun 8, 2026 |
| [status.md](./status.md) | ✅ Complete (Draft) | PM | Jun 8, 2026 |
| Figma Designs | ⚪ Not Started | Design | — |
| API Documentation | ⚪ Not Started | Backend | — |
| Deployment Guide | ⚪ Not Started | DevOps | — |

---

## Feature Development Tracker

### 🩺 Doctor Side Features

| Feature | Status | Assigned To | Sprint | Notes |
|---------|--------|------------|--------|-------|
| **Auth & Onboarding** | | | | |
| ├─ Email/Password Registration | ⚪ Not Started | — | — | |
| ├─ Google OAuth | ⚪ Not Started | — | — | |
| ├─ Phone OTP | ⚪ Not Started | — | — | |
| ├─ Doctor Profile Setup | ⚪ Not Started | — | — | |
| └─ Medical License Verification | ⚪ Not Started | — | — | |
| **Research Hub** | | | | |
| ├─ PDF Upload & Parsing | ⚪ Not Started | — | — | |
| ├─ Text Paste Input | ⚪ Not Started | — | — | |
| ├─ URL Scraping | ⚪ Not Started | — | — | |
| ├─ Document Viewer | ⚪ Not Started | — | — | |
| ├─ Word Selection Popup | ⚪ Not Started | — | — | |
| ├─ Passage Selection Popup | ⚪ Not Started | — | — | |
| ├─ Full Document Summary | ⚪ Not Started | — | — | |
| └─ Image Analysis | ⚪ Not Started | — | — | |
| **Docto Bot (Doctor)** | | | | |
| ├─ Chat Interface (Sidebar) | ⚪ Not Started | — | — | |
| ├─ Tone Selection | ⚪ Not Started | — | — | |
| ├─ Research Context Awareness | ⚪ Not Started | — | — | |
| ├─ Planner Integration | ⚪ Not Started | — | — | |
| └─ Streaming Responses | ⚪ Not Started | — | — | |
| **Smart Planner** | | | | |
| ├─ Task CRUD | ⚪ Not Started | — | — | |
| ├─ AI Schedule Generation | ⚪ Not Started | — | — | |
| ├─ Day/Week/Month Views | ⚪ Not Started | — | — | |
| ├─ Bot-driven Editing | ⚪ Not Started | — | — | |
| ├─ Conflict Detection | ⚪ Not Started | — | — | |
| └─ Appointment Sync | ⚪ Not Started | — | — | |
| **Appointment Management** | | | | |
| ├─ Slot Configuration | ⚪ Not Started | — | — | |
| ├─ Triage Question Builder | ⚪ Not Started | — | — | |
| ├─ Appointment Queue View | ⚪ Not Started | — | — | |
| ├─ Calendar View | ⚪ Not Started | — | — | |
| └─ No-show Tracking | ⚪ Not Started | — | — | |
| **Clinical Session** | | | | |
| ├─ Session Start/End Flow | 🟢 Completed | AI Agent | Sprint 1 | |
| ├─ Audio Recording | 🟢 Completed | AI Agent | Sprint 1 | Basic |
| ├─ Real-time Transcription | 🟢 Completed | AI Agent | Sprint 1 | Basic |
| ├─ Speaker Diarization | 🟢 Completed | AI Agent | Sprint 1 | Heuristics |
| ├─ AI Data Extraction | 🟢 Completed | AI Agent | Sprint 1 | LLaMA 3.1 |
| ├─ Prescription Table (Editable) | 🟢 Completed | AI Agent | Sprint 1 | |
| ├─ Doctor Verification Step | 🟢 Completed | AI Agent | Sprint 1 | |
| ├─ Prescription PDF Generation | ⚪ Not Started | — | — | |
| ├─ Invoice PDF Generation | ⚪ Not Started | — | — | |
| └─ Session Summary Storage | 🟢 Completed | AI Agent | Sprint 1 | Supabase |
| **Patient History** | | | | |
| ├─ Patient Search | ⚪ Not Started | — | — | |
| ├─ Visit Timeline | ⚪ Not Started | — | — | |
| └─ Document Access | ⚪ Not Started | — | — | |
| **Data Export** | | | | |
| ├─ FHIR R4 Export | ⚪ Not Started | — | — | |
| ├─ CSV/Excel Export | ⚪ Not Started | — | — | |
| ├─ PDF Export | ⚪ Not Started | — | — | |
| └─ Custom Template Mapping | ⚪ Not Started | — | — | |

### 🧑 Patient Side Features

| Feature | Status | Assigned To | Sprint | Notes |
|---------|--------|------------|--------|-------|
| **Patient Auth & Onboarding** | | | | |
| ├─ Phone OTP Registration | ⚪ Not Started | — | — | |
| ├─ Basic Profile Setup | ⚪ Not Started | — | — | |
| └─ Language Preference | ⚪ Not Started | — | — | |
| **Doctor Discovery** | | | | |
| ├─ Doctor Search/Browse | ⚪ Not Started | — | — | |
| └─ Doctor Profile View | ⚪ Not Started | — | — | |
| **Appointment Booking** | | | | |
| ├─ Slot Selection | ⚪ Not Started | — | — | |
| ├─ Triage Form | ⚪ Not Started | — | — | |
| ├─ Payment (Razorpay) | ⚪ Not Started | — | — | |
| ├─ Booking Confirmation | ⚪ Not Started | — | — | |
| └─ Appointment Reminders | ⚪ Not Started | — | — | |
| **Health Reports** | | | | |
| ├─ Report Upload (PDF/Image) | ⚪ Not Started | — | — | |
| ├─ OCR Processing | ⚪ Not Started | — | — | |
| ├─ AI Analysis Dashboard | ⚪ Not Started | — | — | |
| ├─ Normal vs Patient Graphs | ⚪ Not Started | — | — | |
| ├─ Body Signals & Tips | ⚪ Not Started | — | — | |
| └─ Disclaimer Display | ⚪ Not Started | — | — | |
| **Session Records** | | | | |
| ├─ Session Summary View | ⚪ Not Started | — | — | |
| ├─ Prescription PDF Download | ⚪ Not Started | — | — | |
| ├─ Invoice PDF Download | ⚪ Not Started | — | — | |
| └─ Audio Playback | ⚪ Not Started | — | — | |
| **Medication Tracker** | | | | |
| ├─ Auto-generated Med Calendar | ⚪ Not Started | — | — | |
| ├─ Push Notifications | ⚪ Not Started | — | — | |
| ├─ Mark as Done Button | ⚪ Not Started | — | — | |
| ├─ On-time Validation (±30 min) | ⚪ Not Started | — | — | |
| ├─ Streak Tracking | ⚪ Not Started | — | — | |
| ├─ Gamification Messages | ⚪ Not Started | — | — | |
| └─ Discount Coupon System | ⚪ Not Started | — | — | |
| **Patient Docto Bot** | | | | |
| ├─ Chat Interface | ⚪ Not Started | — | — | |
| ├─ Doctor-notes-only Restriction | ⚪ Not Started | — | — | |
| ├─ Multi-language Support | ⚪ Not Started | — | — | |
| └─ Session Context Awareness | ⚪ Not Started | — | — | |

### 🔧 Infrastructure & Cross-Cutting

| Feature | Status | Assigned To | Sprint | Notes |
|---------|--------|------------|--------|-------|
| Project Setup (Next.js + TypeScript) | ⚪ Not Started | — | — | |
| Database Schema (Prisma) | ⚪ Not Started | — | — | |
| Redis Setup | ⚪ Not Started | — | — | |
| S3/R2 Storage Setup | ⚪ Not Started | — | — | |
| CI/CD Pipeline (GitHub Actions) | ⚪ Not Started | — | — | |
| Error Monitoring (Sentry) | ⚪ Not Started | — | — | |
| Analytics (PostHog) | ⚪ Not Started | — | — | |
| Security Audit | ⚪ Not Started | — | — | |
| Load Testing | ⚪ Not Started | — | — | |
| E2E Tests (Playwright) | ⚪ Not Started | — | — | |

---

## Risk Register

| ID | Risk | Impact | Likelihood | Mitigation | Status |
|----|------|--------|------------|------------|--------|
| R1 | Dragon Copilot API costs too high | High | Medium | WhisperFlow as fallback, negotiate volume pricing | 🟡 Monitor |
| R2 | Medical transcription accuracy below 95% | Critical | Medium | Multi-pass validation, mandatory doctor verification | 🟡 Monitor |
| R3 | HIPAA/DISHA compliance complexity | High | High | Engage compliance consultant early | 🔴 Action Needed |
| R4 | AI hallucination in patient-facing bot | Critical | Medium | Strict guardrails, only doctor-documented data | 🟡 Monitor |
| R5 | Low doctor adoption (too complex) | High | Medium | Extensive UX testing with doctors, simplify onboarding | 🟡 Monitor |
| R6 | Data breach / security incident | Critical | Low | Encryption, audit logs, security audits, pen testing | 🟡 Monitor |
| R7 | Payment integration delays | Medium | Low | Start Razorpay integration early | ⚪ Not Started |
| R8 | Scalability issues with real-time transcription | High | Medium | Queue-based processing, edge deployment | 🟡 Monitor |

---

## Team & Roles (To Be Filled)

| Role | Name | Responsibilities |
|------|------|-----------------|
| Product Manager | — | PRD, requirements, prioritization, stakeholder management |
| Tech Lead | — | Architecture decisions, code reviews, technical direction |
| Frontend Dev 1 | — | Doctor dashboard, Research Hub, Smart Planner |
| Frontend Dev 2 | — | Patient app, Medication Tracker, Report Analysis |
| Backend Dev 1 | — | Auth, Appointments, Sessions, Database |
| Backend Dev 2 | — | AI services, Bot, Transcription, Export |
| UI/UX Designer | — | Figma designs, design system, user testing |
| QA Engineer | — | Testing strategy, automation, security testing |
| DevOps | — | Infrastructure, CI/CD, monitoring, security |

---

## Key Decisions Log

| Date | Decision | Rationale | Decided By |
|------|----------|-----------|------------|
| Jun 8, 2026 | Use Next.js (monolith-first) | Faster development, shared types, extract services later | Team |
| Jun 8, 2026 | PostgreSQL over MongoDB | Medical data is relational, ACID compliance critical | Team |
| Jun 8, 2026 | Dragon Copilot as primary STT | Medical-grade accuracy, trained on clinical terminology | Team |
| Jun 8, 2026 | Gemini as primary LLM | Multimodal capabilities, large context, competitive pricing | Team |
| Jun 8, 2026 | India-first launch | Target market, regulatory compliance focus | Team |

---

## Meeting Notes

### Kickoff Meeting — June 8, 2026
- **Attendees:** TBD
- **Agenda:** Product vision review, documentation walkthrough
- **Action Items:**
  - [ ] Review all documentation files
  - [ ] Finalize team assignments
  - [ ] Set up development environment
  - [ ] Schedule Figma design kickoff
  - [ ] Set sprint cadence and ceremonies
  - [ ] Engage HIPAA/DISHA compliance consultant

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ⚪ | Not Started |
| 🔵 | In Progress |
| 🟢 | Completed |
| 🟡 | Needs Attention / Monitoring |
| 🔴 | Blocked / Action Required |
| ⏸️ | Paused |

---

## How to Update This Document

1. Update feature statuses as work progresses
2. Fill in "Assigned To" and "Sprint" columns during sprint planning
3. Add meeting notes after each key meeting
4. Update risk register when new risks are identified
5. Log all key decisions with rationale
6. Update phase progress bars at end of each sprint

---

> 📌 **This is a living document. Update it regularly to keep the team aligned.**
