"use client"

import * as React from "react"
import { Pill, Plus, Trash2, Edit2, Check, X, AlertTriangle, Mic, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSessionStore, ExtractedPrescription } from "@/stores/session-store"

const MEAL_LABELS: Record<string, string> = {
  before_meals: 'Before Food',
  after_meals: 'After Food',
  with_meals: 'With Food',
  any: 'Any Time',
}

const TIMING_OPTIONS = [
  { key: 'morning', label: 'Morning', color: 'bg-amber-100 text-amber-800' },
  { key: 'afternoon', label: 'Afternoon', color: 'bg-orange-100 text-orange-800' },
  { key: 'evening', label: 'Evening', color: 'bg-purple-100 text-purple-800' },
  { key: 'night', label: 'Night', color: 'bg-indigo-100 text-indigo-800' },
  { key: 'as_needed', label: 'As Needed', color: 'bg-gray-100 text-gray-700' },
]

// ── Editable Cell ─────────────────────────────────────────────────────────────

function EditableCell({
  value,
  onSave,
  className = '',
}: {
  value: string
  onSave: (v: string) => void
  className?: string
}) {
  const [editing, setEditing] = React.useState(false)
  const [val, setVal] = React.useState(value)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const save = () => {
    setEditing(false)
    onSave(val)
  }

  if (!editing) {
    return (
      <span
        className={`cursor-pointer hover:bg-[#F5F5F7] rounded px-1 py-0.5 transition-colors group inline-flex items-center gap-1.5 ${className}`}
        onClick={() => {
          setVal(value)
          setEditing(true)
        }}
        title="Click to edit"
      >
        <span>{value || <span className="text-[#C7C7CC] italic text-xs">Add...</span>}</span>
        <Edit2 className="h-3 w-3 text-[#C7C7CC] opacity-0 group-hover:opacity-100 transition-opacity" />
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={inputRef}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
        className="border border-[#0050cb] rounded px-2 py-0.5 text-xs w-full outline-none bg-white"
      />
      <button onClick={save} className="text-[#34C759] hover:opacity-70"><Check className="h-3.5 w-3.5" /></button>
      <button onClick={() => setEditing(false)} className="text-[#FF3B30] hover:opacity-70"><X className="h-3.5 w-3.5" /></button>
    </div>
  )
}

// ── When To Take Multi-selector ───────────────────────────────────────────────

function WhenToTakeSelector({
  value,
  onChange,
}: {
  value: string[]
  onChange: (v: string[]) => void
}) {
  const toggle = (key: string) => {
    if (value.includes(key)) {
      onChange(value.filter((v) => v !== key))
    } else {
      onChange([...value, key])
    }
  }

  return (
    <div className="flex flex-wrap gap-1">
      {TIMING_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => toggle(opt.key)}
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
            value.includes(opt.key)
              ? opt.color + ' border-transparent'
              : 'bg-white border-[#D1D1D6] text-[#8E8E93] hover:border-[#8E8E93]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ── Meal Relation Selector ────────────────────────────────────────────────────

function MealSelector({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-[11px] border border-[#D1D1D6] rounded-lg px-2 py-1 bg-white text-[#1D1D1F] outline-none focus:border-[#0050cb] cursor-pointer"
    >
      {Object.entries(MEAL_LABELS).map(([k, v]) => (
        <option key={k} value={k}>{v}</option>
      ))}
    </select>
  )
}

// ── Empty Row Template ────────────────────────────────────────────────────────

function createEmptyPrescription(): ExtractedPrescription {
  return {
    id: `rx_${Date.now()}`,
    name: '',
    dosage: '',
    whenToTake: ['morning'],
    timing: ['08:00'],
    mealRelation: 'after_meals',
    durationDays: 5,
    notes: '',
    actions: '',
    confidence: 'high',
  }
}

// ── Add Medicine Form ─────────────────────────────────────────────────────────

function AddMedicineForm({
  onAdd,
  onCancel,
}: {
  onAdd: (med: ExtractedPrescription) => void
  onCancel: () => void
}) {
  const [med, setMed] = React.useState<ExtractedPrescription>(createEmptyPrescription())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!med.name.trim()) return
    onAdd(med)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up border border-black/10">
        <div className="bg-[#F8F9FA] border-b border-black/5 p-4 flex items-center justify-between">
          <h4 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
            <Pill className="h-4 w-4 text-[#0050cb]" /> Add New Medicine
          </h4>
          <button onClick={onCancel} className="text-[#8E8E93] hover:text-[#1D1D1F] transition-colors p-1 rounded-md hover:bg-black/5">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <label className="block text-[10px] font-semibold text-[#8E8E93] uppercase mb-1">Medicine Name *</label>
            <input
              autoFocus
              required
              value={med.name}
              onChange={(e) => setMed({ ...med, name: e.target.value })}
              className="w-full border border-[#D1D1D6] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#0050cb]"
              placeholder="e.g. Paracetamol"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#8E8E93] uppercase mb-1">Dosage</label>
            <input
              value={med.dosage}
              onChange={(e) => setMed({ ...med, dosage: e.target.value })}
              className="w-full border border-[#D1D1D6] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#0050cb]"
              placeholder="e.g. 650mg"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#8E8E93] uppercase mb-1">Duration (days)</label>
            <input
              type="number"
              min={1}
              value={med.durationDays}
              onChange={(e) => setMed({ ...med, durationDays: parseInt(e.target.value) || 1 })}
              className="w-full border border-[#D1D1D6] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#0050cb]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-[#8E8E93] uppercase mb-1">When to take</label>
            <WhenToTakeSelector
              value={med.whenToTake}
              onChange={(v) => setMed({ ...med, whenToTake: v })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#8E8E93] uppercase mb-1">Meals</label>
            <MealSelector
              value={med.mealRelation}
              onChange={(v) => setMed({ ...med, mealRelation: v as any })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-[#8E8E93] uppercase mb-1">Notes</label>
            <input
              value={med.notes}
              onChange={(e) => setMed({ ...med, notes: e.target.value })}
              className="w-full border border-[#D1D1D6] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#0050cb]"
              placeholder="e.g. For fever"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#8E8E93] uppercase mb-1">Actions</label>
            <input
              value={med.actions}
              onChange={(e) => setMed({ ...med, actions: e.target.value })}
              className="w-full border border-[#D1D1D6] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#0050cb]"
              placeholder="e.g. Stop if rash appears"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-black/5 mt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="text-xs h-9">
            Cancel
          </Button>
          <Button type="submit" size="sm" className="bg-[#0050cb] hover:bg-[#0040a8] text-white text-xs h-9 px-6 rounded-lg shadow-sm">
            Add to Prescription
          </Button>
        </div>
      </form>
    </div>
    </div>
  )
}

// ── Main Prescription Table ───────────────────────────────────────────────────

export function PrescriptionTable() {
  const {
    prescriptions,
    isExtracting,
    sessionStatus,
    removePrescription,
    updatePrescription,
    addPrescription,
    voiceCommandMode,
    setVoiceCommandMode,
    setIsProcessingVoiceCommand,
    setPrescriptions,
  } = useSessionStore()

  const [voiceRecognitionActive, setVoiceRecognitionActive] = React.useState(false)
  const [showAddForm, setShowAddForm] = React.useState(false)
  const voiceRecognitionRef = React.useRef<any>(null)

  // ── Voice Command Handler ──────────────────────────────────────────────────

  const startVoiceCommand = React.useCallback(() => {
    if (typeof window === "undefined") return
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Voice commands not supported in this browser. Please use Chrome.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setVoiceRecognitionActive(true)

    recognition.onresult = async (event: any) => {
      const command = event.results[0][0].transcript
      setVoiceRecognitionActive(false)
      setIsProcessingVoiceCommand(true)

      try {
        const res = await fetch('/api/session/voice-command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            command,
            currentPrescriptions: prescriptions,
            language: 'en',
          }),
        })
        const data = await res.json()
        if (data.success && data.prescriptions) {
          setPrescriptions(data.prescriptions)
        }
      } catch (err) {
        console.error('Voice command failed:', err)
      } finally {
        setIsProcessingVoiceCommand(false)
        setVoiceCommandMode(false)
      }
    }

    recognition.onerror = () => {
      setVoiceRecognitionActive(false)
      setIsProcessingVoiceCommand(false)
    }

    voiceRecognitionRef.current = recognition
    recognition.start()
  }, [prescriptions, setIsProcessingVoiceCommand, setPrescriptions, setVoiceCommandMode])

  // Auto-start voice recognition when mode is activated
  React.useEffect(() => {
    if (voiceCommandMode && !voiceRecognitionActive) {
      startVoiceCommand()
    }
  }, [voiceCommandMode, voiceRecognitionActive, startVoiceCommand])

  // ── Row Actions ────────────────────────────────────────────────────────────

  const handleUpdate = (id: string, field: keyof ExtractedPrescription, value: any) => {
    updatePrescription(id, { [field]: value })
  }

  const handleAddSubmit = (med: ExtractedPrescription) => {
    addPrescription(med)
    setShowAddForm(false)
  }

  return (
    <Card className="rounded-[14px] overflow-hidden bg-white border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <CardHeader className="bg-white border-b border-black/5 pb-4 pt-5 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight text-[#1D1D1F]">
            <div className="p-1 rounded-md bg-blue-50 text-[#0050cb]">
              <Pill className="h-3.5 w-3.5" />
            </div>
            Prescription Table
            {prescriptions.length > 0 && (
              <Badge className="ml-1 bg-[#0050cb]/10 text-[#0050cb] border-none text-[10px]">
                {prescriptions.length} medicine{prescriptions.length > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Voice command button */}
            {sessionStatus === 'review' && (
              <Button
                size="sm"
                variant="outline"
                className={`gap-1.5 h-8 text-xs border-violet-200 text-violet-700 hover:bg-violet-50 ${
                  voiceCommandMode ? 'bg-violet-100' : ''
                }`}
                onClick={() => setVoiceCommandMode(!voiceCommandMode)}
              >
                {voiceRecognitionActive ? (
                  <><span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />Listening...</>
                ) : (
                  <><Mic className="h-3.5 w-3.5" />Voice Add</>
                )}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="gap-1 h-8 text-xs text-[#0050cb] border-[#0050cb]/20 hover:bg-[#0050cb]/5"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-3.5 w-3.5" /> Add Medicine
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {showAddForm && (
          <AddMedicineForm
            onAdd={handleAddSubmit}
            onCancel={() => setShowAddForm(false)}
          />
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F5F7] text-[#8E8E93] text-[10px] uppercase font-bold tracking-wider sticky top-0">
              <tr>
                <th className="px-4 py-3 w-6">#</th>
                <th className="px-4 py-3 min-w-[140px]">Medicine Name</th>
                <th className="px-4 py-3 min-w-[80px]">Dosage</th>
                <th className="px-4 py-3 min-w-[180px]">When to Take</th>
                <th className="px-4 py-3 min-w-[120px]">Meals</th>
                <th className="px-4 py-3 min-w-[70px]">Duration</th>
                <th className="px-4 py-3 min-w-[120px]">Notes</th>
                <th className="px-4 py-3 min-w-[100px]">Actions</th>
                <th className="px-4 py-3 w-20 text-right">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {prescriptions.map((med, index) => (
                <tr
                  key={med.id}
                  className={`hover:bg-[#F5F5F7]/50 transition-colors animate-fade-in-up ${
                    med.confidence === 'low' ? 'bg-amber-50/40' : ''
                  }`}
                >
                  {/* Row Number */}
                  <td className="px-4 py-3 text-[#8E8E93] font-mono">{index + 1}</td>

                  {/* Medicine Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <EditableCell
                        value={med.name}
                        onSave={(v) => handleUpdate(med.id, 'name', v)}
                        className="font-semibold text-[#1D1D1F]"
                      />
                      {med.confidence === 'low' && (
                        <span title="Low confidence — please verify">
                          <AlertTriangle className="h-3 w-3 text-amber-500 flex-shrink-0" />
                        </span>
                      )}
                    </div>
                    {med.interactionWarning && (
                      <div className="mt-1 flex items-start gap-1 text-[10px] text-red-600 bg-red-50 rounded px-2 py-1">
                        <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                        <span>{med.interactionWarning}</span>
                      </div>
                    )}
                  </td>

                  {/* Dosage */}
                  <td className="px-4 py-3">
                    <EditableCell
                      value={med.dosage}
                      onSave={(v) => handleUpdate(med.id, 'dosage', v)}
                      className="text-[#3C3C43]"
                    />
                  </td>

                  {/* When to Take */}
                  <td className="px-4 py-3">
                    <WhenToTakeSelector
                      value={med.whenToTake || []}
                      onChange={(v) => handleUpdate(med.id, 'whenToTake', v)}
                    />
                  </td>

                  {/* Meal Relation */}
                  <td className="px-4 py-3">
                    <MealSelector
                      value={med.mealRelation || 'any'}
                      onChange={(v) => handleUpdate(med.id, 'mealRelation', v as any)}
                    />
                  </td>

                  {/* Duration */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={365}
                        value={med.durationDays || ''}
                        onChange={(e) => handleUpdate(med.id, 'durationDays', parseInt(e.target.value))}
                        className="w-10 border border-[#D1D1D6] rounded px-1.5 py-0.5 text-center outline-none focus:border-[#0050cb] text-xs"
                      />
                      <span className="text-[#8E8E93] text-[10px]">days</span>
                    </div>
                  </td>

                  {/* Notes */}
                  <td className="px-4 py-3">
                    <EditableCell
                      value={med.notes}
                      onSave={(v) => handleUpdate(med.id, 'notes', v)}
                      className="text-[#3C3C43]"
                    />
                  </td>

                  {/* Actions (monitoring, follow-up) */}
                  <td className="px-4 py-3">
                    <EditableCell
                      value={med.actions}
                      onSave={(v) => handleUpdate(med.id, 'actions', v)}
                      className="text-[#5856D6]"
                    />
                  </td>

                  {/* Delete */}
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-[#FF3B30] hover:bg-red-50"
                      onClick={() => removePrescription(med.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}

              {/* Empty state */}
              {prescriptions.length === 0 && !isExtracting && (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-[#8E8E93] text-xs">
                    No prescriptions yet. Stop the recording to let AI extract prescriptions, or add manually.
                  </td>
                </tr>
              )}

              {/* Loading state */}
              {isExtracting && (
                <tr>
                  <td colSpan={9} className="px-6 py-10">
                    <div className="flex flex-col items-center gap-3 text-[#0050cb] animate-pulse">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-xs font-medium">AI is extracting prescriptions from transcript...</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-[#F5F5F7] px-5 py-3 flex items-center justify-between border-t border-black/5">
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#8E8E93]">
            {isExtracting ? (
              <><span className="h-2 w-2 rounded-full bg-[#0050cb] animate-ping" />Extracting from audio...</>
            ) : prescriptions.length > 0 ? (
              <><span className="h-2 w-2 rounded-full bg-[#34C759] shadow-[0_0_6px_rgba(52,199,89,0.5)]" />AI synced — click any cell to edit</>
            ) : (
              <><span className="h-2 w-2 rounded-full bg-[#D1D1D6]" />Awaiting session data</>
            )}
          </div>
          {prescriptions.some(p => p.confidence === 'low') && (
            <span className="text-[10px] text-amber-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Review flagged items before submitting
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
