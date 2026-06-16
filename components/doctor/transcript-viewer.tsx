"use client"

import * as React from "react"
import { MessageSquareText, Sparkles, User, Stethoscope, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSessionStore } from "@/stores/session-store"

export function TranscriptViewer() {
  const {
    isRecording,
    sessionStatus,
    transcript,
    summary,
    patientSummary,
    issues,
    diagnosis,
    referrals,
    lifestyleSuggestions,
    seedDemoTranscript,
    isExtracting,
    setSessionStatus,
  } = useSessionStore()

  const hasSummary = summary || issues.length > 0 || diagnosis.length > 0
  const [activeTab, setActiveTab] = React.useState<'transcript' | 'clinical' | 'patient'>(
    hasSummary ? 'clinical' : 'transcript'
  )
  const [autoScroll, setAutoScroll] = React.useState(true)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll during recording
  React.useEffect(() => {
    if (autoScroll && scrollRef.current && (isRecording || transcript.length > 0)) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [transcript, autoScroll, isRecording])

  // Switch to clinical tab after extraction
  React.useEffect(() => {
    if (sessionStatus === 'review' && summary) {
      setActiveTab('clinical')
    }
  }, [sessionStatus, summary])

  // Only keep autoScroll and effects

  return (
    <Card className="flex flex-col rounded-[14px] overflow-hidden bg-white border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]" style={{ height: '420px' }}>
      {/* Header */}
      <CardHeader className="bg-white border-b border-black/5 pb-0 pt-4 px-5">
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight text-[#1D1D1F]">
            <div className="p-1 rounded-md bg-blue-50 text-[#0050cb]">
              <MessageSquareText className="h-3.5 w-3.5" />
            </div>
            Session Transcript
          </CardTitle>
          <Badge
            variant={isRecording ? "success" : "secondary"}
            className="text-[10px] font-semibold"
          >
            {isRecording ? "● Live" : sessionStatus === 'processing' ? "Analyzing..." : "Ready"}
          </Badge>
        </div>

        {/* Toggle Button Segmented Control */}
        <div className="bg-[#F5F5F7] p-1 rounded-lg flex items-center mb-1 max-w-[350px]">
          {(
            [
              { key: 'clinical', label: 'Clinical Summary', show: hasSummary },
              { key: 'patient', label: 'Patient View', show: !!patientSummary },
              { key: 'transcript', label: 'Transcript', show: true },
            ] as const
          )
            .filter((t) => t.show)
            .map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                  activeTab === tab.key
                    ? 'bg-white text-[#1D1D1F] shadow-sm'
                    : 'text-[#8E8E93] hover:text-[#3C3C43]'
                }`}
              >
                {tab.label}
              </button>
            ))}
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 overflow-y-auto p-0" ref={scrollRef}>

        {/* ── Live Transcript Tab ── */}
        {activeTab === 'transcript' && (
          <div className="p-4 space-y-3">
            {transcript.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-[#8E8E93] text-sm gap-4">
                {isRecording ? (
                  <div className="flex gap-1.5 items-center">
                    <span className="h-2 w-2 bg-[#0050cb] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 bg-[#0050cb] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 bg-[#0050cb] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-center">Start recording to see live transcript, or use a demo session.</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        seedDemoTranscript()
                        setSessionStatus('idle')
                      }}
                      className="text-[#0050cb] border-[#0050cb]/20 hover:bg-[#0050cb]/5 text-xs"
                    >
                      Load Demo Transcript
                    </Button>
                  </>
                )}
              </div>
            ) : (
              transcript.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex gap-3 animate-fade-in-up ${
                    entry.speaker === 'Doctor' ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      entry.speaker === 'Doctor'
                        ? 'bg-[#0050cb]'
                        : 'bg-[#34C759]'
                    }`}
                  >
                    {entry.speaker === 'Doctor' ? (
                      <Stethoscope className="h-3.5 w-3.5" />
                    ) : (
                      <User className="h-3.5 w-3.5" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                      entry.speaker === 'Doctor'
                        ? 'bg-[#EBF1FF] text-[#1D1D1F] rounded-tl-sm'
                        : 'bg-[#E8FFF0] text-[#1D1D1F] rounded-tr-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold ${entry.speaker === 'Doctor' ? 'text-[#0050cb]' : 'text-[#34C759]'}`}>
                        {entry.speaker}
                      </span>
                      <span className="text-[10px] text-[#8E8E93]">{entry.time}</span>
                    </div>
                    <p className="text-xs leading-relaxed">{entry.text}</p>
                  </div>
                </div>
              ))
            )}

            {/* Auto-scroll indicator */}
            {transcript.length > 0 && (
              <div className="flex flex-col items-center gap-3 mt-4">
                {sessionStatus === 'idle' && !isRecording && (
                  <Button
                    id="manual-extract-btn"
                    onClick={() => {
                      setSessionStatus('processing')
                      // Custom event to trigger extraction from page.tsx
                      window.dispatchEvent(new CustomEvent('trigger-extraction'))
                    }}
                    className="w-full bg-[#0050cb] hover:bg-[#0040a8] text-white font-semibold text-xs h-9 rounded-xl shadow-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-2" />
                    Extract AI Insights
                  </Button>
                )}
                
                <button
                  onClick={() => {
                    setAutoScroll(true)
                    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
                  }}
                  className="flex items-center gap-1 text-[10px] text-[#8E8E93] hover:text-[#0050cb] mx-auto"
                >
                  <ChevronDown className="h-3 w-3" /> Scroll to latest
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Clinical Summary Tab ── */}
        {activeTab === 'clinical' && (
          <div className="p-4 space-y-4">
            {isExtracting ? (
              <div className="flex flex-col items-center justify-center h-32 gap-3">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 bg-[#0050cb] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 bg-[#0050cb] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 bg-[#0050cb] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-xs text-[#8E8E93] font-medium">AI is analyzing session...</p>
              </div>
            ) : (
              <>
                {summary && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93] mb-1.5">Clinical Summary</h4>
                    <p className="text-xs leading-relaxed text-[#1D1D1F] bg-[#F5F5F7] rounded-xl p-3">{summary}</p>
                  </div>
                )}

                {issues.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93] mb-1.5">Symptoms & Issues</h4>
                    <ul className="space-y-1">
                      {issues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#1D1D1F]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF9500] mt-1.5 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {diagnosis.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93] mb-1.5">Diagnosis</h4>
                    <div className="space-y-1.5">
                      {diagnosis.map((d, i) => (
                        <div key={i} className="flex items-center justify-between bg-[#F5F5F7] rounded-xl px-3 py-2">
                          <span className="text-xs font-medium text-[#1D1D1F]">{d.condition}</span>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="secondary" className="text-[10px] font-mono bg-blue-100 text-blue-700 border-none">
                              {d.icd10}
                            </Badge>
                            {d.confidence === 'low' && (
                              <span className="text-[10px] text-[#FF9500]">⚠ Low confidence</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {referrals.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93] mb-1.5">Referrals & Tests</h4>
                    <ul className="space-y-1">
                      {referrals.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#1D1D1F]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#5856D6] mt-1.5 flex-shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {lifestyleSuggestions.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93] mb-1.5">Lifestyle Advice</h4>
                    <ul className="space-y-1">
                      {lifestyleSuggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#1D1D1F]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#34C759] mt-1.5 flex-shrink-0" />
                          {s.suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Patient View Tab ── */}
        {activeTab === 'patient' && (
          <div className="p-4">
            <div className="bg-gradient-to-br from-[#EBF1FF] to-[#F0F9FF] rounded-2xl p-4 border border-[#0050cb]/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-full bg-[#0050cb] flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0050cb]">Patient-Friendly Summary</p>
                  <p className="text-[10px] text-[#8E8E93]">Simple language — shared with patient</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-[#1D1D1F]">{patientSummary}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
