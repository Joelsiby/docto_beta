"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Activity,
  CheckCircle2,
  Loader2,
  ClipboardList,
  Bot,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SessionRecorder } from "@/components/doctor/session-recorder"
import { TranscriptViewer } from "@/components/doctor/transcript-viewer"
import { PrescriptionTable } from "@/components/doctor/prescription-table"
import { AiPromptPanel } from "@/components/doctor/ai-prompt-panel"
import { SessionConfirmationModal } from "@/components/doctor/session-confirmation-modal"
import { useSessionStore } from "@/stores/session-store"
import { checkLocalInteractions } from "@/lib/medical/openfda"
import { createClient } from "@/lib/supabase/client"

// ── Status Badge Config ────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  idle: { label: "Ready", className: "bg-[#D1D1D6] text-[#3C3C43]" },
  recording: { label: "● Recording", className: "bg-red-100 text-red-600 animate-pulse" },
  processing: { label: "⟳ Analyzing", className: "bg-blue-100 text-blue-600" },
  review: { label: "Review Required", className: "bg-amber-100 text-amber-700" },
  confirmed: { label: "✓ Confirmed", className: "bg-green-100 text-green-700" },
  submitted: { label: "✓ Submitted", className: "bg-green-100 text-green-700" },
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ClinicalSessionPage() {
  const params = useParams()
  // patientId from URL is used internally only — never re-exposed in URLs to patient-facing pages
  const patientId = params.patientId as string

  const {
    sessionStatus,
    sessionId,
    prescriptions,
    transcript,
    summary,
    patientSummary,
    issues,
    diagnosis,
    referrals,
    lifestyleSuggestions,
    setIsExtracting,
    setExtractionResults,
    setSessionStatus,
    setAiPromptMessage,
    setSessionId,
    clearSession,
    isExtracting,
    aiPromptMessage,
    currentPatientId,
    setCurrentPatientId,
    hasHydrated,
  } = useSessionStore()

  const [patientData, setPatientData] = React.useState<any>(null)
  const [loadingPatient, setLoadingPatient] = React.useState(true)
  const [ready, setReady] = React.useState(false)
  const initialPatientRef = React.useRef(patientId)

  // ── Prevent Data Leaking Between Patients ──────────────────────────────────
  // Must run BEFORE fetching patient data or rendering any session UI.
  // If the persisted store has data from a different patient, clear it
  // immediately so the user never sees stale data.
  React.useEffect(() => {
    if (!hasHydrated) return
    initialPatientRef.current = patientId

    const shouldClear = 
      (currentPatientId !== null && currentPatientId !== patientId)

    if (shouldClear) {
      clearSession()
      setCurrentPatientId(patientId)
    } else if (currentPatientId === null) {
      setCurrentPatientId(patientId)
    }
    setReady(true)
  }, [patientId, currentPatientId, sessionStatus, clearSession, setCurrentPatientId, hasHydrated])

  // ── Fetch Patient Data ─────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!ready) return
    async function fetchPatient() {
      setLoadingPatient(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('id', patientId)
        .single()
        
      if (data && !error) {
        setPatientData(data)
      } else {
        console.error("Failed to fetch patient:", error)
      }
      setLoadingPatient(false)
    }
    if (patientId) fetchPatient()
  }, [patientId, ready])

  const [showConfirmModal, setShowConfirmModal] = React.useState(false)
  const [prescriptionId, setPrescriptionId] = React.useState<string | null>(null)
  const [localInteractionWarnings, setLocalInteractionWarnings] = React.useState<string[]>([])

  // Check local interactions whenever prescriptions change
  React.useEffect(() => {
    if (prescriptions.length > 1) {
      const warnings = checkLocalInteractions(prescriptions)
      setLocalInteractionWarnings(warnings)
    } else {
      setLocalInteractionWarnings([])
    }
  }, [prescriptions])

  // ── Trigger AI Extraction when recording stops ─────────────────────────────

  const handleRecordingStop = React.useCallback(async () => {
    if (transcript.length === 0) {
      setSessionStatus('idle')
      return
    }

    setIsExtracting(true)

    try {
      const fullTranscript = transcript
        .map((t) => `${t.speaker}: ${t.text}`)
        .join("\n")

      const response = await fetch('/api/session/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: fullTranscript }),
      })

      if (!response.ok) throw new Error("Extraction failed")

      const { data } = await response.json()

      if (data) {
        // Map API response fields to store fields
        setExtractionResults({
          summary: data.summary || '',
          patientSummary: data.patient_summary || '',
          issues: data.issues || [],
          diagnosis: data.diagnosis || [],
          referrals: data.referrals || [],
          lifestyleSuggestions: data.lifestyle_suggestions || [],
          prescriptions: (data.prescriptions || []).map((rx: any) => ({
            id: rx.id,
            name: rx.name,
            dosage: rx.dosage,
            whenToTake: rx.when_to_take || [],
            timing: rx.timing || [],
            mealRelation: rx.meal_relation || 'any',
            durationDays: rx.duration_days || 0,
            notes: rx.notes || '',
            actions: rx.actions || '',
            confidence: rx.confidence || 'medium',
            interactionWarning: rx.interactionWarning,
          })),
        })

        if (data.aiPromptMessage) {
          setAiPromptMessage(data.aiPromptMessage)
        }

        setSessionStatus('review')

        // Save session to Supabase (non-blocking)
        saveSessionToSupabase(data)
      }
    } catch (error) {
      console.error("Extraction error:", error)
      setSessionStatus('review') // Still let doctor work manually
    } finally {
      setIsExtracting(false)
    }
  }, [transcript, setIsExtracting, setExtractionResults, setSessionStatus, setAiPromptMessage])

  // Listen for manual extraction trigger (for demo transcript)
  React.useEffect(() => {
    const handler = () => {
      setSessionStatus('processing')
      handleRecordingStop()
    }
    window.addEventListener('trigger-extraction', handler)
    return () => window.removeEventListener('trigger-extraction', handler)
  }, [handleRecordingStop, setSessionStatus])

  // ── Save to Supabase ───────────────────────────────────────────────────────

  const saveSessionToSupabase = async (extractedData: any) => {
    let currentSessionId = sessionId

    try {
      if (!currentSessionId) {
        // Create session if it doesn't exist
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) throw new Error("No authenticated user found")

        const startRes = await fetch('/api/session/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId, doctorId: user.id }),
        })
        const startData = await startRes.json()
        
        if (startData.sessionId) {
          currentSessionId = startData.sessionId
          setSessionId(currentSessionId as string)
        } else {
          throw new Error("Failed to create session")
        }
      }

      const res = await fetch('/api/session/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          transcript,
          summary: extractedData.summary,
          patientSummary: extractedData.patient_summary,
          issues: extractedData.issues,
          diagnosis: extractedData.diagnosis,
          referrals: extractedData.referrals,
          lifestyleSuggestions: extractedData.lifestyle_suggestions,
          prescriptions: extractedData.prescriptions,
        }),
      })
      const data = await res.json()
      if (data.prescriptionId) {
        setPrescriptionId(data.prescriptionId)
      }
    } catch (error) {
      console.error("Failed to save session to Supabase:", error)
    }
  }

  // ── Submit to Patient Record ───────────────────────────────────────────────

  const handleFinalSubmit = async () => {
    // 1. Save doctor's edited prescriptions to DB before submitting
    //    This ensures doctor edits (in Zustand store) are not lost
    if (prescriptionId && prescriptions.length > 0) {
      await fetch('/api/session/update-prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId, prescriptions }),
      })
    } else if (prescriptions.length > 0 && !prescriptionId) {
      // No prescriptionId yet — create prescription + items inline
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user && patientId) {
        const { data: doctorProfile } = await supabase
          .from('doctor_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()
        if (doctorProfile) {
          const { data: newRx } = await (supabase as any)
            .from('prescriptions')
            .insert({
              session_id: sessionId,
              doctor_id: (doctorProfile as any).id,
              patient_id: patientId,
              is_confirmed: false,
            })
            .select('id')
            .single()
          if (newRx) {
            const items = prescriptions.map((rx: any, i: number) => ({
              prescription_id: newRx.id,
              medicine_name: rx.name,
              medication_name: rx.name,
              dosage: rx.dosage || null,
              when_to_take: rx.whenToTake || ['morning'],
              timing: rx.timing || [],
              meal_relation: rx.mealRelation || 'any',
              duration_days: rx.durationDays || 7,
              notes: rx.notes || null,
              actions: rx.actions || null,
              sort_order: i,
            }))
            await (supabase as any).from('prescription_items').insert(items)
            // Use this new prescriptionId for submission
            const submitRes = await fetch('/api/session/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId, prescriptionId: newRx.id, patientId }),
            })
            if (submitRes.ok) {
              setSessionStatus('submitted')
              setShowConfirmModal(false)
            }
            return
          }
        }
      }
    }

    // 2. Submit — reads updated prescription_items from DB and populates medication_schedule
    const res = await fetch('/api/session/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, prescriptionId, patientId }),
    })
    if (res.ok) {
      setSessionStatus('submitted')
      setShowConfirmModal(false)
    } else {
      console.error('Submit failed:', await res.text())
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const statusBadge = STATUS_BADGE[sessionStatus] || STATUS_BADGE.idle
  const isProcessing = sessionStatus === 'processing' || isExtracting

  // Don't render session UI until the store is cleared for this patient
  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F5F7]">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-[#0050cb]/20 border-t-[#0050cb] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#8E8E93]">Preparing session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 bg-[#F5F5F7] h-screen p-6 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link href="/doctor/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#1D1D1F]">Clinical Session</h1>
              <Badge className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border-0 ${statusBadge.className}`}>
                {statusBadge.label}
              </Badge>
            </div>
            <p className="text-xs text-[#8E8E93] mt-0.5">
              {loadingPatient ? 'Loading...' : `${patientData?.full_name || 'Unknown Patient'} · ${
                patientData?.date_of_birth
                  ? Math.floor((Date.now() - new Date(patientData.date_of_birth).getTime()) / 31557600000) + 'y'
                  : 'N/A'
              } · Consultation`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" asChild>
            <Link href={`/doctor/patients`}>
              <FileText className="h-3.5 w-3.5" /> Patient History
            </Link>
          </Button>
          {sessionStatus === 'review' && (
            <Button
              id="open-submit-modal-btn"
              size="sm"
              className="gap-1.5 h-8 text-xs bg-[#34C759] hover:bg-[#2db34a] text-white font-semibold"
              onClick={() => setShowConfirmModal(true)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Submit to Patient
            </Button>
          )}
          {sessionStatus === 'submitted' && (
            <Badge className="h-8 px-3 bg-green-100 text-green-700 border-0 font-semibold text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Session Submitted
            </Badge>
          )}
        </div>
      </div>

      {/* ── Patient Info Strip ── */}
      <div className="bg-white rounded-[14px] border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] px-5 py-3">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0050cb] to-[#5856D6] flex items-center justify-center text-white font-bold text-sm">
              {patientData?.full_name?.[0] || '?'}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1D1D1F]">{patientData?.full_name || 'Loading...'}</p>
              <p className="text-[10px] text-[#8E8E93]">{patientData?.gender || 'N/A'} · {patientData?.blood_group || 'N/A'}</p>
            </div>
          </div>
          {[
            { icon: User, label: "Age", value: patientData?.date_of_birth ? `${Math.floor((Date.now() - new Date(patientData.date_of_birth).getTime()) / 31557600000)} years` : 'N/A' },
            { icon: Calendar, label: "Last Visit", value: "First Visit" },
            { icon: Activity, label: "Visit Type", value: "Consultation" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs">
              <Icon className="h-3.5 w-3.5 text-[#8E8E93]" />
              <span className="text-[#8E8E93]">{label}:</span>
              <span className="font-semibold text-[#1D1D1F]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Local Drug Interaction Warning Banner ── */}
      {localInteractionWarnings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-[14px] px-5 py-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-700 mb-1">Drug Interaction Warnings</p>
              {localInteractionWarnings.map((w, i) => (
                <p key={i} className="text-xs text-red-600">⚠️ {w}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 flex-1 min-h-0">

        {/* ── Left Column ── */}
        <div className="xl:col-span-1 space-y-4">

          {/* Session Recorder */}
          <SessionRecorder onStop={handleRecordingStop} />

          {/* AI Extraction Status Card */}
          <div className="rounded-[14px] p-4 bg-white border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-blue-50 text-[#0050cb]">
                <Bot className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-[#1D1D1F] text-xs tracking-tight">AI Extraction Engine</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "Symptoms & Issues", count: issues.length },
                { label: "Diagnosis (ICD-10)", count: diagnosis.length },
                { label: "Prescriptions", count: prescriptions.length },
                { label: "Referrals & Tests", count: referrals.length },
                { label: "Lifestyle Advice", count: lifestyleSuggestions.length },
              ].map(({ label, count }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#1D1D1F]">{label}</span>
                  {isProcessing ? (
                    <span className="text-[#0050cb] flex items-center gap-1 font-semibold animate-pulse">
                      <Loader2 className="h-3 w-3 animate-spin" />Analyzing
                    </span>
                  ) : count > 0 ? (
                    <span className="text-[#34C759] flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="h-3 w-3" />{count} found
                    </span>
                  ) : (
                    <span className="text-[#D1D1D6] font-medium">Waiting...</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Patient Summary Preview (for doctor's reference) */}
          {patientSummary && (
            <div className="rounded-[14px] p-4 bg-gradient-to-br from-[#EBF1FF] to-white border border-[#0050cb]/15 shadow-[0_1px_3px_rgba(0,80,203,0.06)]">
              <div className="flex items-center gap-1.5 mb-2">
                <ClipboardList className="h-3.5 w-3.5 text-[#0050cb]" />
                <h3 className="text-[11px] font-bold text-[#0050cb] uppercase tracking-wide">Patient Summary Preview</h3>
              </div>
              <p className="text-xs text-[#3C3C43] leading-relaxed">{patientSummary}</p>
              <p className="text-[10px] text-[#8E8E93] mt-2">This is what the patient will see.</p>
            </div>
          )}
        </div>

        {/* ── Right Column ── */}
        <div className="xl:col-span-2 space-y-4 overflow-y-auto pr-2 pb-6 styled-scrollbar">

          {/* Transcript Viewer */}
          <TranscriptViewer />

          {/* AI Prompt Panel (post-extraction) */}
          {aiPromptMessage && (
            <AiPromptPanel
              onConfirm={() => {}}
              onManualEdit={() => {
                const tableEl = document.getElementById('prescription-table-section')
                tableEl?.scrollIntoView({ behavior: 'smooth' })
              }}
            />
          )}

          {/* Prescription Table */}
          <div id="prescription-table-section">
            <PrescriptionTable />
          </div>

          {/* Final Submit Button (bottom of page) */}
          {sessionStatus === 'review' && (
            <div className="bg-white rounded-[14px] border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4 flex items-center justify-between gap-4">
              <div className="text-xs text-[#8E8E93]">
                <p className="font-semibold text-[#1D1D1F] mb-0.5">Ready to submit?</p>
                <p>Review prescriptions above, then submit to update the patient's medical record.</p>
              </div>
              <Button
                id="submit-to-patient-btn"
                onClick={() => setShowConfirmModal(true)}
                className="bg-[#34C759] hover:bg-[#2db34a] text-white font-bold gap-2 h-11 px-6 rounded-xl flex-shrink-0"
              >
                <CheckCircle2 className="h-4 w-4" />
                Submit to Patient Record
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirmation Modal ── */}
      {showConfirmModal && (
        <SessionConfirmationModal
          patientName={patientData?.full_name || 'Patient'}
          onClose={() => setShowConfirmModal(false)}
          onSubmit={handleFinalSubmit}
        />
      )}
    </div>
  )
}
