'use client'

import { useBotStore } from '@/stores/bot-store'
import clsx from 'clsx'

export function ToneSelector() {
  const { tone, setTone } = useBotStore()

  return (
    <div className="flex bg-surface-container-lowest border border-border-subtle rounded-lg p-1 shadow-sm w-max mb-4">
      {(['teacher', 'professional', 'concise'] as const).map((t) => (
        <button
          key={t}
          onClick={() => setTone(t)}
          className={clsx(
            "px-3 py-1 text-[11px] font-label-md rounded-md transition-colors uppercase tracking-wider capitalize",
            tone === t 
              ? "bg-primary text-on-primary shadow-sm" 
              : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
