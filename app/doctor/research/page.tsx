'use client'

import { useState, useRef, useEffect } from 'react'
import { DoctorTopBar } from '@/components/doctor/top-bar'
import { DoctoBotSidebar } from '@/components/doctor/docto-bot-sidebar'
import { DocumentViewer } from '@/components/doctor/document-viewer'
import { SelectionPopup } from '@/components/doctor/selection-popup'
import { createClient } from '@/lib/supabase/client'

export default function ResearchHubPage() {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Document state
  const [title, setTitle] = useState("Cortical Remapping Following Ischemic Events")
  const [content, setContent] = useState("")
  const [insightsHtml, setInsightsHtml] = useState<string | null>(null)
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>([
    'Upload a document to extract key clinical takeaways.',
  ])
  const [isSaved, setIsSaved] = useState(false)
  const [doctorId, setDoctorId] = useState<string | null>(null)

  useEffect(() => {
    // Get doctor profile
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('doctor_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data) setDoctorId((data as any).id)
          })
      }
    })
  }, [])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setIsSaved(false)
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setTitle(data.title)
      setKeyTakeaways(data.keyTakeaways)
      setContent(data.rawText || "Failed to load document text. Please try again.")
      
      const generatedContent = `
        <div class="prose max-w-none text-[15px] text-[#3C3C43]">
          <h2 class="text-lg font-bold text-[#1D1D1F] border-b pb-1 mb-3">Executive Summary</h2>
          <div class="bg-blue-50/50 p-4 rounded-xl mb-6">
            ${data.executiveSummary}
          </div>

          <h2 class="text-lg font-bold text-[#1D1D1F] border-b pb-1 mb-3 mt-6">Deep Dive & Synthesis</h2>
          <div class="mb-6">
            ${data.deepDive}
          </div>

          <h2 class="text-lg font-bold text-[#1D1D1F] border-b pb-1 mb-3 mt-6">Clinical Application (Vignettes)</h2>
          <div class="bg-[#F5F5F7] p-5 rounded-xl mb-6">
            ${data.clinicalVignettes}
          </div>

          <h2 class="text-lg font-bold text-[#1D1D1F] border-b pb-1 mb-3 mt-6">External Context & Consensus</h2>
          <div class="mb-6">
            ${data.externalContext}
          </div>
        </div>
      `
      setInsightsHtml(generatedContent)
    } catch (err) {
      console.error('Error analyzing research paper:', err)
      alert('Failed to analyze document. Please check your Gemini API key in env.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDocument = async () => {
    if (!doctorId) {
      alert('You must be logged in as a Doctor to save documents.')
      return
    }

    try {
      const { error } = await (supabase as any).from('research_documents').insert({
        doctor_id: doctorId,
        title,
        insights: keyTakeaways,
        content,
        is_saved: true,
      })

      if (error) throw error
      setIsSaved(true)
    } catch (err) {
      console.error('Error saving research document:', err)
      alert('Failed to save document to your profile.')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <DoctorTopBar
        title={title}
        subtitle="Research Hub · AI Assistant"
        actions={
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.txt"
              style={{ display: 'none' }}
            />
            <button
              onClick={handleUploadClick}
              disabled={isLoading}
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                border: 'none',
                background: '#0050cb',
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: '-apple-system, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {isLoading ? 'Analyzing...' : 'Upload Paper'}
            </button>
          </>
        }
      />

      {/* Three-pane layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: 20, gap: 16, background: '#F5F5F7' }}>
        {/* Left: Document Viewer */}
        <div
          style={{
            flex: 1.5,
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <DocumentViewer 
            title={title}
            content={content}
            isLoading={isLoading}
            onSave={handleSaveDocument}
            isSaved={isSaved}
          />
        </div>

        {/* Middle: Insights */}
        <div
          style={{
            flex: 1.2,
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.05)',
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(255,204,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1D1D1F', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
              Smart Insights
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
            {isLoading ? (
               <div className="flex flex-col items-center justify-center h-full text-[#8E8E93] gap-4">
                 <div className="flex gap-1.5 items-center">
                   <span className="h-2 w-2 bg-[#FF9500] rounded-full animate-bounce"></span>
                   <span className="h-2 w-2 bg-[#FF9500] rounded-full animate-bounce delay-75"></span>
                   <span className="h-2 w-2 bg-[#FF9500] rounded-full animate-bounce delay-150"></span>
                 </div>
                 <span className="text-sm font-medium">Extracting Clinical Insights...</span>
               </div>
            ) : insightsHtml ? (
               <div dangerouslySetInnerHTML={{ __html: insightsHtml }} className="pb-10" />
            ) : (
               <div className="flex flex-col gap-2">
                 {keyTakeaways.map((insight, i) => (
                   <div
                     key={i}
                     style={{
                       display: 'flex',
                       alignItems: 'flex-start',
                       gap: 8,
                       padding: '10px 12px',
                       background: '#F5F5F7',
                       borderRadius: 10,
                     }}
                   >
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="20 6 9 17 4 12"/></svg>
                     <span style={{ fontSize: 12, color: '#3C3C43', fontFamily: '-apple-system, sans-serif', lineHeight: 1.5 }}>
                       {insight}
                     </span>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>

        {/* Right: Docto Bot */}
        <div
          style={{
            width: 320,
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <DoctoBotSidebar />
        </div>
      </div>

      <SelectionPopup />
    </div>
  )
}
