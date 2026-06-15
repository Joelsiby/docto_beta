# 🔧 Docto — Technology Stack

> **Version:** 1.0  
> **Last Updated:** June 8, 2026  
> **Status:** Proposed — Pending Team Review

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────┐  │
│  │   Doctor Web App  │    │  Patient Web App  │    │  Mobile PWA  │  │
│  │   (Next.js 15+)   │    │  (Next.js 15+)    │    │  (React PWA) │  │
│  └────────┬─────────┘    └────────┬─────────┘    └──────┬───────┘  │
│           │                       │                      │          │
├───────────┼───────────────────────┼──────────────────────┼──────────┤
│           │              API GATEWAY LAYER                │          │
│           └───────────────┐       │       ┌──────────────┘          │
│                       ┌───┴───────┴───────┴───┐                     │
│                       │    API Gateway (Kong)   │                    │
│                       │  + Rate Limiting + Auth  │                   │
│                       └───────────┬─────────────┘                   │
├───────────────────────────────────┼─────────────────────────────────┤
│                         SERVICE LAYER                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ Auth     │  │ Research │  │ Clinical │  │ Patient  │           │
│  │ Service  │  │ Service  │  │ Session  │  │ Service  │           │
│  │          │  │          │  │ Service  │  │          │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ Docto    │  │ Schedule │  │ Billing  │  │ Export   │           │
│  │ Bot AI   │  │ Service  │  │ Service  │  │ Service  │           │
│  │          │  │          │  │          │  │          │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
├─────────────────────────────────────────────────────────────────────┤
│                        DATA LAYER                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │PostgreSQL│  │  Redis   │  │   S3 /   │  │ Pinecone │           │
│  │(Primary) │  │ (Cache)  │  │Cloudflare│  │(Vectors) │           │
│  │          │  │          │  │  R2      │  │          │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Stack

### Core Framework

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 15+ (App Router) | Full-stack React framework — SSR, API routes, middleware |
| **React** | 19+ | UI library with Server Components |
| **TypeScript** | 5.x | Type safety across the entire codebase |

### UI & Styling

| Technology | Purpose |
|-----------|---------|
| **Tailwind CSS** | Utility-first CSS framework for rapid UI development |
| **Radix UI** | Headless, accessible component primitives |
| **Framer Motion** | Animations and transitions |
| **Lucide Icons** | Consistent, beautiful icon set |
| **Recharts** | Patient health graphs and data visualization |

### State & Data Fetching

| Technology | Purpose |
|-----------|---------|
| **TanStack Query (React Query)** | Server state management, caching, background sync |
| **Zustand** | Lightweight client-side state (UI state, bot state) |
| **React Hook Form + Zod** | Form management and validation |

### Real-Time & Communication

| Technology | Purpose |
|-----------|---------|
| **Socket.io Client** | Real-time updates (appointment queue, notifications) |
| **Daily.co / Twilio** | Video calling for teleconsultation |

### Document Handling

| Technology | Purpose |
|-----------|---------|
| **PDF.js (Mozilla)** | PDF rendering in the research hub |
| **react-pdf** | PDF generation for prescriptions and invoices |
| **@react-pdf/renderer** | Custom PDF template rendering |
| **Tiptap** | Rich text editor for notes and annotations |

---

## Backend Stack

### Core

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 22 LTS | Runtime environment |
| **Next.js API Routes** | 15+ | Primary API layer (monolith-first approach) |
| **tRPC** | 11.x | End-to-end typesafe APIs (alternative to REST for internal) |
| **Prisma** | 6.x | ORM for database access |

### Authentication & Authorization

| Technology | Purpose |
|-----------|---------|
| **NextAuth.js (Auth.js)** | Authentication (Email/Password, Google, Phone OTP) |
| **Role-Based Access Control (RBAC)** | Doctor, Patient, Admin roles |
| **JWT + Refresh Tokens** | Session management |
| **bcrypt** | Password hashing |

### Database

| Technology | Purpose |
|-----------|---------|
| **PostgreSQL 16** | Primary relational database (patients, doctors, appointments, records) |
| **Redis 7** | Caching, session store, rate limiting, real-time pub/sub |
| **Pinecone** | Vector database for AI-powered search (research documents, bot context) |

### File Storage

| Technology | Purpose |
|-----------|---------|
| **AWS S3 / Cloudflare R2** | PDFs, images, reports, audio recordings |
| **Pre-signed URLs** | Secure direct upload/download from client |

---

## AI & Machine Learning Stack

### Docto Bot (Conversational AI)

| Technology | Purpose |
|-----------|---------|
| **Google Gemini 2.5 Pro / Flash** | Primary LLM for conversational AI, summarization, analysis |
| **LangChain.js** | LLM orchestration, chain management, tool calling |
| **Pinecone** | RAG (Retrieval-Augmented Generation) for document-aware responses |
| **Prompt Engineering** | Custom system prompts for Professor/Senior/Teacher tones |

### Research Hub AI

| Technology | Purpose |
|-----------|---------|
| **Google Gemini** | Word definitions, passage summarization, key takeaways |
| **Tesseract.js / Google Vision AI** | OCR for image text extraction |
| **PDF Parse** | Text extraction from uploaded PDFs |
| **Cheerio / Puppeteer** | Web scraping for URL-pasted articles |

### Clinical Session AI

| Technology | Purpose |
|-----------|---------|
| **Microsoft Dragon Copilot** | Primary medical speech-to-text (clinical terminology trained) |
| **WhisperFlow (OpenAI Whisper)** | Fallback transcription engine |
| **Speaker Diarization** | Distinguish Doctor vs. Patient in conversation |
| **NER (Named Entity Recognition)** | Extract medicines, dosages, diagnoses from transcript |
| **Google Gemini** | Structuring extracted data into prescription tables |

### Health Report Analysis

| Technology | Purpose |
|-----------|---------|
| **Google Gemini** | Parse and analyze medical reports |
| **Google Vision AI** | OCR for scanned report images |
| **Custom ML Models** | Reference range comparison (India-specific) |

---

## Infrastructure & DevOps

### Hosting & Deployment

| Technology | Purpose |
|-----------|---------|
| **Vercel** | Frontend hosting (Next.js optimized) |
| **AWS EC2 / ECS** | Backend services, heavy processing |
| **AWS Lambda** | Serverless functions (PDF generation, notifications) |
| **Docker** | Containerization of services |

### CI/CD

| Technology | Purpose |
|-----------|---------|
| **GitHub Actions** | CI/CD pipelines — test, build, deploy |
| **Husky + lint-staged** | Pre-commit hooks for code quality |
| **ESLint + Prettier** | Code linting and formatting |

### Monitoring & Observability

| Technology | Purpose |
|-----------|---------|
| **Sentry** | Error tracking and performance monitoring |
| **PostHog / Mixpanel** | Product analytics and user behavior |
| **Grafana + Prometheus** | Infrastructure monitoring |
| **Winston / Pino** | Structured logging |

### Security

| Technology | Purpose |
|-----------|---------|
| **Helmet.js** | HTTP security headers |
| **Rate Limiting (Redis)** | API abuse prevention |
| **CORS Configuration** | Cross-origin security |
| **AES-256 Encryption** | Data at rest encryption |
| **TLS 1.3** | Data in transit encryption |

---

## Third-Party Integrations

| Service | Purpose | Priority |
|---------|---------|----------|
| **Razorpay / Stripe** | Payment processing for appointments | P0 |
| **Twilio / MSG91** | SMS notifications and OTP | P0 |
| **SendGrid / Resend** | Email notifications | P0 |
| **Daily.co / Twilio Video** | Teleconsultation video calls | P0 |
| **Firebase Cloud Messaging** | Push notifications (mobile/web) | P1 |
| **Google Calendar API** | Calendar sync for doctors | P2 |
| **WhatsApp Business API** | Appointment reminders to patients | P2 |

---

## Data Export Formats

| Format | Standard | Use Case |
|--------|----------|----------|
| **HL7 FHIR (R4)** | Healthcare interoperability | Hospital system integration |
| **CDA (Clinical Document Architecture)** | HL7 v3 | Legacy system compatibility |
| **PDF** | Universal | Patient prescriptions, invoices |
| **CSV / Excel** | Tabular | Bulk data export, analytics |
| **JSON** | API standard | System-to-system data transfer |
| **Custom Templates** | Hospital-specific | Per-hospital format mapping |

---

## Development Tools

| Tool | Purpose |
|------|---------|
| **VS Code** | Primary IDE |
| **GitHub** | Version control and collaboration |
| **Figma** | UI/UX design |
| **Notion** | Documentation and project management |
| **Postman / Thunder Client** | API testing |
| **Storybook** | Component development and documentation |
| **Playwright** | End-to-end testing |
| **Vitest** | Unit and integration testing |

---

## Why These Choices?

### Next.js over separate frontend/backend
> Monolith-first approach. Faster development, shared types with TypeScript, built-in API routes. We can extract microservices later as we scale.

### PostgreSQL over MongoDB
> Medical data is highly relational (patients ↔ doctors ↔ appointments ↔ prescriptions). Relational databases provide better data integrity and ACID compliance — critical for healthcare.

### Gemini over GPT
> Gemini 2.5 offers excellent multimodal capabilities (text + image analysis), large context windows for document analysis, and competitive pricing. We can swap LLM providers if needed since LangChain abstracts the provider.

### Dragon Copilot over Whisper-only
> Dragon is trained on medical terminology and has significantly higher accuracy for clinical language. Whisper is the fallback for cost optimization and non-critical recordings.

### Redis for Real-Time
> Appointment queues, medication reminders, and live notifications require sub-second response times. Redis pub/sub + caching handles this efficiently.

---

> 📌 **Note:** This stack is designed for a team of 4-8 developers. As the product scales, we may introduce Kubernetes orchestration, message queues (RabbitMQ/Kafka), and dedicated microservices.
