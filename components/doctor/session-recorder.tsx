"use client"

import * as React from "react"
import { Mic, Square, Loader2, FileAudio, Pause, Play, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSessionStore } from "@/stores/session-store"

interface SessionRecorderProps {
  onStop?: (transcriptText: string) => void
}

export function SessionRecorder({ onStop }: SessionRecorderProps) {
  const {
    isRecording,
    sessionStatus,
    recordingDuration,
    setIsRecording,
    setSessionStatus,
    incrementDuration,
    addTranscript,
    voiceCommandMode,
    setVoiceCommandMode,
    isProcessingVoiceCommand,
    clearSession,
  } = useSessionStore()

  const [isPaused, setIsPaused] = React.useState(false)
  const [bars, setBars] = React.useState<number[]>(Array(20).fill(4))
  const recognitionRef = React.useRef<any>(null)
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)
  const animFrameRef = React.useRef<NodeJS.Timeout | null>(null)

  // ── Timer ──────────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => incrementDuration(), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRecording, isPaused, incrementDuration])

  // ── Waveform Animation ─────────────────────────────────────────────────────
  React.useEffect(() => {
    if (isRecording && !isPaused) {
      const animate = () => {
        setBars(Array.from({ length: 20 }, () => Math.floor(Math.random() * 32) + 4))
        animFrameRef.current = setTimeout(animate, 120)
      }
      animate()
    } else {
      if (animFrameRef.current) clearTimeout(animFrameRef.current)
      setBars(Array(20).fill(4))
    }
    return () => { if (animFrameRef.current) clearTimeout(animFrameRef.current) }
  }, [isRecording, isPaused])

  // ── Speech Recognition ─────────────────────────────────────────────────────
  const initSpeechRecognition = React.useCallback(() => {
    if (typeof window === "undefined") return null
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return null

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-IN' // Works for both English and Hindi

    recognition.onresult = (event: any) => {
      const current = event.resultIndex
      const text = event.results[current][0].transcript.trim()
      if (!text) return

      const m = Math.floor(recordingDuration / 60).toString().padStart(2, "0")
      const s = (recordingDuration % 60).toString().padStart(2, "0")

      // Heuristic speaker detection based on medical keywords
      const doctorKeywords = ['prescribe', 'mg', 'tablet', 'diagnosis', 'I will', 'take', 'avoid', 'come back', 'referred', 'listen', 'breath']
      const isDoctor = doctorKeywords.some(kw => text.toLowerCase().includes(kw.toLowerCase()))

      addTranscript({
        speaker: isDoctor ? "Doctor" : "Patient",
        time: `${m}:${s}`,
        text,
      })

      // Send to transcription API for server-side labeling (batch mode)
      sendToTranscriptionApi(text, isDoctor ? 'doctor' : 'patient')
    }

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        console.error("Speech recognition error:", event.error)
      }
    }

    return recognition
  }, [recordingDuration, addTranscript])

  async function sendToTranscriptionApi(text: string, speakerHint: string) {
    try {
      await fetch('/api/session/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, speakerHint }),
      })
    } catch {
      // Silently fail — transcript is already stored locally
    }
  }

  const startRecording = () => {
    const recognition = initSpeechRecognition()
    recognitionRef.current = recognition
    try { recognition?.start() } catch { /* already started */ }
    setIsRecording(true)
    setSessionStatus('recording')
    setIsPaused(false)
  }

  const pauseRecording = () => {
    setIsPaused(true)
    try { recognitionRef.current?.stop() } catch { /* ignore */ }
  }

  const resumeRecording = () => {
    setIsPaused(false)
    try { recognitionRef.current?.start() } catch { /* ignore */ }
  }

  const stopRecording = () => {
    try { recognitionRef.current?.stop() } catch { /* ignore */ }
    setIsRecording(false)
    setSessionStatus('processing')
    setIsPaused(false)
    onStop?.('')
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`
  }

  const isIdle = sessionStatus === 'idle'
  const isActiveRecording = isRecording && !isPaused

  return (
    <Card className="rounded-[14px] border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] bg-white overflow-hidden">
      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight text-[#1D1D1F]">
            <div className="p-1 rounded-md bg-blue-50 text-[#0050cb]">
              <FileAudio className="h-3.5 w-3.5" />
            </div>
            Session Audio
          </CardTitle>
          <div className="flex items-center gap-2">
            {isRecording && (
              <span className="flex h-2 w-2 rounded-full bg-[#FF3B30] animate-pulse" />
            )}
            <span className="font-mono text-sm font-bold tracking-widest text-[#1D1D1F]">
              {formatTime(recordingDuration)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 space-y-4">
        {/* Waveform Visualizer */}
        <div className="flex items-end justify-center gap-[3px] h-10 bg-[#F5F5F7] rounded-xl px-3">
          {bars.map((h, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full transition-all duration-100"
              style={{
                height: `${h}px`,
                backgroundColor: isActiveRecording
                  ? `hsl(${220 + i * 2}, 80%, ${50 + i}%)`
                  : '#D1D1D6',
              }}
            />
          ))}
        </div>

        {/* Main Control */}
        <div className="flex flex-col items-center gap-3">
          {isIdle ? (
            <Button
              id="start-session-btn"
              onClick={startRecording}
              className="w-full h-11 bg-[#0050cb] hover:bg-[#0040a8] text-white font-semibold gap-2 rounded-xl"
            >
              <Mic className="h-4 w-4" />
              Start Session Recording
            </Button>
          ) : (
            <div className="flex gap-2 w-full">
              {/* Pause / Resume */}
              <Button
                variant="outline"
                className="flex-1 h-10 gap-2 rounded-xl border-[#D1D1D6] text-[#3C3C43]"
                onClick={isPaused ? resumeRecording : pauseRecording}
              >
                {isPaused ? (
                  <><Play className="h-4 w-4" /> Resume</>
                ) : (
                  <><Pause className="h-4 w-4" /> Pause</>
                )}
              </Button>
              {/* Stop */}
              <Button
                id="stop-session-btn"
                className="flex-1 h-10 bg-[#FF3B30] hover:bg-[#D70015] text-white font-semibold gap-2 rounded-xl"
                onClick={stopRecording}
              >
                <Square className="h-4 w-4 fill-white" />
                Stop & Analyze
              </Button>
            </div>
          )}
        </div>

        {/* Voice Command Toggle (visible after recording) */}
        {sessionStatus === 'review' && (
          <Button
            id="voice-command-toggle"
            variant={voiceCommandMode ? "default" : "outline"}
            className={`w-full h-9 text-sm gap-2 rounded-xl transition-all ${
              voiceCommandMode
                ? "bg-violet-600 hover:bg-violet-700 text-white"
                : "border-violet-200 text-violet-700 hover:bg-violet-50"
            }`}
            onClick={() => setVoiceCommandMode(!voiceCommandMode)}
            disabled={isProcessingVoiceCommand}
          >
            {isProcessingVoiceCommand ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing voice...</>
            ) : (
              <><Languages className="h-3.5 w-3.5" />
              {voiceCommandMode ? "🎤 Listening... Speak your update" : "🎤 Speak to Update Prescription"}</>
            )}
          </Button>
        )}

        {/* Status Text */}
        <p className="text-center text-[11px] font-medium text-[#8E8E93]">
          {isIdle && "Click to start recording the clinical session"}
          {isActiveRecording && "Recording... Docto is listening and transcribing."}
          {isPaused && "Recording paused. Click Resume to continue."}
          {sessionStatus === 'processing' && "Analyzing session... Please wait."}
          {sessionStatus === 'review' && "Session complete. Review & confirm below."}
          {sessionStatus === 'confirmed' && "✓ Session confirmed and submitted."}
        </p>
      </CardContent>
    </Card>
  )
}
