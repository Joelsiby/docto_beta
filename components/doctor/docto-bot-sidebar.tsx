'use client'

import { useState, useRef, useEffect } from 'react'
import { useBotStore } from '@/stores/bot-store'

const tones = [
  { key: 'teacher', label: 'Teacher', emoji: '🧑‍🏫' },
  { key: 'professional', label: 'Pro', emoji: '💼' },
  { key: 'concise', label: 'Concise', emoji: '⚡️' },
] as const

const quickPrompts = [
  'Summarize key findings',
  'Explain in simple terms',
  'What are the side effects?',
  'Check drug interactions',
]

export function DoctoBotSidebar() {
  const [input, setInput] = useState('')
  const { messages, isLoading, tone, sendMessage, setTone } = useBotStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content) return
    setInput('')
    inputRef.current?.focus()
    await sendMessage(content)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #0050cb 0%, #5856D6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,80,203,0.25)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
            <circle cx="9" cy="13" r="1" fill="#fff"/>
            <circle cx="15" cy="13" r="1" fill="#fff"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1D1D1F', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', lineHeight: 1.2 }}>
            Docto Bot
          </div>
          <div style={{ fontSize: 11, color: '#86868B', fontFamily: '-apple-system, sans-serif', marginTop: 1 }}>
            AI Clinical Assistant
          </div>
        </div>
        {/* Status dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34C759' }} />
          <span style={{ fontSize: 10, color: '#86868B', fontFamily: '-apple-system, sans-serif' }}>Online</span>
        </div>
      </div>

      {/* Tone Selector */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
          background: '#FAFAFA',
        }}
      >
        <span style={{ fontSize: 10, color: '#86868B', fontFamily: '-apple-system, sans-serif', fontWeight: 500, marginRight: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Tone
        </span>
        <div style={{ display: 'flex', background: 'rgba(142,142,147,0.12)', borderRadius: 8, padding: 2, gap: 2 }}>
          {tones.map((t) => (
            <button
              key={t.key}
              onClick={() => setTone(t.key)}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: 'none',
                background: tone === t.key ? '#fff' : 'transparent',
                color: tone === t.key ? '#0050cb' : '#86868B',
                fontSize: 11,
                fontWeight: tone === t.key ? 600 : 400,
                cursor: 'pointer',
                fontFamily: '-apple-system, sans-serif',
                boxShadow: tone === t.key ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                transition: 'all 150ms ease',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 12,
              textAlign: 'center',
              padding: '0 16px',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(0,80,203,0.12) 0%, rgba(88,86,214,0.12) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0050cb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1D1D1F', fontFamily: '-apple-system, sans-serif', marginBottom: 4 }}>
                Ask Docto Bot
              </div>
              <div style={{ fontSize: 12, color: '#86868B', fontFamily: '-apple-system, sans-serif', lineHeight: 1.5 }}>
                Ask anything about this research, patient history, or clinical guidelines.
              </div>
            </div>

            {/* Quick prompts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', marginTop: 8 }}>
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid rgba(0,80,203,0.15)',
                    background: 'rgba(0,80,203,0.04)',
                    color: '#0050cb',
                    fontSize: 12,
                    fontWeight: 400,
                    cursor: 'pointer',
                    fontFamily: '-apple-system, sans-serif',
                    textAlign: 'left',
                    transition: 'all 150ms ease',
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: 8,
                }}
              >
                {msg.role === 'assistant' && (
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #0050cb 0%, #5856D6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                    </svg>
                  </div>
                )}
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '9px 13px',
                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: msg.role === 'user' ? '#0050cb' : '#F5F5F7',
                    color: msg.role === 'user' ? '#fff' : '#1D1D1F',
                    fontSize: 13,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    lineHeight: 1.55,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    boxShadow: msg.role === 'user' ? '0 1px 4px rgba(0,80,203,0.2)' : '0 1px 3px rgba(0,0,0,0.06)',
                    border: msg.role === 'assistant' ? '1px solid rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #0050cb 0%, #5856D6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>
                </div>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '14px 14px 14px 4px',
                    background: '#F5F5F7',
                    border: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    gap: 4,
                    alignItems: 'center',
                  }}
                >
                  {[0, 150, 300].map((delay) => (
                    <div
                      key={delay}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#86868B',
                        animation: 'bounce 1.2s infinite',
                        animationDelay: `${delay}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          flexShrink: 0,
          background: '#fff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#F5F5F7',
            borderRadius: 12,
            padding: '4px 4px 4px 12px',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this research..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 13,
              color: '#1D1D1F',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              padding: '8px 0',
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              border: 'none',
              background: input.trim() ? '#0050cb' : 'rgba(142,142,147,0.2)',
              color: input.trim() ? '#fff' : '#86868B',
              cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 150ms ease',
              flexShrink: 0,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 7 }}>
          <span style={{ fontSize: 10, color: '#C7C7CC', fontFamily: '-apple-system, sans-serif' }}>
            Responses based on medical literature & session notes only
          </span>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}
