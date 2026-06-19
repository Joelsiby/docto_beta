'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, ShieldAlert, Minus } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Namaste! I'm Docto Bot, your AI health assistant. Ask me about your medicines, lab reports, upcoming appointments, or any health questions. I'm here to help! 🩺",
}

const QUICK_PROMPTS = [
  'What does my last report mean?',
  'When should I take my medicines?',
  'Is it safe to miss a dose?',
]

function DoctoBotIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
      <circle cx="9" cy="13" r="1" fill="currentColor" />
      <circle cx="15" cy="13" r="1" fill="currentColor" />
    </svg>
  )
}

export function DoctoBotSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Persist open state across pages
  useEffect(() => {
    const saved = localStorage.getItem('doctobot-open')
    if (saved === 'true') setIsOpen(true)
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
    localStorage.setItem('doctobot-open', isOpen ? 'true' : 'false')
  }, [isOpen, isMinimized])

  const handleSend = async (messageText?: string) => {
    const text = (messageText || input).trim()
    if (!text || isLoading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text }
    // Optimistically add user message
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: updatedMessages
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({ role: m.role, content: m.content })),
          tone: 'supportive',
        }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.message || "Namaste! I'm here to help.",
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* ── Mobile/Desktop Overlay Backdrop ──────────────────────────────────── */}
      {isOpen && !isMinimized && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Floating Toggle Button (when closed) ─────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          id="doctobot-toggle"
          className="fixed bottom-24 right-4 md:bottom-8 md:right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0050cb] to-[#3d8bfd] text-white shadow-xl shadow-blue-500/30 flex items-center justify-center hover:scale-110 transition-all duration-200 group"
          title="Open Docto Bot"
        >
          <DoctoBotIcon size={24} className="group-hover:scale-110 transition-transform" />
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-2xl animate-ping bg-[#0050cb]/30 pointer-events-none" />
        </button>
      )}

      {/* ── Chat Panel ───────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-out
            ${isMinimized
              ? 'bottom-24 right-4 md:bottom-8 md:right-6 w-auto h-auto'
              : 'bottom-0 right-0 w-full md:bottom-8 md:right-6 md:w-[380px] h-[80vh] md:h-[600px] max-h-[600px]'
            }`}
        >
          {isMinimized ? (
            /* ── Minimized Pill ── */
            <button
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-2.5 bg-[#0050cb] text-white px-4 py-3 rounded-2xl shadow-xl shadow-blue-500/30 hover:bg-[#003d9e] transition-colors"
            >
              <DoctoBotIcon size={20} />
              <span className="text-sm font-semibold">Docto Bot</span>
              {messages.length > 1 && (
                <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {messages.filter((m) => m.role === 'assistant').length - 1}
                </span>
              )}
            </button>
          ) : (
            /* ── Full Chat Panel ── */
            <div className="flex flex-col h-full bg-white rounded-t-3xl md:rounded-3xl shadow-2xl shadow-blue-500/10 border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-[#0050cb] to-[#3d8bfd] text-white flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <DoctoBotIcon size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold truncate">Docto Bot</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse flex-shrink-0" />
                    <span className="text-[10px] text-blue-100 font-medium">Online • Patient Mode</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                    title="Minimize"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                    title="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Safety banner */}
              <div className="flex items-start gap-2 bg-amber-50 border-b border-amber-100 px-4 py-2 flex-shrink-0">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700 leading-tight">
                  For information only. Always verify with your doctor. Emergency? Call 112.
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0050cb] to-[#3d8bfd] flex items-center justify-center flex-shrink-0 mb-1 shadow-md">
                        <DoctoBotIcon size={14} className="text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#0050cb] text-white rounded-br-sm shadow-sm'
                          : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-sm'
                      }`}
                    >
                      {msg.content || (
                        <div className="flex items-center gap-1 h-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick prompts (only show when few messages) */}
              {messages.length <= 2 && (
                <div className="px-3 pb-2 flex gap-2 overflow-x-auto flex-shrink-0 scrollbar-hide">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => handleSend(p)}
                      className="whitespace-nowrap text-[10px] font-medium px-3 py-1.5 rounded-full bg-blue-50 text-[#0050cb] border border-blue-100 hover:bg-blue-100 transition-colors flex-shrink-0"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="flex items-center gap-2 px-3 py-3 bg-white border-t border-gray-100 flex-shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about your health..."
                  disabled={isLoading}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0050cb] focus:ring-1 focus:ring-[#0050cb]/30 transition-all bg-gray-50/50 placeholder:text-gray-400 disabled:opacity-60"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-[#0050cb] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#003d9e] transition-colors flex items-center justify-center shadow-sm flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
