'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send, Sparkles, MessageSquare, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function PatientChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am Docto Bot, your personal AI health assistant. I can answer questions about your lab reports, explain your prescriptions, and help you prepare for upcoming appointments based on your doctor\'s notes. How can I help you today?'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          context: 'patient-mode', // Specialized context for patient safeguards
          tone: 'supportive'
        })
      })

      if (!response.body) throw new Error("No response body")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      
      const assistantMsgId = (Date.now() + 1).toString()
      setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                assistantContent += parsed.text
                setMessages(prev => prev.map(m => 
                  m.id === assistantMsgId ? { ...m, content: assistantContent } : m
                ))
              }
            } catch (e) {
              console.error("Error parsing stream data", e)
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again."
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] animate-fade-in -mx-4 md:mx-0">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-4 border-b border-gray-100 md:rounded-t-2xl shadow-sm z-10">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0050cb] to-[#3d8bfd] flex items-center justify-center shadow-lg shadow-blue-500/20">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-headline)' }}>
            Docto Bot
          </h1>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-600">Online • Patient Mode</span>
          </div>
        </div>
      </div>

      {/* Safety Banner */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2.5 flex items-start gap-3">
        <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] sm:text-xs text-amber-800 font-medium leading-relaxed">
          Docto Bot provides information based on your clinical records. It is an AI and can make mistakes. Always verify critical information with your doctor. In case of emergency, contact local emergency services.
        </p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 max-w-[85%] md:max-w-[75%] ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            {msg.role === 'assistant' ? (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0050cb] to-[#3d8bfd] flex flex-shrink-0 items-center justify-center shadow-md">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gray-200 flex flex-shrink-0 items-center justify-center">
                <span className="text-xs font-bold text-gray-600">ME</span>
              </div>
            )}

            {/* Bubble */}
            <div
              className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#0050cb] text-white rounded-tr-sm shadow-md shadow-blue-500/10'
                  : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100 shadow-sm'
              }`}
            >
              {msg.content || (
                <div className="flex items-center gap-1 h-5">
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

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 md:rounded-b-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your reports, meds, or schedule..."
            className="flex-1 px-4 py-3.5 pr-14 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0050cb] focus:ring-1 focus:ring-[#0050cb] transition-all bg-gray-50/50 focus:bg-white placeholder:text-gray-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 rounded-lg bg-[#0050cb] text-white disabled:opacity-50 disabled:bg-gray-300 transition-colors shadow-sm"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
