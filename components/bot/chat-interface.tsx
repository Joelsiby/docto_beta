'use client'

import { useBotStore } from '@/stores/bot-store'
import { MessageBubble } from './message-bubble'

export function ChatInterface() {
  const { messages, isLoading } = useBotStore()

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container-lowest/30 flex flex-col">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center px-4 opacity-70 m-auto">
          <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">forum</span>
          <p className="text-sm text-on-surface-variant">Ask me anything about clinical guidelines, patient history, or research.</p>
        </div>
      ) : (
        messages.map((msg) => (
          <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
        ))
      )}
      
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-surface-container-high text-on-surface-variant rounded-2xl rounded-tl-sm px-4 py-2 flex items-center gap-2 max-w-[85%]">
             <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }}></div>
             <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </div>
  )
}
