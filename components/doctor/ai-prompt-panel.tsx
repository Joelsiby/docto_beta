"use client"

import * as React from "react"
import { Bot, CheckCircle2, Mic, Edit2, Loader2, AlertCircle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSessionStore } from "@/stores/session-store"

interface AiPromptPanelProps {
  onConfirm: () => void
  onManualEdit: () => void
}

/**
 * AiPromptPanel — Appears after session extraction.
 * Shows AI summary + asks doctor to confirm, add more (voice), or edit manually.
 */
export function AiPromptPanel({ onConfirm, onManualEdit }: AiPromptPanelProps) {
  const {
    aiPromptMessage,
    isAwaitingDoctorResponse,
    setIsAwaitingDoctorResponse,
    voiceCommandMode,
    setVoiceCommandMode,
    isProcessingVoiceCommand,
    sessionStatus,
  } = useSessionStore()

  const [voiceActive, setVoiceActive] = React.useState(false)
  const [confirmed, setConfirmed] = React.useState(false)
  const recRef = React.useRef<any>(null)

  if (!aiPromptMessage || sessionStatus === 'idle' || sessionStatus === 'recording') {
    return null
  }

  const { message, extractedCount } = aiPromptMessage

  const handleConfirm = () => {
    setConfirmed(true)
    setIsAwaitingDoctorResponse(false)
    onConfirm()
  }

  const handleVoiceAdd = () => {
    setVoiceCommandMode(true)
    setIsAwaitingDoctorResponse(true)
  }

  return (
    <div className="rounded-[14px] border border-[#0050cb]/20 bg-gradient-to-br from-[#EBF1FF] to-white p-5 shadow-[0_1px_8px_rgba(0,80,203,0.08)] animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="h-9 w-9 rounded-xl bg-[#0050cb] flex items-center justify-center flex-shrink-0 shadow-sm">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#0050cb] uppercase tracking-wide">Docto AI</p>
          <p className="text-sm text-[#1D1D1F] leading-relaxed mt-0.5">{message}</p>
        </div>
      </div>

      {/* Extraction Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Symptoms', count: extractedCount.symptoms, color: 'text-orange-600 bg-orange-50' },
          { label: 'Diagnoses', count: extractedCount.diagnoses, color: 'text-blue-600 bg-blue-50' },
          { label: 'Medicines', count: extractedCount.prescriptions, color: 'text-green-600 bg-green-50' },
          { label: 'Referrals', count: extractedCount.referrals, color: 'text-purple-600 bg-purple-50' },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl p-2 text-center ${item.color}`}>
            <p className="text-lg font-bold">{item.count}</p>
            <p className="text-[10px] font-semibold">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      {!confirmed ? (
        <div className="flex flex-wrap gap-2">
          {/* Confirm */}
          <Button
            id="confirm-extraction-btn"
            onClick={handleConfirm}
            className="flex-1 gap-2 h-10 bg-[#34C759] hover:bg-[#2db34a] text-white font-semibold text-sm rounded-xl"
          >
            <CheckCircle2 className="h-4 w-4" />
            Looks Complete
          </Button>

          {/* Voice Add */}
          <Button
            id="voice-add-btn"
            variant="outline"
            onClick={handleVoiceAdd}
            disabled={isProcessingVoiceCommand}
            className="flex-1 gap-2 h-10 border-violet-300 text-violet-700 hover:bg-violet-50 font-semibold text-sm rounded-xl"
          >
            {isProcessingVoiceCommand ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Processing...</>
            ) : voiceCommandMode ? (
              <><span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />Listening...</>
            ) : (
              <><Mic className="h-4 w-4" />Add via Voice</>
            )}
          </Button>

          {/* Manual Edit */}
          <Button
            id="manual-edit-btn"
            variant="outline"
            onClick={onManualEdit}
            className="flex-1 gap-2 h-10 border-[#D1D1D6] text-[#3C3C43] hover:bg-[#F5F5F7] font-semibold text-sm rounded-xl"
          >
            <Edit2 className="h-4 w-4" />
            Edit Manually
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 py-2 px-4 bg-[#34C759]/10 rounded-xl">
          <CheckCircle2 className="h-4 w-4 text-[#34C759]" />
          <p className="text-sm font-semibold text-[#34C759]">
            Extraction confirmed! Review the prescription table and submit when ready.
          </p>
          <ChevronRight className="h-4 w-4 text-[#34C759] ml-auto" />
        </div>
      )}

      {/* Warning for low-confidence items */}
      <p className="mt-3 text-[10px] text-[#8E8E93] flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        Items marked with ⚠️ have low confidence — please verify before submitting.
      </p>
    </div>
  )
}
