'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePlannerStore, PlannerTask } from '@/stores/planner-store'
import { Mic, MicOff } from 'lucide-react'
import { useWebSpeech } from '@/lib/hooks/use-web-speech'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface BotAction {
  type: string
  payload: any
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatLocalDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getTodayStr() {
  return formatLocalDate(new Date())
}

function getTomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return formatLocalDate(d)
}

function genId() {
  return Math.random().toString(36).slice(2)
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user'
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 8,
      }}
    >
      {!isUser && (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0050cb, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginRight: 8,
            marginTop: 2,
            fontSize: 13,
          }}
        >
          🤖
        </div>
      )}
      <div
        style={{
          maxWidth: '82%',
          padding: '10px 13px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          background: isUser
            ? 'linear-gradient(135deg, #0050cb, #1d6bf3)'
            : 'rgba(255,255,255,0.95)',
          color: isUser ? '#fff' : '#1D1D1F',
          fontSize: 13,
          lineHeight: 1.55,
          boxShadow: isUser
            ? '0 2px 8px rgba(0,80,203,0.25)'
            : '0 1px 4px rgba(0,0,0,0.08)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          border: isUser ? 'none' : '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {content}
      </div>
    </div>
  )
}

// ─── Quick Chips ──────────────────────────────────────────────────────────────

const QUICK_CHIPS = [
  { label: '📋 Today\'s tasks', value: "What are my tasks for today?" },
  { label: '➕ Add a task', value: "I want to add a new task" },
  { label: '😮‍💨 Give me a break', value: "Give me a break today" },
  { label: '📅 Week summary', value: "Show me my schedule this week" },
  { label: '🔄 Duplicate today', value: "Duplicate today's tasks for tomorrow" },
]

function LoadingText({ active, isDoctor = false }: { active: boolean; isDoctor?: boolean }) {
  const [index, setIndex] = useState(0)
  const messages = [
    "Thinking...",
    "Reviewing health profile...",
    "Consulting clinical guidelines...",
    "Analyzing reports...",
    "Formulating response..."
  ]

  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [active])

  if (!active) return null

  return (
    <span 
      style={isDoctor ? {
        fontSize: '11px',
        color: '#86868B',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        opacity: 0.8,
      } : undefined}
      className={!isDoctor ? "text-[11px] text-gray-400 font-medium animate-pulse ml-1" : undefined}
    >
      {messages[index]}
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface PlannerBotSidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function PlannerBotSidebar({ isCollapsed, onToggleCollapse }: PlannerBotSidebarProps) {
  const { tasks, addTask, toggleTask, deleteTask, rescheduleTasksByDate, deleteTasksByDate, fetchTasks } = usePlannerStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pendingConfirm, setPendingConfirm] = useState<BotAction | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    isTalkMode,
    isListening,
    isSpeaking,
    supported,
    startTalkMode,
    stopTalkMode,
    speak,
  } = useWebSpeech({
    onTranscript: (text) => sendMessage(text),
    isLoading,
  })

  const lastSpokenIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (messages.length === 0) return
    const lastMsg = messages[messages.length - 1]
    if (lastMsg.role === 'assistant' && isTalkMode && lastMsg.id !== lastSpokenIdRef.current) {
      lastSpokenIdRef.current = lastMsg.id
      speak(lastMsg.content)
    }
  }, [messages, isTalkMode, speak])

  // Stop talk mode if collapsed
  useEffect(() => {
    if (isCollapsed) {
      stopTalkMode()
    }
  }, [isCollapsed, stopTalkMode])

  // Initialize from storage or show greeting
  useEffect(() => {
    setIsMounted(true)
    const saved = localStorage.getItem('docto_bot_messages')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.length > 0) {
          setMessages(parsed)
          return
        }
      } catch {
        // ignore
      }
    }

    const today = getTodayStr()
    const todayTasks = tasks.filter((t) => t.due_date?.startsWith(today) && !t.is_completed)
    const busiest = getBusiestDay()

    const greeting = todayTasks.length > 0
      ? `Good day, Doctor! 👋\n\nYou have **${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''}** scheduled for today.${busiest ? `\n\nYour busiest upcoming day is **${busiest}** — might want to plan ahead! 📅` : ''}\n\nHow can I help you today? 💪`
      : `Good day, Doctor! 👋\n\nYour calendar looks clear today — a perfect day to plan ahead or tackle something new! 🌟\n\nWhat can I help you with?`

    const initialMsg: Message = {
      id: genId(),
      role: 'assistant',
      content: greeting,
    }
    setMessages([initialMsg])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('docto_bot_messages', JSON.stringify(messages))
    }
  }, [messages])

  const handleClearHistory = () => {
    localStorage.removeItem('docto_bot_messages')
    
    const today = getTodayStr()
    const todayTasks = tasks.filter((t) => t.due_date?.startsWith(today) && !t.is_completed)
    const busiest = getBusiestDay()

    const greeting = todayTasks.length > 0
      ? `Good day, Doctor! 👋\n\nYou have **${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''}** scheduled for today.${busiest ? `\n\nYour busiest upcoming day is **${busiest}** — might want to plan ahead! 📅` : ''}\n\nHow can I help you today? 💪`
      : `Good day, Doctor! 👋\n\nYour calendar looks clear today — a perfect day to plan ahead or tackle something new! 🌟\n\nWhat can I help you with?`

    setMessages([
      {
        id: genId(),
        role: 'assistant',
        content: greeting,
      },
    ])
  }

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  function getBusiestDay(): string | null {
    const counts: Record<string, number> = {}
    tasks.forEach((t) => {
      if (t.due_date && !t.is_completed) {
        const d = t.due_date.slice(0, 10)
        counts[d] = (counts[d] || 0) + 1
      }
    })
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    if (!sorted.length) return null
    // Format the date nicely
    try {
      const d = new Date(sorted[0][0] + 'T00:00:00')
      return d.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })
    } catch {
      return sorted[0][0]
    }
  }

  // ─── Action Dispatcher ──────────────────────────────────────────────────────

  const dispatchAction = useCallback(async (action: BotAction): Promise<string | null> => {
    const { type, payload } = action
    const today = getTodayStr()
    const tomorrow = getTomorrowStr()

    switch (type) {
      case 'ADD_TASK': {
        const newTask = await addTask({
          title: payload.title,
          due_date: payload.due_date || today,
          category: payload.category || 'general',
          priority: payload.priority || 'medium',
          description: payload.description || '',
        })
        return newTask ? null : '⚠️ Failed to save the task to the database. Please try again.'
      }

      case 'RESCHEDULE_DAY': {
        const count = await rescheduleTasksByDate(payload.from_date, payload.to_date)
        if (count === 0) {
          return `ℹ️ No tasks found on ${payload.from_date} to reschedule.`
        }
        return null
      }

      case 'RESCHEDULE_TASK': {
        // Find the task and update it via addTask (optimistic in store)
        // We use the store's underlying supabase call
        const taskToMove = tasks.find((t) => t.id === payload.id)
        if (!taskToMove) return '⚠️ Could not find that task. It may have been deleted.'
        // Re-add with new date and delete old — simplest approach
        await deleteTask(payload.id)
        await addTask({
          title: taskToMove.title,
          due_date: payload.new_due_date,
          category: taskToMove.category,
          priority: taskToMove.priority,
          description: taskToMove.description || '',
        })
        return null
      }

      case 'COMPLETE_TASK': {
        const task = tasks.find((t) => t.id === payload.id)
        if (!task) return '⚠️ Could not find that task.'
        await toggleTask(payload.id, task.is_completed)
        return null
      }

      case 'DELETE_TASK': {
        await deleteTask(payload.id)
        return null
      }

      case 'DELETE_DAY': {
        const count = await deleteTasksByDate(payload.date)
        if (count === 0) return `ℹ️ No tasks found on ${payload.date} to delete.`
        return null
      }

      case 'DUPLICATE_DAY': {
        const srcTasks = tasks.filter(
          (t) => t.due_date?.startsWith(payload.from_date) && !t.is_completed
        )
        if (srcTasks.length === 0) {
          return `ℹ️ No tasks found on ${payload.from_date} to duplicate.`
        }
        for (const t of srcTasks) {
          await addTask({
            title: t.title,
            due_date: payload.to_date,
            category: t.category,
            priority: t.priority,
            description: t.description || '',
          })
        }
        return null
      }

      case 'LIST_TASKS':
      case 'NONE':
      default:
        return null
    }
  }, [tasks, addTask, toggleTask, deleteTask, rescheduleTasksByDate, deleteTasksByDate])

  // ─── Send Message ────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMsg: Message = { id: genId(), role: 'user', content: content.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const context = {
        today: getTodayStr(),
        tomorrow: getTomorrowStr(),
        tasks: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          due_date: t.due_date,
          category: t.category,
          priority: t.priority,
          is_completed: t.is_completed,
        })),
      }

      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content.trim(), history, context }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const botMessage = data.message || 'Sorry, I had trouble responding. Please try again.'
      const action: BotAction | null = data.action

      // Check if this is a destructive/bulk action needing confirmation
      const needsConfirm = action && ['RESCHEDULE_DAY', 'DELETE_DAY', 'DELETE_TASK', 'DUPLICATE_DAY'].includes(action.type)

      if (needsConfirm) {
        setPendingConfirm(action)
      }

      setMessages((prev) => [
        ...prev,
        { id: genId(), role: 'assistant', content: botMessage },
      ])

      // For non-destructive actions, dispatch immediately
      if (action && !needsConfirm) {
        const errorMsg = await dispatchAction(action)
        if (errorMsg) {
          setMessages((prev) => [
            ...prev,
            { id: genId(), role: 'assistant', content: errorMsg },
          ])
        }
      }
    } catch (err: any) {
      const errMsg = '⚠️ Oops! Something went wrong connecting to the AI. Please check your internet or API key.'
      setMessages((prev) => [
        ...prev,
        {
          id: genId(),
          role: 'assistant',
          content: errMsg,
        },
      ])
      if (isTalkMode) {
        speak(errMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, tasks, messages, dispatchAction, isTalkMode, speak])

  // Handle yes/no for pending confirmation
  const handleConfirmation = useCallback(async (confirmed: boolean) => {
    if (!pendingConfirm) return
    const action = pendingConfirm
    setPendingConfirm(null)

    if (confirmed) {
      const errorMsg = await dispatchAction(action)
      if (errorMsg) {
        setMessages((prev) => [...prev, { id: genId(), role: 'assistant', content: errorMsg }])
      } else {
        setMessages((prev) => [
          ...prev,
          { id: genId(), role: 'assistant', content: '✅ Done! Your calendar has been updated. 💪' },
        ])
      }
    } else {
      setMessages((prev) => [
        ...prev,
        { id: genId(), role: 'assistant', content: 'No problem! I\'ve cancelled that action. Anything else I can help with? 😊' },
      ])
    }
  }, [pendingConfirm, dispatchAction])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Mobile Backdrop */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={onToggleCollapse}
        />
      )}

      {/* Collapse toggle button */}
      <button
        onClick={onToggleCollapse}
        title={isCollapsed ? 'Open Docto Bot' : 'Collapse Docto Bot'}
        className={`fixed bottom-20 lg:bottom-6 z-50 w-10 h-10 rounded-full bg-gradient-to-br from-[#0050cb] to-[#1d6bf3] border-none cursor-pointer flex items-center justify-center shadow-lg transition-all duration-300 text-lg ${
          isCollapsed ? "right-3" : "hidden lg:flex right-[332px]"
        }`}
      >
        {isCollapsed ? '🤖' : '→'}
      </button>

      {/* Sidebar panel */}
      <div
        className="absolute lg:relative right-0 top-0 z-40 lg:z-10 shadow-2xl lg:shadow-none"
        style={{
          width: isCollapsed ? 0 : 320,
          minWidth: isCollapsed ? 0 : 320,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(248,250,255,0.96)',
          backdropFilter: 'blur(16px)',
          borderLeft: isCollapsed ? 'none' : '1px solid rgba(0,80,203,0.1)',
          overflow: 'hidden',
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)',
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 16px 12px',
            borderBottom: '1px solid rgba(0,80,203,0.08)',
            background: 'linear-gradient(135deg, rgba(0,80,203,0.06), rgba(29,107,243,0.04))',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0050cb, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              🤖
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0050cb', fontFamily: '-apple-system, sans-serif' }}>
                Docto Bot
              </div>
              <div style={{ fontSize: 11, color: isListening ? '#FF3B30' : '#86868B', fontFamily: '-apple-system, sans-serif', transition: 'color 0.2s' }}>
                {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Your clinical planner assistant'}
              </div>
            </div>
            <button
              onClick={handleClearHistory}
              title="Clear chat history"
              style={{
                marginLeft: 'auto',
                marginRight: 8,
                background: 'rgba(255,59,48,0.1)',
                border: 'none',
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#FF3B30',
                transition: 'background 0.2s'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
            {/* Close button for mobile */}
            <button
              onClick={onToggleCollapse}
              className="lg:hidden p-1 rounded-lg hover:bg-black/5 transition-colors"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#0050cb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Quick chips */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
              marginTop: 12,
            }}
          >
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip.value}
                onClick={() => sendMessage(chip.value)}
                disabled={isLoading}
                style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  border: '1px solid rgba(0,80,203,0.2)',
                  background: 'rgba(0,80,203,0.06)',
                  color: '#0050cb',
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontFamily: '-apple-system, sans-serif',
                  opacity: isLoading ? 0.5 : 1,
                  transition: 'background 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 12px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0050cb, #3b82f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                🤖
              </div>
              <div
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '10px 14px',
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                }}
              >
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0, 150, 300].map((delay) => (
                    <div
                      key={delay}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: '#0050cb',
                        opacity: 0.7,
                        animation: 'bounce 1.2s infinite',
                        animationDelay: `${delay}ms`,
                      }}
                    />
                  ))}
                </div>
                <LoadingText active={isLoading} isDoctor />
              </div>
            </div>
          )}

          {/* Confirmation buttons */}
          {pendingConfirm && !isLoading && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start', marginTop: 4, marginBottom: 8, paddingLeft: 36 }}>
              <button
                onClick={() => handleConfirmation(true)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 20,
                  border: 'none',
                  background: '#0050cb',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: '-apple-system, sans-serif',
                }}
              >
                ✅ Yes, do it!
              </button>
              <button
                onClick={() => handleConfirmation(false)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 20,
                  border: '1px solid rgba(0,0,0,0.15)',
                  background: '#fff',
                  color: '#86868B',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: '-apple-system, sans-serif',
                }}
              >
                ✕ Cancel
              </button>
            </div>
          )}

          {isTalkMode && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 12px',
                background: 'rgba(0, 80, 203, 0.04)',
                borderRadius: 12,
                border: '1px dashed rgba(0, 80, 203, 0.2)',
                gap: 8,
                fontSize: 12,
                fontWeight: 600,
                color: '#0050cb',
                marginBottom: 8,
              }}
            >
              {isListening && (
                <>
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#FF3B30', animation: 'bounce 1.2s infinite' }} />
                  Listening... Speak now
                </>
              )}
              {isSpeaking && (
                <>
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#0050cb', animation: 'bounce 1.2s infinite' }} />
                  Speaking...
                </>
              )}
              {!isListening && !isSpeaking && !isLoading && (
                <span>Waiting...</span>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: '12px 12px 16px',
            borderTop: '1px solid rgba(0,80,203,0.08)',
            background: 'rgba(255,255,255,0.8)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-end',
              background: '#fff',
              borderRadius: 20,
              border: '1.5px solid rgba(0,80,203,0.2)',
              padding: '8px 8px 8px 14px',
              boxShadow: '0 1px 6px rgba(0,80,203,0.08)',
              transition: 'border-color 0.2s',
            }}
          >
            {supported && (
              <button
                onClick={isTalkMode ? stopTalkMode : startTalkMode}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isTalkMode ? '#FF3B30' : '#0050cb',
                  padding: '4px',
                  borderRadius: '50%',
                  backgroundColor: isTalkMode ? 'rgba(255, 59, 48, 0.1)' : 'transparent',
                  transition: 'all 150ms ease',
                  alignSelf: 'center',
                }}
                title={isTalkMode ? 'Stop Talk Mode' : 'Start Talk Mode'}
              >
                {isTalkMode ? (
                  <MicOff className="h-4 w-4" style={{ animation: 'pulse 1.5s infinite' }} />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            )}
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || isListening}
              placeholder={isListening ? 'Listening...' : 'Ask me anything... 💬'}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 13,
                color: '#1D1D1F',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                resize: 'none',
                opacity: (isLoading || isListening) ? 0.6 : 1,
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isLoading || isListening || !input.trim()}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: 'none',
                background: isLoading || isListening || !input.trim()
                  ? 'rgba(0,80,203,0.15)'
                  : 'linear-gradient(135deg, #0050cb, #1d6bf3)',
                color: isLoading || isListening || !input.trim() ? '#86868B' : '#fff',
                cursor: isLoading || isListening || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s',
                fontSize: 14,
              }}
            >
              ↑
            </button>
          </div>
          <p
            style={{
              textAlign: 'center',
              fontSize: 10,
              color: '#AEAEB2',
              marginTop: 6,
              fontFamily: '-apple-system, sans-serif',
            }}
          >
            Powered by AI · Always verify critical decisions
          </p>
        </div>

        {/* Bounce keyframes */}
        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-6px); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    </>
  )
}
