# 🎨 Docto — Frontend Architecture & Design System

> **Version:** 1.0  
> **Last Updated:** June 8, 2026  
> **Status:** Draft

---

## Design Philosophy

> **"Clinical precision meets consumer simplicity."**

The Docto interface must achieve two seemingly contradictory goals:
1. **Doctor side:** Dense, efficient, information-rich — like a professional cockpit
2. **Patient side:** Minimal, calming, crystal-clear — like a friendly health companion

---

## Design System

### Color Palette

#### Doctor Side — Professional & Trustworthy

| Token | Hex | Usage |
|-------|-----|-------|
| `--doc-primary` | `#4F46E5` | Primary actions, active states (Indigo) |
| `--doc-primary-light` | `#818CF8` | Hover states, secondary elements |
| `--doc-primary-dark` | `#3730A3` | Headers, emphasis |
| `--doc-surface` | `#0F172A` | Dark mode base (Slate 900) |
| `--doc-surface-elevated` | `#1E293B` | Cards, panels (Slate 800) |
| `--doc-surface-overlay` | `#334155` | Popups, modals (Slate 700) |
| `--doc-text-primary` | `#F8FAFC` | Primary text (Slate 50) |
| `--doc-text-secondary` | `#94A3B8` | Secondary text (Slate 400) |
| `--doc-accent-green` | `#10B981` | Success, confirmed, healthy |
| `--doc-accent-red` | `#EF4444` | Errors, recording, critical |
| `--doc-accent-amber` | `#F59E0B` | Warnings, pending |
| `--doc-accent-cyan` | `#06B6D4` | Bot messages, AI elements |

#### Patient Side — Warm & Approachable

| Token | Hex | Usage |
|-------|-----|-------|
| `--pat-primary` | `#0EA5E9` | Primary actions (Sky Blue) |
| `--pat-primary-light` | `#38BDF8` | Hover states |
| `--pat-primary-dark` | `#0284C7` | Headers |
| `--pat-surface` | `#FFFFFF` | Light mode base |
| `--pat-surface-card` | `#F8FAFC` | Card backgrounds |
| `--pat-surface-accent` | `#F0F9FF` | Highlighted sections (Sky 50) |
| `--pat-text-primary` | `#0F172A` | Primary text |
| `--pat-text-secondary` | `#64748B` | Secondary text |
| `--pat-success` | `#10B981` | Medicine taken, streak active |
| `--pat-danger` | `#EF4444` | Missed, abnormal values |
| `--pat-streak-gold` | `#F59E0B` | Streak fire, rewards |
| `--pat-fun-purple` | `#A855F7` | Gamification elements |

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Headings (H1-H3) | Inter | 700 | 32/24/20px |
| Subheadings | Inter | 600 | 18px |
| Body Text | Inter | 400 | 16px |
| Labels / Captions | Inter | 500 | 14px |
| Mono (Code/Data) | JetBrains Mono | 400 | 14px |
| Bot Messages | Inter | 400 | 15px |

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px | Tight spacing, icon padding |
| `--space-sm` | 8px | Compact elements |
| `--space-md` | 16px | Standard spacing |
| `--space-lg` | 24px | Section spacing |
| `--space-xl` | 32px | Major sections |
| `--space-2xl` | 48px | Page sections |
| `--space-3xl` | 64px | Hero sections |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Buttons, inputs |
| `--radius-md` | 10px | Cards, panels |
| `--radius-lg` | 16px | Modals, large cards |
| `--radius-xl` | 24px | Feature cards |
| `--radius-full` | 9999px | Pills, avatars, badges |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | Cards |
| `--shadow-lg` | `0 10px 25px rgba(0,0,0,0.1)` | Modals, popups |
| `--shadow-glow` | `0 0 20px rgba(79,70,229,0.3)` | Active/focused elements |

---

## Page Structure & Layouts

### Doctor Dashboard Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  TOP BAR: Logo | Search | Notifications 🔔 | Profile Avatar             │
├──────────┬───────────────────────────────────────────────┬───────────────┤
│          │                                               │               │
│  SIDEBAR │              MAIN CONTENT AREA                │   DOCTO BOT   │
│          │                                               │   SIDEBAR     │
│  📚 Research│                                            │               │
│  📋 Planner │   (Changes based on active module)         │  💬 Chat      │
│  📅 Appts   │                                            │    Interface  │
│  👥 Patients│                                            │               │
│  📊 Reports │                                            │  🎤 Voice     │
│  ⚙️ Settings│                                            │    Input      │
│          │                                               │               │
│          │                                               │   [Collapse]  │
├──────────┴───────────────────────────────────────────────┴───────────────┤
│  STATUS BAR: Recording Status | Active Patient | Connection | Time      │
└──────────────────────────────────────────────────────────────────────────┘
```

### Patient Dashboard Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  TOP BAR: Logo | "Hello, [Name]! 👋" | Notifications 🔔 | Profile       │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │ 📅 Next Appt │  │ 💊 Meds Due  │  │ 📊 Reports  │  │ 🤖 Ask Docto│   │
│  │ Dr. Smith    │  │ 2 pending   │  │ 1 new       │  │             │   │
│  │ Today 3pm   │  │ Take now!   │  │ analysis    │  │ Chat →      │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  TODAY'S MEDICATION SCHEDULE                                     │   │
│  │  ═══════════════════════════════════════════════════════════════  │   │
│  │  🌅 8:00 AM  │ Amoxicillin 500mg  │ After breakfast  │ [✅ Done]│   │
│  │  🌞 2:00 PM  │ Amoxicillin 500mg  │ After lunch      │ [⏰ Due]│   │
│  │  🌙 9:00 PM  │ Amoxicillin 500mg  │ After dinner     │ [🔜 Later]│ │
│  │  🌙 9:00 PM  │ Paracetamol 650mg  │ If fever         │ [🔜 Later]│ │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  🔥 Streak: 5 days │ 💰 Discount: 10% unlocked!                        │
│                                                                          │
├────────┬─────────┬──────────┬──────────┬──────────────────────────────────┤
│  🏠 Home│📅 Appts │ 💊 Meds  │ 📊 Reports│ 🤖 Docto Bot                    │
└────────┴─────────┴──────────┴──────────┴──────────────────────────────────┘
```

---

## Component Library

### Shared Components

| Component | Description | Used In |
|-----------|-------------|---------|
| `<TopBar />` | Navigation header with search, notifications, profile | Both |
| `<Sidebar />` | Collapsible navigation sidebar | Doctor |
| `<BottomNav />` | Mobile bottom navigation | Patient |
| `<Modal />` | Accessible modal dialog | Both |
| `<Card />` | Elevated content container | Both |
| `<Button />` | Primary, Secondary, Ghost, Danger variants | Both |
| `<Input />` | Text, Email, Phone, Search, Textarea | Both |
| `<Select />` | Dropdown selector | Both |
| `<Badge />` | Status badges (Active, Pending, Completed) | Both |
| `<Avatar />` | User profile images with fallback | Both |
| `<Tooltip />` | Hover tooltip | Both |
| `<Toast />` | Notification toasts | Both |
| `<Loader />` | Loading spinners and skeletons | Both |
| `<Calendar />` | Date picker and calendar view | Both |
| `<FileUpload />` | Drag-and-drop file uploader | Both |

### Doctor-Specific Components

| Component | Description |
|-----------|-------------|
| `<DocumentViewer />` | PDF/Text renderer with text selection capabilities |
| `<SelectionPopup />` | Floating popup for word/passage selection actions |
| `<DoctoBotSidebar />` | Collapsible AI chat sidebar |
| `<PlannerView />` | Day/Week/Month planner with drag-drop |
| `<AppointmentQueue />` | Live patient queue with status |
| `<SessionRecorder />` | Recording controls with live transcription view |
| `<TranscriptViewer />` | Real-time transcript with speaker labels |
| `<PrescriptionTable />` | Editable prescription table with inline editing |
| `<PatientTimeline />` | Chronological visit history |
| `<ExportDialog />` | Format selection and export modal |
| `<TriageBuilder />` | Drag-drop triage question builder |
| `<ConflictAlert />` | Schedule conflict notification |

### Patient-Specific Components

| Component | Description |
|-----------|-------------|
| `<DoctorCard />` | Doctor profile card with booking CTA |
| `<TriageForm />` | Dynamic form from doctor-defined questions |
| `<ReportAnalysis />` | Health report dashboard with charts |
| `<NormalVsYou />` | Comparison chart component |
| `<MedSchedule />` | Daily medication timeline |
| `<StreakTracker />` | Gamification streak display with animations |
| `<MedCheckbox />` | Medicine done checkbox with fun feedback |
| `<PatientBotChat />` | Restricted Docto Bot chat interface |
| `<SessionReplay />` | Audio player with summary view |
| `<PrescriptionView />` | Read-only prescription card |
| `<DiscountBadge />` | Earned discount display with confetti |

---

## Key Page Specifications

### Page: Research Hub (`/doctor/research`)

```
┌─────────────────────────────────────────────────────────────────┐
│  Research Hub                                    [Upload] [URL] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐ │
│  │                          │  │  📋 DOCUMENT SUMMARY          │ │
│  │                          │  │                               │ │
│  │   DOCUMENT VIEWER        │  │  Key Takeaways:               │ │
│  │                          │  │  • Point 1                    │ │
│  │   (PDF / Text / Web)     │  │  • Point 2                    │ │
│  │                          │  │  • Point 3                    │ │
│  │   [Selected text here]   │  │                               │ │
│  │         ↓                │  │  Image Analysis:              │ │
│  │   ┌─────────────┐       │  │  [AI analysis of images]      │ │
│  │   │ 📖 Definition│       │  │                               │ │
│  │   │ 📝 Summary   │       │  │  Full Summary:                │ │
│  │   │ 🔍 Simplify  │       │  │  [Comprehensive summary]      │ │
│  │   │ 📌 Takeaways │       │  │                               │ │
│  │   └─────────────┘       │  │                               │ │
│  │   (Selection Popup)      │  │                               │ │
│  │                          │  │                               │ │
│  └──────────────────────────┘  └──────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Page: Clinical Session (`/doctor/session/[patientId]`)

```
┌─────────────────────────────────────────────────────────────────┐
│  Session: Dr. Sharma ↔ Patient: Rahul Kumar    🔴 RECORDING     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐ │
│  │  LIVE TRANSCRIPT         │  │  AI EXTRACTION (Real-time)    │ │
│  │                          │  │                               │ │
│  │  🩺 Dr: So tell me what  │  │  Issues:                      │ │
│  │     brings you in today? │  │  • Persistent headache (3d)   │ │
│  │                          │  │  • Mild fever                 │ │
│  │  🧑 Pt: I've been having │  │                               │ │
│  │     headaches for the    │  │  Diagnosis:                   │ │
│  │     last 3 days and...   │  │  • Viral upper respiratory    │ │
│  │                          │  │    infection (J06.9)          │ │
│  │  🩺 Dr: Any fever?       │  │                               │ │
│  │                          │  │  Prescriptions:               │ │
│  │  🧑 Pt: Yes, mild fever  │  │  • Paracetamol 650mg (PRN)   │ │
│  │     around 100°F         │  │  • Amoxicillin 500mg (TID)   │ │
│  │                          │  │                               │ │
│  │  🩺 Dr: I'll prescribe   │  │  Referrals:                   │ │
│  │     Paracetamol and...   │  │  • None                      │ │
│  │                          │  │                               │ │
│  └──────────────────────────┘  └──────────────────────────────┘ │
│                                                                 │
│  [⏸️ Pause]  [🔴 End Session]  [📝 Add Note]                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Page: Patient Report Analysis (`/patient/reports/[reportId]`)

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back    Blood Work Analysis                   June 5, 2026  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ⚠️ 2 parameters need attention                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Hemoglobin                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Your Value: 11.2 g/dL    Normal: 13.5-17.5 g/dL        │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│  │  [🔴 LOW ●──────────────│─ ─ ─ Normal Range ─ ─ ─│]     │   │
│  │                                                           │   │
│  │  💬 "Your hemoglobin is lower than normal. This means     │   │
│  │      your blood carries less oxygen. You might feel       │   │
│  │      tired or dizzy sometimes."                           │   │
│  │                                                           │   │
│  │  🗣️ Tell your doctor: "I've been feeling unusually        │   │
│  │     tired lately" — this could be related.                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Ask Docto Bot about this] [View full report] [Share with Dr] │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Animations & Micro-Interactions

| Element | Animation | Duration |
|---------|-----------|----------|
| Page transitions | Fade + subtle slide up | 300ms |
| Card hover | Slight lift + shadow increase | 200ms |
| Selection popup | Scale from 0.95 + fade in | 150ms |
| Bot message | Slide in from right + fade | 250ms |
| Recording pulse | Red dot pulsing animation | 1.5s loop |
| Streak fire | Flame emoji bounce animation | 500ms |
| Medicine checkbox | Satisfying checkmark draw animation | 400ms |
| Discount unlock | Confetti burst | 1s |
| Toast notification | Slide in from top-right | 300ms |
| Sidebar collapse | Width transition | 250ms |
| Modal open | Backdrop fade + content scale | 300ms |
| Skeleton loading | Shimmer gradient animation | 1.5s loop |

---

## Responsive Breakpoints

| Breakpoint | Width | Target |
|-----------|-------|--------|
| `mobile` | < 640px | Phones |
| `tablet` | 640px – 1024px | Tablets |
| `desktop` | 1024px – 1440px | Laptops |
| `wide` | > 1440px | Large screens |

### Mobile Adaptations

**Doctor (Tablet minimum):**
- Sidebar collapses to icon-only
- Docto Bot becomes full-screen overlay
- Session recording optimized for portrait
- Prescription table scrolls horizontally

**Patient (Mobile-first):**
- Bottom navigation bar
- Cards stack vertically
- Medication timeline as scrollable list
- Swipe gestures for marking meds as done
- Bot as full-screen chat view

---

## Accessibility (a11y)

| Requirement | Implementation |
|-------------|----------------|
| Keyboard Navigation | All interactive elements focusable with Tab |
| Screen Readers | ARIA labels on all components |
| Color Contrast | WCAG AA minimum (4.5:1 for text) |
| Focus Indicators | Visible focus rings on all interactive elements |
| Error Messages | Descriptive, linked to form fields |
| Motion Preferences | Respect `prefers-reduced-motion` |
| Font Scaling | Support up to 200% zoom without layout break |
| Touch Targets | Minimum 44x44px on mobile |

---

## File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (doctor)/
│   │   ├── dashboard/page.tsx
│   │   ├── research/page.tsx
│   │   ├── planner/page.tsx
│   │   ├── appointments/page.tsx
│   │   ├── patients/
│   │   │   ├── page.tsx
│   │   │   └── [patientId]/page.tsx
│   │   ├── session/
│   │   │   └── [patientId]/page.tsx
│   │   ├── export/page.tsx
│   │   ├── settings/page.tsx
│   │   └── layout.tsx
│   ├── (patient)/
│   │   ├── dashboard/page.tsx
│   │   ├── doctors/
│   │   │   ├── page.tsx
│   │   │   └── [doctorId]/page.tsx
│   │   ├── appointments/page.tsx
│   │   ├── medications/page.tsx
│   │   ├── reports/
│   │   │   ├── page.tsx
│   │   │   └── [reportId]/page.tsx
│   │   ├── records/page.tsx
│   │   ├── settings/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   └── [...] (API routes)
│   ├── layout.tsx
│   └── page.tsx (Landing page)
├── components/
│   ├── ui/                    # Base UI components
│   ├── doctor/                # Doctor-specific components
│   ├── patient/               # Patient-specific components
│   ├── shared/                # Shared components
│   └── bot/                   # Docto Bot components
├── hooks/                     # Custom React hooks
├── lib/                       # Utility functions
├── stores/                    # Zustand stores
├── types/                     # TypeScript types
├── styles/                    # Global styles & design tokens
└── config/                    # App configuration
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint (FCP) | < 1.2s |
| Largest Contentful Paint (LCP) | < 2.5s |
| Time to Interactive (TTI) | < 3.0s |
| Cumulative Layout Shift (CLS) | < 0.1 |
| First Input Delay (FID) | < 100ms |
| Lighthouse Score | > 90 (all categories) |
| Bundle Size (initial) | < 200KB gzipped |

---

> 📌 **Design Figma link will be added here once designs are finalized.**  
> 📌 **Storybook URL will be added once component library is deployed.**
