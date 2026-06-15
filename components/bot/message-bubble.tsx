'use client'

import clsx from 'clsx'

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user'

  return (
    <div className={clsx("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div 
        className={clsx(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
          isUser 
            ? "bg-primary text-on-primary rounded-tr-sm" 
            : "bg-surface-container-high text-on-surface rounded-tl-sm border border-border-subtle"
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
      </div>
    </div>
  )
}
