import { create } from 'zustand'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface BotState {
  messages: Message[]
  isLoading: boolean
  tone: 'teacher' | 'professional' | 'concise'
  sendMessage: (content: string) => Promise<void>
  setTone: (tone: BotState['tone']) => void
  clearMessages: () => void
}

export const useBotStore = create<BotState>((set, get) => ({
  messages: [],
  isLoading: false,
  tone: 'professional',

  sendMessage: async (content) => {
    const trimmedContent = content.trim()
    if (!trimmedContent) return

    // 1. Add user message to state
    const userMessage: Message = {
      id: Math.random().toString(36).slice(2),
      role: 'user',
      content: trimmedContent,
    }

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
    }))

    try {
      const history = get().messages.slice(0, -1) // Exclude the newly added message from history input if needed, or send all except current
      const response = await fetch('/api/bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedContent,
          history: get().messages,
          tone: get().tone,
        }),
      })

      const data = await response.json()

      if (data.error) throw new Error(data.error)

      const assistantMessage: Message = {
        id: Math.random().toString(36).slice(2),
        role: 'assistant',
        content: data.message || 'Sorry, I failed to generate a response.',
      }

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
      }))
    } catch (err) {
      console.error('Error sending bot message:', err)
      const errorMessage: Message = {
        id: Math.random().toString(36).slice(2),
        role: 'assistant',
        content: err instanceof Error ? err.message : 'Error: Failed to fetch response. Please try again.',
      }
      set((state) => ({
        messages: [...state.messages, errorMessage],
        isLoading: false,
      }))
    }
  },

  setTone: (tone) => set({ tone }),
  clearMessages: () => set({ messages: [], isLoading: false }),
}))
