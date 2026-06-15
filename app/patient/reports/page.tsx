'use client'

import { useEffect, useState, useRef } from 'react'
import {
  FileText, Upload, Sparkles, AlertTriangle, CheckCircle2, Clock,
  ChevronRight, Plus, Search, TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface HealthReport {
  id: string
  report_name: string
  report_type: string
  file_url: string | null
  status: string
  flagged_parameters: any[] | null
  ai_analysis: any | null
  created_at: string
}

export default function PatientReportsPage() {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [reports, setReports] = useState<HealthReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [patientId, setPatientId] = useState<string | null>(null)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoading(false); return }

    const { data: profile }: { data: any } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profile) {
      setPatientId(profile.id)
      fetchReports(profile.id)
    } else {
      setIsLoading(false)
    }
  }

  const fetchReports = async (pid: string) => {
    setIsLoading(true)
    const { data, error }: { data: any, error: any } = await supabase
      .from('health_reports')
      .select('*')
      .eq('patient_id', pid)
      .order('created_at', { ascending: false })

    if (!error && data) setReports(data)
    setIsLoading(false)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !patientId) return

    setIsUploading(true)
    try {
      // 1. Upload file to Supabase Storage
      const fileName = `${patientId}/${Date.now()}_${file.name}`
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName)

      // 2. Create health_reports record
      const { data: reportData, error: reportError }: { data: any, error: any } = await supabase
        .from('health_reports')
        .insert({
          patient_id: patientId,
          report_name: file.name.replace(/\.[^/.]+$/, ''),
          report_type: 'general',
          file_url: publicUrl,
          file_type: file.type.includes('pdf') ? 'pdf' : 'image',
          status: 'analyzing',
        } as any)
        .select()
        .single()

      if (reportError) throw reportError

      // 3. Send to AI for analysis
      const formData = new FormData()
      formData.append('file', file)
      formData.append('reportId', reportData.id)

      const res = await fetch('/api/reports/analyze', {
        method: 'POST',
        body: formData,
      })

      const result = await res.json()

      if (result.analysis) {
        await supabase
          .from('health_reports')
          .update({
            status: 'analyzed',
            ai_analysis: result.analysis,
            flagged_parameters: result.flagged || [],
            analyzed_at: new Date().toISOString(),
          } as any)
          .eq('id', reportData.id)
      }

      fetchReports(patientId)
    } catch (err: any) {
      console.error('Upload error:', err)
      alert('Failed to upload report: ' + (err?.message || err))
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'analyzed':
        return { label: 'Analyzed', className: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 }
      case 'analyzing':
        return { label: 'Analyzing...', className: 'bg-amber-50 text-amber-700', icon: Clock }
      default:
        return { label: 'Uploaded', className: 'bg-gray-50 text-gray-600', icon: FileText }
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-headline)' }}>
            Health Reports
          </h1>
          <p className="text-sm text-gray-500 mt-1">Upload lab reports for instant AI-powered analysis</p>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-8 md:p-12 text-center cursor-pointer transition-all duration-300 ${isUploading
            ? 'border-blue-300 bg-blue-50/50'
            : 'border-gray-200 bg-white hover:border-[#0050cb]/40 hover:bg-blue-50/30'
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleUpload}
          className="hidden"
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-3 border-[#0050cb]/20 border-t-[#0050cb] rounded-full animate-spin" />
            <p className="text-sm font-semibold text-[#0050cb]">Uploading & analyzing your report...</p>
            <p className="text-xs text-gray-500">This may take a moment while our AI processes the document</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0050cb] to-[#3d8bfd] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Upload className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">Upload Lab Report</p>
              <p className="text-xs text-gray-500 mt-1">PDF, PNG, or JPEG • AI analysis powered by Gemini</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0050cb] text-white text-xs font-semibold shadow-md shadow-blue-500/20">
              <Plus className="h-3.5 w-3.5" /> Choose File
            </div>
          </div>
        )}
      </div>

      {/* AI Insight Banner */}
      <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">AI-Powered Report Analysis</h3>
          <p className="text-xs text-gray-600 leading-relaxed mt-1">
            Our AI reads your blood work, identifies flagged values, and explains what they mean in simple language.
            Always consult your doctor for medical decisions.
          </p>
        </div>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
                  <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5">
            <FileText className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No reports uploaded yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Upload your lab reports to get instant AI-powered insights and track your health over time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const status = getStatusBadge(report.status)
            const StatusIcon = status.icon
            const flaggedCount = report.flagged_parameters?.length || 0

            return (
              <Link
                key={report.id}
                href={`/patient/reports/${report.id}`}
                className="group flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-100 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100">
                    <FileText className="h-5 w-5 text-[#0050cb]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#0050cb] transition-colors">
                      {report.report_name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">{formatDate(report.created_at)}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${status.className}`}>
                        <StatusIcon className="h-3 w-3" /> {status.label}
                      </span>
                      {flaggedCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-50 text-red-600">
                          <AlertTriangle className="h-3 w-3" /> {flaggedCount} flagged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-[#0050cb] group-hover:translate-x-0.5 transition-all" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
