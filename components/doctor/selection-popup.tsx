'use client'

import { useEffect, useState } from 'react'
import { useBotStore } from '@/stores/bot-store'

export function SelectionPopup() {
  const { sendMessage } = useBotStore()
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resultPos, setResultPos] = useState({ top: 0, left: 0 })
  const [showResult, setShowResult] = useState(false)
  const [resultPage, setResultPage] = useState(0)

  const [showBlock, setShowBlock] = useState(false)
  const [blockPos, setBlockPos] = useState({ top: 0, left: 0 })
  const [selectedText, setSelectedText] = useState('')

  const loadingPhrases = [
    "Analyzing medical literature...",
    "Extracting clinical context...",
    "Querying knowledge base...",
    "Synthesizing findings...",
    "Reviewing terminology...",
    "Processing clinical data..."
  ]
  const [loadingPhrase, setLoadingPhrase] = useState(loadingPhrases[0])

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingPhrase(prev => {
          const currentIndex = loadingPhrases.indexOf(prev)
          return loadingPhrases[(currentIndex + 1) % loadingPhrases.length]
        })
      }, 1500)
    }
    return () => clearInterval(interval)
  }, [isLoading])

  const isSingleWord = selectedText.trim().split(/\s+/).length === 1

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) {
        return
      }

      const text = selection.toString().trim()
      if (!text) return

      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      const isSingle = text.trim().split(/\s+/).length === 1
      const POPUP_HEIGHT = isSingle ? 220 : 250
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top

      let topPos = 0
      if (spaceBelow > POPUP_HEIGHT + 20) {
        // Under the selection
        topPos = rect.bottom + window.scrollY + 10
      } else if (spaceAbove > POPUP_HEIGHT + 20) {
        // Above the selection
        topPos = rect.top + window.scrollY - POPUP_HEIGHT - 10
      } else {
        // Over the selection
        topPos = rect.top + window.scrollY + (rect.height / 2) - (POPUP_HEIGHT / 2)
      }

      setBlockPos({
        top: topPos,
        left: Math.max(10, Math.min(window.innerWidth - 260, rect.left + rect.width / 2 - 120))
      })
      
      setSelectedText(text)
      setShowBlock(true)
    }

    const handleMouseUp = (e: MouseEvent) => {
      setTimeout(handleSelection, 10)
    }

    const handleMouseDown = (e: MouseEvent) => {
      const popupBlock = document.getElementById('popup-block')
      const resultBlock = document.getElementById('popup-result')
      
      // If clicking inside popup or result, do nothing
      if ((popupBlock && popupBlock.contains(e.target as Node)) || 
          (resultBlock && resultBlock.contains(e.target as Node))) {
        return
      }
      
      setShowBlock(false)
    }

    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  const triggerGeminiAction = async (text: string, action: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Hide menu
    setShowBlock(false)

    // Position result popup near the click
    setResultPos({
      top: e.clientY + window.scrollY + 15,
      left: Math.max(10, e.clientX - 150)
    })
    setShowResult(true)
    setIsLoading(true)
    setResult('')
    setResultPage(0)

    try {
      const response = await fetch('/api/research/define', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, action })
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setResult(data.result)
    } catch (err: any) {
      setResult('Failed to load insight. Make sure GEMINI_API_KEY is defined and working.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Dynamic Selection Popup */}
      <div 
        className={`selection-popup w-64 flex flex-col absolute bg-white shadow-xl rounded-xl border border-gray-200 z-50 text-black transition-opacity duration-200 ${showBlock ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none hidden'}`} 
        id="popup-block"
        style={{ top: blockPos.top, left: blockPos.left }}
      >
        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/50 rounded-t-xl flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Selection Actions</span>
          {selectedText.length > 50 && <span className="text-[10px] text-gray-400 truncate w-24">"{selectedText.substring(0, 20)}..."</span>}
        </div>
        <div className="p-1 flex flex-col">
          {isSingleWord ? (
            <>
              <button 
                onClick={(e) => triggerGeminiAction(selectedText, 'meaning', e)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-left group cursor-pointer"
              >
                <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">menu_book</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900">Meaning or Definition</span>
                </div>
              </button>
              <button 
                onClick={(e) => triggerGeminiAction(selectedText, 'meaning_context', e)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-left group cursor-pointer"
              >
                <div className="w-6 h-6 rounded bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">manage_search</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900">Meaning in this context</span>
                </div>
              </button>
              <button 
                onClick={(e) => triggerGeminiAction(selectedText, 'root', e)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-left group cursor-pointer"
              >
                <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">account_tree</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900">Root / Etymology</span>
                </div>
              </button>
              <button 
                onClick={(e) => triggerGeminiAction(selectedText, 'pronounce', e)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-left group cursor-pointer"
              >
                <div className="w-6 h-6 rounded bg-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900">Pronounce</span>
                </div>
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={(e) => triggerGeminiAction(selectedText, 'summarize', e)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-left group cursor-pointer"
              >
                <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">short_text</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900">Summarise</span>
                </div>
              </button>
              <button 
                onClick={(e) => triggerGeminiAction(selectedText, 'function', e)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-left group cursor-pointer"
              >
                <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">integration_instructions</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900">Function of lines</span>
                  <span className="text-[10px] text-gray-500 break-words">Role in paragraph/page</span>
                </div>
              </button>
              <button 
                onClick={(e) => triggerGeminiAction(selectedText, 'simplify', e)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-left group cursor-pointer"
              >
                <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900">Simplify the whole thing</span>
                </div>
              </button>
              <button 
                onClick={(e) => triggerGeminiAction(selectedText, 'takeaways', e)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-left group cursor-pointer"
              >
                <div className="w-6 h-6 rounded bg-teal-100 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900">Key takeaway in bullet points</span>
                </div>
              </button>
              <div className="w-full h-px bg-gray-100 my-1"></div>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  sendMessage(`Explain the following text:\n\n"${selectedText}"`)
                  setShowBlock(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-left group cursor-pointer"
              >
                <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white flex-shrink-0 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium text-purple-600 group-hover:text-purple-700">Ask Docto</span>
                </div>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3. AI Result Card */}
      {showResult && (
        <div 
          style={{
            position: 'absolute',
            top: resultPos.top,
            left: resultPos.left,
            width: 320,
            background: '#fff',
            borderRadius: 12,
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
            padding: 16,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            color: '#1D1D1F',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#0050cb', letterSpacing: '0.04em' }}>Docto AI Insights</span>
            <button 
              onClick={() => setShowResult(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#86868B', display: 'flex', padding: 2 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          
          <div style={{ fontSize: 13, lineHeight: 1.5, fontFamily: '-apple-system, sans-serif', color: '#3C3C43' }}>
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <span>{loadingPhrase}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ whiteSpace: 'pre-wrap' }}>
                  {result.split(/(?:\r?\n){2,}/).filter(p => p.trim().length > 0)[resultPage] || result}
                </p>
                
                {result.split(/(?:\r?\n){2,}/).filter(p => p.trim().length > 0).length > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, borderTop: '1px solid #E5E5EA', paddingTop: 8 }}>
                    <span style={{ fontSize: 11, color: '#8E8E93' }}>
                      Page {resultPage + 1} of {result.split(/(?:\r?\n){2,}/).filter(p => p.trim().length > 0).length}
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        onClick={() => setResultPage(prev => Math.max(0, prev - 1))}
                        disabled={resultPage === 0}
                        style={{ background: 'none', border: 'none', cursor: resultPage === 0 ? 'default' : 'pointer', color: resultPage === 0 ? '#C7C7CC' : '#007AFF', padding: 2 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                      </button>
                      <button 
                        onClick={() => setResultPage(prev => Math.min(result.split(/(?:\r?\n){2,}/).filter(p => p.trim().length > 0).length - 1, prev + 1))}
                        disabled={resultPage === result.split(/(?:\r?\n){2,}/).filter(p => p.trim().length > 0).length - 1}
                        style={{ background: 'none', border: 'none', cursor: resultPage === result.split(/(?:\r?\n){2,}/).filter(p => p.trim().length > 0).length - 1 ? 'default' : 'pointer', color: resultPage === result.split(/(?:\r?\n){2,}/).filter(p => p.trim().length > 0).length - 1 ? '#C7C7CC' : '#007AFF', padding: 2 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
