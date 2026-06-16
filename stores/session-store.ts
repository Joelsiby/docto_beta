import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TranscriptEntry {
  id: number
  speaker: 'Doctor' | 'Patient' | 'Unknown'
  time: string
  text: string
}

export interface ExtractedDiagnosis {
  condition: string
  icd10: string
  confidence: 'high' | 'medium' | 'low'
}

export interface ExtractedPrescription {
  id: string
  name: string
  dosage: string
  /** e.g. ["morning", "afternoon", "night"] */
  whenToTake: string[]
  /** e.g. ["08:00", "14:00", "21:00"] */
  timing: string[]
  /** before_meals | after_meals | with_meals | any */
  mealRelation: 'before_meals' | 'after_meals' | 'with_meals' | 'any'
  durationDays: number
  notes: string
  /** Doctor-defined action e.g. "Monitor BP weekly" */
  actions: string
  confidence: 'high' | 'medium' | 'low'
  /** Drug interaction warning from OpenFDA */
  interactionWarning?: string
}

export interface LifestyleSuggestion {
  category: 'diet' | 'exercise' | 'sleep' | 'stress' | 'follow_up' | 'general'
  suggestion: string
}

export type SessionStatus =
  | 'idle'
  | 'recording'
  | 'processing'
  | 'review'
  | 'confirmed'
  | 'submitted'

export interface AiPromptMessage {
  message: string
  extractedCount: {
    symptoms: number
    prescriptions: number
    diagnoses: number
    referrals: number
  }
}

// ─── State Interface ──────────────────────────────────────────────────────────

export interface SessionState {
  /** True once Zustand has finished rehydrating from localStorage */
  hasHydrated: boolean
  setHasHydrated: (v: boolean) => void

  /** Supabase session row ID — never exposed in URL */
  sessionId: string | null
  /** Opaque token used in URL — maps to sessionId server-side */
  sessionToken: string | null
  /** The ID of the patient this session is for */
  currentPatientId: string | null
  sessionStatus: SessionStatus

  // Recording
  isRecording: boolean
  recordingDuration: number // seconds

  // Transcript
  transcript: TranscriptEntry[]

  // AI Extraction Results
  isExtracting: boolean
  summary: string            // Clinical summary (for doctor)
  patientSummary: string    // Patient-readable summary (simple language)
  issues: string[]
  diagnosis: ExtractedDiagnosis[]
  prescriptions: ExtractedPrescription[]
  referrals: string[]
  lifestyleSuggestions: LifestyleSuggestion[]

  // AI Prompt (post-extraction doctor interaction)
  aiPromptMessage: AiPromptMessage | null
  isAwaitingDoctorResponse: boolean

  // Voice command mode
  voiceCommandMode: boolean
  isProcessingVoiceCommand: boolean

  // ─── Actions ──────────────────────────────────────────────────────────────

  setSessionId: (id: string) => void
  setSessionToken: (token: string) => void
  setCurrentPatientId: (id: string) => void
  setSessionStatus: (status: SessionStatus) => void
  setIsRecording: (isRecording: boolean) => void
  setRecordingDuration: (d: number) => void
  incrementDuration: () => void
  addTranscript: (entry: Omit<TranscriptEntry, 'id'>) => void
  setExtractionResults: (data: Partial<SessionState>) => void
  setIsExtracting: (isExtracting: boolean) => void
  setAiPromptMessage: (msg: AiPromptMessage | null) => void
  setIsAwaitingDoctorResponse: (v: boolean) => void
  setVoiceCommandMode: (v: boolean) => void
  setIsProcessingVoiceCommand: (v: boolean) => void

  // Prescription CRUD
  addPrescription: (med: ExtractedPrescription) => void
  removePrescription: (id: string) => void
  updatePrescription: (id: string, med: Partial<ExtractedPrescription>) => void
  setPrescriptions: (meds: ExtractedPrescription[]) => void

  clearSession: () => void
  seedDemoTranscript: () => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
  hasHydrated: false,
  setHasHydrated: (v) => set({ hasHydrated: v }),

  sessionId: null,
  sessionToken: null,
  currentPatientId: null,
  sessionStatus: 'idle',
  isRecording: false,
  recordingDuration: 0,
  transcript: [],
  isExtracting: false,
  summary: '',
  patientSummary: '',
  issues: [],
  diagnosis: [],
  prescriptions: [],
  referrals: [],
  lifestyleSuggestions: [],
  aiPromptMessage: null,
  isAwaitingDoctorResponse: false,
  voiceCommandMode: false,
  isProcessingVoiceCommand: false,

  setSessionId: (id) => set({ sessionId: id }),
  setSessionToken: (token) => set({ sessionToken: token }),
  setCurrentPatientId: (id) => set({ currentPatientId: id }),
  setSessionStatus: (status) => set({ sessionStatus: status }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setRecordingDuration: (d) => set({ recordingDuration: d }),
  incrementDuration: () => set((s) => ({ recordingDuration: s.recordingDuration + 1 })),

  addTranscript: (entry) =>
    set((state) => ({
      transcript: [...state.transcript, { ...entry, id: Date.now() }],
    })),

  setExtractionResults: (data) => set((state) => ({ ...state, ...data })),
  setIsExtracting: (isExtracting) => set({ isExtracting }),
  setAiPromptMessage: (msg) => set({ aiPromptMessage: msg }),
  setIsAwaitingDoctorResponse: (v) => set({ isAwaitingDoctorResponse: v }),
  setVoiceCommandMode: (v) => set({ voiceCommandMode: v }),
  setIsProcessingVoiceCommand: (v) => set({ isProcessingVoiceCommand: v }),

  addPrescription: (med) =>
    set((state) => ({ prescriptions: [...state.prescriptions, med] })),

  removePrescription: (id) =>
    set((state) => ({
      prescriptions: state.prescriptions.filter((p) => p.id !== id),
    })),

  updatePrescription: (id, med) =>
    set((state) => ({
      prescriptions: state.prescriptions.map((p) =>
        p.id === id ? { ...p, ...med } : p
      ),
    })),

  setPrescriptions: (meds) => set({ prescriptions: meds }),

  clearSession: () =>
    set({
      sessionId: null,
      sessionToken: null,
      sessionStatus: 'idle',
      isRecording: false,
      recordingDuration: 0,
      transcript: [],
      isExtracting: false,
      summary: '',
      patientSummary: '',
      issues: [],
      diagnosis: [],
      prescriptions: [],
      referrals: [],
      lifestyleSuggestions: [],
      aiPromptMessage: null,
      isAwaitingDoctorResponse: false,
      voiceCommandMode: false,
      isProcessingVoiceCommand: false,
    }),

  seedDemoTranscript: () =>
    set({
      transcript: [
        { id: 1, speaker: 'Doctor', time: '00:02', text: "Good morning. What brings you in today?" },
        { id: 2, speaker: 'Patient', time: '00:06', text: "Hello Doctor, I've had a bad cough for about 5 days, and I'm also running a mild fever since yesterday." },
        { id: 3, speaker: 'Doctor', time: '00:15', text: "Okay. Are you having any shortness of breath or chest pain when you cough?" },
        { id: 4, speaker: 'Patient', time: '00:21', text: "No shortness of breath, but my chest feels a bit tight and sore from coughing so much. It's a dry cough mostly." },
        { id: 5, speaker: 'Doctor', time: '00:30', text: "Let me listen to your lungs. Please take a deep breath... Lungs sound clear, but your throat is quite red. I suspect it's acute bronchitis, likely viral." },
        { id: 6, speaker: 'Patient', time: '00:45', text: "Is it serious? Do I need antibiotics?" },
        { id: 7, speaker: 'Doctor', time: '00:52', text: "No antibiotics needed since it's viral. I'll prescribe Paracetamol 650mg twice daily for 3 days after food, and Levolin Syrup 5ml three times daily for 5 days after food. Also take Cetirizine 10mg once at night for the allergic component. Drink plenty of warm fluids and rest well." },
        { id: 8, speaker: 'Patient', time: '01:12', text: "Okay, thank you doctor. Any foods to avoid?" },
        { id: 9, speaker: 'Doctor', time: '01:18', text: "Avoid cold drinks, ice cream, and cold food for the next week. If fever persists past 4 days or you feel breathless, come back immediately. I'm also referring you for a chest X-ray just to rule out pneumonia." },
      ],
      sessionStatus: 'idle',
    }),
  }),
  {
    name: 'docto-session-storage', // saves to localStorage by default
    onRehydrateStorage: () => (state) => {
      if (state) state.setHasHydrated(true)
    },
    partialize: (state) => ({
      // Only persist data that should survive a refresh
      sessionId: state.sessionId,
      sessionToken: state.sessionToken,
      currentPatientId: state.currentPatientId,
      sessionStatus: state.sessionStatus === 'recording' ? 'idle' : state.sessionStatus,
      transcript: state.transcript,
      summary: state.summary,
      patientSummary: state.patientSummary,
      issues: state.issues,
      diagnosis: state.diagnosis,
      prescriptions: state.prescriptions,
      referrals: state.referrals,
      lifestyleSuggestions: state.lifestyleSuggestions,
      aiPromptMessage: state.aiPromptMessage,
    }),
  }
))
