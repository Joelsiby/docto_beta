'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseWebSpeechProps {
  onTranscript: (text: string) => void
  isLoading: boolean
}

export function useWebSpeech({ onTranscript, isLoading }: UseWebSpeechProps) {
  const [isTalkMode, setIsTalkMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [supported, setSupported] = useState(false)

  const recognitionRef = useRef<any>(null)
  const recognitionActiveRef = useRef(false)
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const isLoadingRef = useRef(isLoading)
  const isTalkModeRef = useRef(isTalkMode)
  const isSpeakingRef = useRef(isSpeaking)

  // Keep refs up-to-date to avoid stale closures in event listeners
  useEffect(() => {
    isLoadingRef.current = isLoading
  }, [isLoading])

  useEffect(() => {
    isTalkModeRef.current = isTalkMode
  }, [isTalkMode])

  useEffect(() => {
    isSpeakingRef.current = isSpeaking
  }, [isSpeaking])

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition || !window.speechSynthesis) {
      setSupported(false)
      return
    }

    setSupported(true)

    const rec = new SpeechRecognition()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'en-IN' // Great for Hinglish / Indian accents

    rec.onstart = () => {
      setIsListening(true)
      recognitionActiveRef.current = true
    }

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0]?.transcript
      if (transcript) {
        onTranscript(transcript)
      }
    }

    rec.onerror = (event: any) => {
      // Ignore 'no-speech' error to prevent spamming console
      if (event.error !== 'no-speech') {
        console.error('Speech recognition error:', event.error)
      }
      // If permission is denied, stop talk mode completely
      if (event.error === 'not-allowed') {
        setIsTalkMode(false)
        alert('Microphone permission is required for Talk Mode. Please enable it in your browser settings.')
      }
    }

    rec.onend = () => {
      setIsListening(false)
      recognitionActiveRef.current = false

      // Auto-resume listening if talk mode is still active, we are not loading, and not speaking
      setTimeout(() => {
        if (isTalkModeRef.current && !isLoadingRef.current && !isSpeakingRef.current && !recognitionActiveRef.current) {
          try {
            rec.start()
          } catch (err) {
            console.error('Error restarting recognition:', err)
          }
        }
      }, 500) // 500ms delay to prevent rapid looping
    }

    recognitionRef.current = rec

    return () => {
      if (recognitionActiveRef.current) {
        rec.abort()
      }
    }
  }, [onTranscript])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || recognitionActiveRef.current) return
    try {
      recognitionRef.current.start()
    } catch (err) {
      console.error('Failed to start recognition:', err)
    }
  }, [])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !recognitionActiveRef.current) return
    try {
      recognitionRef.current.stop()
    } catch (err) {
      console.error('Failed to stop recognition:', err)
    }
  }, [])

  const startTalkMode = useCallback(() => {
    if (!supported) {
      alert('Talk Mode requires a browser that supports the Web Speech API (like Google Chrome or Safari).')
      return
    }

    // User Activation / Autoplay Policy Workaround:
    // We MUST execute speak() inside the synchronous click handler context to unlock the engine.
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      
      // Use an invisible silent space utterance to unlock the speech engine on user click
      const activationUtterance = new SpeechSynthesisUtterance(' ')
      activationUtterance.volume = 0.0
      activationUtterance.rate = 1.0
      activationUtterance.pitch = 1.0

      // Keep a reference to prevent garbage collection
      activeUtteranceRef.current = activationUtterance

      activationUtterance.onend = () => {
        activeUtteranceRef.current = null
      }
      activationUtterance.onerror = () => {
        activeUtteranceRef.current = null
      }

      window.speechSynthesis.speak(activationUtterance)
    }

    setIsSpeaking(false)
    setIsTalkMode(true)
    // Start listening
    startListening()
  }, [supported, startListening])

  const stopTalkMode = useCallback(() => {
    setIsTalkMode(false)
    stopListening()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    activeUtteranceRef.current = null
  }, [stopListening])

  const cleanMarkdown = (text: string): string => {
    return text
      .replace(/\*\*([^*]+)\*\*/g, '$1') // remove bold
      .replace(/\*([^*]+)\*/g, '$1')     // remove italic
      .replace(/#+\s/g, '')               // remove headers
      .replace(/`([^`]+)`/g, '$1')       // remove inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove links but keep text
      .replace(/<\/?[^>]+(>|$)/g, '')    // remove HTML tags if any
      .trim()
  }

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !isTalkModeRef.current) return

    // Stop recognition while speaking so the bot doesn't listen to itself
    stopListening()

    window.speechSynthesis.cancel()
    setIsSpeaking(true)

    const cleanedText = cleanMarkdown(text)
    const utterance = new SpeechSynthesisUtterance(cleanedText)

    // Explicitly configure speech parameters
    utterance.volume = 1.0
    utterance.rate = 1.0
    utterance.pitch = 1.0

    // Select the best voice (support both hyphens and underscores in language codes)
    const voices = window.speechSynthesis.getVoices()
    const indianVoice = voices.find((v) => {
      const cleanLang = v.lang.toLowerCase().replace('_', '-')
      return (cleanLang === 'en-in' || cleanLang === 'hi-in') && v.name.toLowerCase().includes('google')
    }) || voices.find((v) => {
      const cleanLang = v.lang.toLowerCase().replace('_', '-')
      return cleanLang === 'en-in' || cleanLang === 'hi-in'
    }) || voices.find((v) => {
      const cleanLang = v.lang.toLowerCase().replace('_', '-')
      return cleanLang.startsWith('en')
    })

    if (indianVoice) {
      utterance.voice = indianVoice
    }

    // Store reference to prevent garbage collection (famous Chrome bug)
    activeUtteranceRef.current = utterance

    utterance.onend = () => {
      activeUtteranceRef.current = null
      setIsSpeaking(false)
      // Resume listening if we are still in talk mode and not loading
      if (isTalkModeRef.current && !isLoadingRef.current) {
        startListening()
      }
    }

    utterance.onerror = (err) => {
      console.error('Speech synthesis error:', err)
      activeUtteranceRef.current = null
      setIsSpeaking(false)
      if (isTalkModeRef.current && !isLoadingRef.current) {
        startListening()
      }
    }

    // Wrap in a short delay so the cancellation finishes executing before starting the new utterance.
    // This is a crucial workaround for speech synthesis queue bugs in WebKit/Blink.
    setTimeout(() => {
      if (isTalkModeRef.current) {
        window.speechSynthesis.speak(utterance)
      }
    }, 150)
  }, [stopListening, startListening])

  // If loading starts externally (e.g. user manually sends a message), pause recognition
  useEffect(() => {
    if (isLoading && recognitionActiveRef.current) {
      stopListening()
    }
  }, [isLoading, stopListening])

  return {
    isTalkMode,
    isListening,
    isSpeaking,
    supported,
    startTalkMode,
    stopTalkMode,
    speak,
  }
}
