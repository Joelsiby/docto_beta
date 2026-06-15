"use client"

import * as React from "react"
import {
  CheckCircle2,
  X,
  Pill,
  User,
  Stethoscope,
  Clock,
  Loader2,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSessionStore } from "@/stores/session-store"

interface SessionConfirmationModalProps {
  patientName: string
  onClose: () => void
  onSubmit: () => Promise<void>
}

/**
 * Final confirmation modal before session data is submitted to patient record.
 * Shows a read-only summary of everything that will be saved.
 */
export function SessionConfirmationModal({
  patientName,
  onClose,
  onSubmit,
}: SessionConfirmationModalProps) {
  const { summary, prescriptions, diagnosis, referrals, lifestyleSuggestions, sessionStatus } =
    useSessionStore()
  const [submitting, setSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await onSubmit()
      setSubmitted(true)
    } catch (error) {
      console.error('Submit failed:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const MEAL_LABELS: Record<string, string> = {
    before_meals: 'Before food',
    after_meals: 'After food',
    with_meals: 'With food',
    any: 'Any time',
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !submitting) onClose() }}
    >
      {/* Modal */}
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#34C759] flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1D1D1F]">Submit to Patient Record</h2>
              <p className="text-xs text-[#8E8E93]">Review all extracted data before confirming</p>
            </div>
          </div>
          {!submitting && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F5F5F7] text-[#8E8E93]">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Patient Badge */}
          <div className="flex items-center gap-2 bg-[#F5F5F7] rounded-xl px-4 py-3">
            <User className="h-4 w-4 text-[#8E8E93]" />
            <span className="text-sm font-semibold text-[#1D1D1F]">{patientName}</span>
            <Badge className="ml-auto bg-[#0050cb]/10 text-[#0050cb] border-none text-[10px]">
              {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Badge>
          </div>

          {/* Clinical Summary */}
          {summary && (
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93] mb-2 flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5" /> Clinical Summary
              </h3>
              <p className="text-sm text-[#3C3C43] bg-[#F5F5F7] rounded-xl p-3 leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Diagnosis */}
          {diagnosis.length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93] mb-2">Diagnosis</h3>
              <div className="space-y-1.5">
                {diagnosis.map((d, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#F5F5F7] rounded-xl px-3 py-2">
                    <span className="text-sm font-medium text-[#1D1D1F]">{d.condition}</span>
                    <Badge className="bg-blue-100 text-blue-700 border-none text-[10px] font-mono">{d.icd10}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prescriptions */}
          {prescriptions.length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93] mb-2 flex items-center gap-1.5">
                <Pill className="h-3.5 w-3.5" /> Prescriptions ({prescriptions.length})
              </h3>
              <div className="space-y-2">
                {prescriptions.map((rx, i) => (
                  <div key={rx.id} className="bg-[#F5F5F7] rounded-xl p-3 space-y-1.5">
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-semibold text-[#1D1D1F]">{i + 1}. {rx.name}</span>
                      <span className="text-xs text-[#8E8E93]">{rx.dosage}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      {(rx.whenToTake || []).map((t: string) => (
                        <span key={t} className="px-2 py-0.5 bg-white rounded-full border border-[#D1D1D6] capitalize font-medium">
                          {t.replace('_', ' ')}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200 font-medium">
                        {MEAL_LABELS[rx.mealRelation] || rx.mealRelation}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200 font-medium flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />{rx.durationDays} days
                      </span>
                    </div>
                    {rx.notes && <p className="text-[11px] text-[#8E8E93] italic">{rx.notes}</p>}
                    {rx.actions && <p className="text-[11px] text-violet-600 font-medium">→ {rx.actions}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Referrals */}
          {referrals.length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93] mb-2">Referrals & Tests</h3>
              <ul className="space-y-1">
                {referrals.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#1D1D1F]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#5856D6] mt-2 flex-shrink-0" />{r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Lifestyle */}
          {lifestyleSuggestions.length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93] mb-2">Lifestyle Advice</h3>
              <ul className="space-y-1">
                {lifestyleSuggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#1D1D1F]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#34C759] mt-2 flex-shrink-0" />{s.suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* HIPAA Disclaimer */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-800 leading-relaxed">
            <strong>Privacy Notice:</strong> This session data will be encrypted and stored securely in the patient's medical record. Only you and the patient can access it. All actions are logged for compliance.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black/5 flex gap-3">
          {submitted ? (
            <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#34C759]/10 rounded-xl">
              <CheckCircle2 className="h-5 w-5 text-[#34C759]" />
              <span className="text-sm font-bold text-[#34C759]">Successfully submitted to patient record!</span>
            </div>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} disabled={submitting} className="flex-1 h-11 rounded-xl">
                Cancel
              </Button>
              <Button
                id="final-submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 h-11 bg-[#34C759] hover:bg-[#2db34a] text-white font-bold rounded-xl gap-2"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Submitting...</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" />Confirm & Submit to Patient</>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
