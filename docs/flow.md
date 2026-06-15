# 🔄 Docto — Application Flow

> **Version:** 1.0  
> **Last Updated:** June 8, 2026  
> **Status:** Draft

---

## High-Level System Flow

```mermaid
graph TB
    subgraph Users
        D["🩺 Doctor"]
        P["🧑 Patient"]
    end

    subgraph Platform["Docto Platform"]
        AUTH["Auth & Onboarding"]
        DD["Doctor Dashboard"]
        PD["Patient Dashboard"]
        BOT["Docto Bot AI"]
        
        subgraph DoctorModules["Doctor Modules"]
            RH["Research Hub"]
            SP["Smart Planner"]
            AM["Appointment Mgmt"]
            CS["Clinical Session"]
            PH["Patient History"]
            DE["Data Export"]
        end
        
        subgraph PatientModules["Patient Modules"]
            DP["Doctor Profiles"]
            AB["Appointment Booking"]
            HR["Health Report Upload"]
            SR["Session Records"]
            MT["Medication Tracker"]
        end
    end

    D --> AUTH --> DD
    P --> AUTH --> PD
    DD --> DoctorModules
    PD --> PatientModules
    BOT -.-> DoctorModules
    BOT -.-> PatientModules
```

---

## 1. Authentication & Onboarding Flow

### 1.1 Doctor Registration

```mermaid
flowchart TD
    A["Doctor visits docto.in"] --> B["Sign Up / Login"]
    B --> C{"Auth Method"}
    C -->|Email| D["Email + Password + OTP Verification"]
    C -->|Google| E["Google OAuth"]
    C -->|Phone| F["Phone Number + OTP"]
    
    D --> G["Profile Setup"]
    E --> G
    F --> G
    
    G --> H["Enter Details"]
    H --> I["Name, Specialization, Qualifications"]
    I --> J["Medical License Number"]
    J --> K["Clinic Address + Working Hours"]
    K --> L["Set Appointment Preferences"]
    L --> M["Configure Triage Questions"]
    M --> N["Set Teleconsultation Availability"]
    N --> O["Upload Profile Photo"]
    O --> P["Select Docto Bot Tone Preference"]
    P --> Q["🎉 Dashboard Ready"]
    
    style Q fill:#10b981,color:#fff
```

### 1.2 Patient Registration

```mermaid
flowchart TD
    A["Patient visits docto.in"] --> B["Sign Up / Login"]
    B --> C{"Auth Method"}
    C -->|Phone OTP| D["Phone + OTP (Primary)"]
    C -->|Email| E["Email + Password"]
    C -->|Google| F["Google OAuth"]
    
    D --> G["Basic Profile"]
    E --> G
    F --> G
    
    G --> H["Name, Age, Gender"]
    H --> I["Blood Group (Optional)"]
    I --> J["Emergency Contact"]
    J --> K["Preferred Language"]
    K --> L["🎉 Patient Dashboard Ready"]
    
    style L fill:#10b981,color:#fff
```

---

## 2. Doctor Research Hub Flow

```mermaid
flowchart TD
    A["Doctor opens Research Hub"] --> B{"Input Type"}
    
    B -->|PDF Upload| C["Drag & Drop or File Picker"]
    B -->|Text Paste| D["Paste Paragraph/Lines"]
    B -->|URL Paste| E["Paste Website Link"]
    B -->|Image| F["Upload/Drag Image"]
    
    C --> G["PDF Parser extracts text + images"]
    D --> H["Text rendered in Document Viewer"]
    E --> I["Web Scraper fetches content"]
    F --> J["OCR + Image Analysis"]
    
    G --> K["Document Viewer"]
    H --> K
    I --> K
    J --> K
    
    K --> L["Auto-generate Full Summary + Key Takeaways"]
    
    K --> M{"User Interaction"}
    M -->|Select Word| N["Popup: Definition, Context Meaning, Root, Pronunciation"]
    M -->|Select Passage| O["Popup: Summary, Function, Simplify, Key Takeaways"]
    M -->|Ask Docto Bot| P["Bot answers in selected tone"]
    M -->|Save/Bookmark| Q["Save to personal library"]
    
    N --> R["Pin / Copy / Dismiss Popup"]
    O --> R
    
    style K fill:#6366f1,color:#fff
    style L fill:#8b5cf6,color:#fff
```

---

## 3. Docto Bot Interaction Flow

```mermaid
flowchart TD
    A["User opens Docto Bot sidebar"] --> B{"User Type"}
    
    B -->|Doctor| C["Full access mode"]
    B -->|Patient| D["Restricted mode"]
    
    C --> E{"Query Type"}
    E -->|Research| F["Explain paragraph, summarize paper"]
    E -->|Schedule| G["'Move my 3pm to tomorrow' → Updates Smart Planner"]
    E -->|Patient Info| H["'Show me John's last visit' → Pulls patient history"]
    E -->|General Medical| I["Answer medical knowledge questions"]
    E -->|Prescription Help| J["Help format prescriptions"]
    
    D --> K{"Patient Query"}
    K -->|Session Clarification| L["'What did the doctor mean by X?' → Explains from session notes"]
    K -->|Report Explanation| M["'What does my low RBC mean?' → Explains in simple terms"]
    K -->|Language Switch| N["'Explain in Hindi' → Translates explanation"]
    K -->|Appointment Info| O["'When is my next appointment?' → Shows booking details"]
    
    F --> P["AI generates response in selected tone"]
    G --> Q["Smart Planner updated + confirmation"]
    H --> R["Patient data displayed"]
    I --> P
    J --> P
    
    L --> S["Response from doctor's documented notes ONLY"]
    M --> S
    N --> S
    O --> T["Booking details shown"]
    
    style C fill:#f59e0b,color:#000
    style D fill:#06b6d4,color:#fff
```

---

## 4. Smart Planner Flow

```mermaid
flowchart TD
    A["Doctor opens Smart Planner"] --> B{"Input Method"}
    
    B -->|Manual Entry| C["Add task: Title, Date, Time, Category, Priority"]
    B -->|Voice via Bot| D["'Docto, remind me to call lab at 5pm'"]
    B -->|From Appointments| E["Auto-sync appointment bookings"]
    
    C --> F["AI generates balanced schedule"]
    D --> F
    E --> F
    
    F --> G["Consider: Work, Personal, Buffer, Breaks"]
    G --> H["Display in Day/Week/Month View"]
    
    H --> I{"Doctor Actions"}
    I -->|Edit via Bot| J["'Move surgery prep to Thursday' → Auto-update"]
    I -->|Manual Edit| K["Drag-and-drop or click-to-edit"]
    I -->|Delete| L["Remove task"]
    I -->|Mark Complete| M["✓ Task done"]
    
    J --> H
    K --> H
    
    H --> N["Conflict Detection Alert"]
    N -->|Conflict Found| O["⚠️ 'You have overlapping events at 3pm'"]
    O --> P["Suggest resolution"]
    
    H --> Q["Weekly Summary Report"]
    Q --> R["Email/In-app: Tasks completed, upcoming, suggested adjustments"]
    
    style F fill:#8b5cf6,color:#fff
```

---

## 5. Appointment Management Flow

### 5.1 Doctor Side — Configuration & Management

```mermaid
flowchart TD
    A["Doctor → Appointment Settings"] --> B["Set Available Slots"]
    B --> C["Define Working Hours per Day"]
    C --> D["Set Appointment Duration (15/30/45/60 min)"]
    D --> E["Max Patients per Slot"]
    E --> F["Break Times"]
    
    F --> G["Configure Triage"]
    G --> H["Add Custom Questions per Appointment Type"]
    H --> I["Example: 'Rate pain 1-10', 'Allergies?', 'Current medications?'"]
    
    I --> J["Dashboard View"]
    J --> K["Today's Appointments (Queue)"]
    J --> L["Weekly Calendar View"]
    J --> M["Pending Confirmations"]
    
    K --> N{"Select Patient"}
    N --> O["View Triage Responses"]
    O --> P["View Patient History"]
    P --> Q["Start Clinical Session"]
    
    style Q fill:#10b981,color:#fff
```

### 5.2 Patient Side — Booking

```mermaid
flowchart TD
    A["Patient → Find Doctor"] --> B["Browse / Search Doctors"]
    B --> C["View Doctor Profile"]
    C --> D{"Appointment Type"}
    
    D -->|Teleconsultation 📹| E["Select Date & Available Time Slot"]
    D -->|In-Clinic Visit 🏥| F["Select Date & Available Time Slot"]
    
    E --> G["Fill Triage Form"]
    F --> G
    
    G --> H["Answer Doctor's Pre-defined Questions"]
    H --> I["Review Booking Summary"]
    I --> J["Pay Consultation Fee (Razorpay)"]
    J --> K{"Payment Status"}
    
    K -->|Success| L["✅ Booking Confirmed"]
    K -->|Failed| M["❌ Retry Payment"]
    
    L --> N["Receive Confirmation: SMS + Email + In-App"]
    N --> O["Added to Patient's Calendar"]
    O --> P["Reminder: 24hr + 1hr before appointment"]
    
    style L fill:#10b981,color:#fff
```

---

## 6. Clinical Session Flow (Core Feature)

```mermaid
flowchart TD
    A["Doctor selects patient from appointment queue"] --> B["Patient profile opens"]
    B --> C["Review: Triage responses + Past history"]
    C --> D["🔴 Click 'Start Session'"]
    
    D --> E["Consent notification sent to patient"]
    E --> F["Recording begins"]
    F --> G["Real-time transcription (Dragon Copilot / WhisperFlow)"]
    G --> H["Speaker diarization: Doctor 🩺 vs Patient 🧑"]
    
    H --> I["AI processes transcript in real-time"]
    I --> J["Extract: Issues, Diagnosis, Referrals, Prescriptions"]
    
    J --> K["🔴 Doctor clicks 'End Session'"]
    
    K --> L["Generated Summary View"]
    
    L --> M["Session Summary"]
    L --> N["Issues & Complaints (Bullet List)"]
    L --> O["Diagnosis (ICD-10 coded)"]
    L --> P["Referrals (if any)"]
    L --> Q["Prescription Table"]
    
    Q --> R["Editable Table"]
    R --> S{"Doctor Reviews"}
    
    S -->|Error Found| T["Edit cell directly / Add row manually"]
    T --> R
    
    S -->|All Correct| U["✅ Click 'Confirm & Generate'"]
    
    U --> V["Generate Documents"]
    V --> W["📄 Prescription PDF"]
    V --> X["🧾 Invoice PDF"]
    V --> Y["📊 Session Summary (stored)"]
    
    W --> Z["Available to Patient"]
    X --> Z
    Y --> Z
    
    Z --> AA["Patient notified: Session complete, documents ready"]
    
    style D fill:#ef4444,color:#fff
    style K fill:#ef4444,color:#fff
    style U fill:#10b981,color:#fff
```

### Prescription Table Detail

```
┌────┬──────────────────┬──────────┬───────────────────┬──────────┬────────────┬──────────┬──────────────────────┐
│ #  │ Medicine Name     │ Dosage   │ When to Take      │ Timing   │ Meals      │ Duration │ Notes                │
├────┼──────────────────┼──────────┼───────────────────┼──────────┼────────────┼──────────┼──────────────────────┤
│ 1  │ Amoxicillin 500mg│ 1 cap    │ Morning, Afternoon│ 8am, 2pm │ After meals│ 7 days   │ Take with warm water │
│    │                  │          │ Night             │ 9pm      │            │          │                      │
├────┼──────────────────┼──────────┼───────────────────┼──────────┼────────────┼──────────┼──────────────────────┤
│ 2  │ Paracetamol 650mg│ 1 tablet │ As needed         │ Max 3/day│ Any        │ 5 days   │ Only if fever >100°F │
├────┼──────────────────┼──────────┼───────────────────┼──────────┼────────────┼──────────┼──────────────────────┤
│ 3  │ [Doctor adds row]│          │                   │          │            │          │                      │
└────┴──────────────────┴──────────┴───────────────────┴──────────┴────────────┴──────────┴──────────────────────┘
         ✏️ Click any cell to edit                                              [+ Add Medicine] [✅ Confirm]
```

---

## 7. Patient Health Report Analysis Flow

```mermaid
flowchart TD
    A["Patient → Health Reports"] --> B{"Upload Method"}
    
    B -->|PDF Upload| C["Upload report PDF"]
    B -->|Image Upload| D["Upload photo/scan of report"]
    
    C --> E["PDF Parser extracts data"]
    D --> F["OCR extracts text from image"]
    
    E --> G["AI Analyzes Report"]
    F --> G
    
    G --> H["Parameter Identification"]
    H --> I["Match against normal reference ranges (India-specific)"]
    
    I --> J["Generate Analysis Dashboard"]
    
    J --> K["📊 Parameter Breakdown"]
    J --> L["📈 Normal vs. Patient Graph (per parameter)"]
    J --> M["🔴 Flagged Values (out of range)"]
    J --> N["💡 Body Signals: 'You might be feeling...'"]
    J --> O["🗣️ Tips for Doctor: 'Tell your doctor about...'"]
    J --> P["📋 Detailed Explanation (plain language)"]
    
    K --> Q["Patient can ask Docto Bot for further explanation"]
    L --> Q
    M --> Q
    
    Q --> R["Bot explains in patient's preferred language"]
    
    style G fill:#8b5cf6,color:#fff
    style J fill:#06b6d4,color:#fff
```

---

## 8. Medication Tracker & Gamification Flow

```mermaid
flowchart TD
    A["Session ends → Prescription generated"] --> B["Auto-create medication schedule"]
    B --> C["Calendar view: Daily timeline of medications"]
    
    C --> D["Push notification: 'Time to take Amoxicillin!'"]
    D --> E{"Patient Action"}
    
    E -->|Mark Done ✅ (within ±30 min)| F["✅ Recorded on time"]
    E -->|Mark Done ⏰ (late)| G["⚠️ Recorded late — streak in danger"]
    E -->|Missed ❌| H["❌ Missed — streak broken"]
    
    F --> I["Streak continues! 🔥"]
    G --> J["Warning: 'Close call! Next time be on time 😬'"]
    H --> K["Streak reset 💀 'RIP your discount coupon 🪦'"]
    
    I --> L{"Streak Milestones"}
    L -->|7 days| M["🏆 'ONE WEEK CHAMPION!' + Discount unlocked"]
    L -->|14 days| N["💎 'TWO WEEK WARRIOR!' + Better discount"]
    L -->|30 days| O["🎊 'LEGENDARY! 30 DAYS!' + Special reward"]
    
    M --> P["Discount applicable on next booking"]
    N --> P
    O --> P
    
    K --> Q["Discount coupon revoked"]
    
    style F fill:#10b981,color:#fff
    style H fill:#ef4444,color:#fff
    style O fill:#f59e0b,color:#000
```

---

## 9. Data Export Flow

```mermaid
flowchart TD
    A["Doctor → Export Data"] --> B{"Export Type"}
    
    B -->|Single Patient| C["Select patient"]
    B -->|Bulk Export| D["Select date range / all patients"]
    B -->|Session Export| E["Select specific session"]
    
    C --> F{"Output Format"}
    D --> F
    E --> F
    
    F -->|HL7 FHIR| G["Generate FHIR R4 JSON/XML"]
    F -->|CDA| H["Generate Clinical Document"]
    F -->|PDF| I["Generate formatted PDF"]
    F -->|CSV/Excel| J["Generate tabular data"]
    F -->|Custom| K["Select hospital template → Map fields → Generate"]
    
    G --> L["📥 Download / Direct API Push"]
    H --> L
    I --> L
    J --> L
    K --> L
    
    style K fill:#f59e0b,color:#000
```

---

## 10. Notification Flow

```mermaid
flowchart TD
    A["Event Triggered"] --> B{"Event Type"}
    
    B -->|Appointment Booked| C["Doctor: 'New appointment from [Patient]'"]
    B -->|Appointment Reminder| D["Patient: '1 hour until your appointment'"]
    B -->|Session Complete| E["Patient: 'Your session summary is ready'"]
    B -->|Medication Time| F["Patient: 'Time to take [Medicine]'"]
    B -->|Streak Broken| G["Patient: 'Oh no! Your streak is broken 💀'"]
    B -->|Report Analyzed| H["Patient: 'Your report analysis is ready'"]
    B -->|Schedule Change| I["Doctor: 'Your schedule has been updated by Docto'"]
    
    C --> J["Channels: Push + In-App + SMS"]
    D --> J
    E --> J
    F --> K["Channels: Push + In-App"]
    G --> K
    H --> K
    I --> L["Channels: In-App + Email"]
```

---

## 11. Complete User Journey — End to End

### Doctor's Day

```
Morning:
  📱 Open Docto → Check Smart Planner for today's tasks
  📋 Review upcoming appointments + patient triage responses
  📚 Quick research: Upload a new paper → Read with AI assistance

Clinic Hours:
  🏥 Patient arrives → Select from queue → Review history
  🔴 Start Session → Talk naturally → AI transcribes everything
  🔴 End Session → Review prescription table → Fix any errors
  ✅ Confirm → PDFs generated → Patient notified
  ↻ Repeat for next patient

Evening:
  🤖 "Docto, move tomorrow's 3pm to 4pm" → Schedule updated
  📊 Review weekly summary → Plan next week
  📤 Export patient data for hospital records
```

### Patient's Journey

```
Discovery:
  🔍 Search for doctor → View profile → Book appointment
  📝 Fill triage form → Pay → Receive confirmation

Before Appointment:
  📤 Upload recent blood work → View AI analysis
  💡 "Your iron is low — tell your doctor about fatigue"

During Appointment:
  📹 Join telecall or visit clinic → Session recorded
  🤖 AI processes everything in real-time

After Appointment:
  📄 View prescription PDF → See invoice → Read summary
  📅 Medication calendar auto-created with reminders
  ✅ Take meds on time → Build streak → Earn discounts

Ongoing:
  🤖 Ask Docto Bot: "What did the doctor mean by hypertension?"
  📊 Track medication compliance → Stay motivated
```

---

> 📌 **This document maps every major user interaction. Use it as a reference when building each feature module.**
