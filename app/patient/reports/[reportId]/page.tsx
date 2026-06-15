'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, FileText, AlertTriangle, CheckCircle2, Info,
  TrendingUp, TrendingDown, Minus, Download, ExternalLink, Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface HealthReport {
  id: string
  report_name: string
  report_type: string
  file_url: string | null
  file_type: string
  status: string
  flagged_parameters: any[] | null
  ai_analysis: any | null
  created_at: string
}

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params.reportId as string
  const supabase = createClient()

  const [report, setReport] = useState<HealthReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    setIsLoading(true)
    const { data, error }: { data: any, error: any } = await supabase
      .from('health_reports')
      .select('*')
      .eq('id', reportId)
      .maybeSingle()

    if (data) setReport(data)
    setIsLoading(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-[#0050cb]/20 border-t-[#0050cb] rounded-full animate-spin" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold text-gray-800">Report not found</h2>
        <Link href="/patient/reports" className="text-sm text-[#0050cb] hover:underline mt-2 inline-block">
          ← Back to reports
        </Link>
      </div>
    )
  }

  const flaggedCount = report.flagged_parameters?.length || 0

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => router.push('/patient/reports')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Reports
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100 flex-shrink-0">
            <FileText className="h-6 w-6 text-[#0050cb]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-headline)' }}>
              {report.report_name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Uploaded on {formatDate(report.created_at)}</p>
            <div className="flex items-center gap-2 mt-3">
              {report.status === 'analyzed' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> AI Analyzed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700">
                  <Info className="h-3.5 w-3.5" /> {report.status === 'analyzing' ? 'Analyzing...' : 'Not Analyzed'}
                </span>
              )}
              {flaggedCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-600">
                  <AlertTriangle className="h-3.5 w-3.5" /> {flaggedCount} Flagged Values
                </span>
              )}
            </div>
          </div>
        </div>
        {report.file_url && (
          <a
            href={report.file_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-50 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <ExternalLink className="h-4 w-4" /> View Original
          </a>
        )}
      </div>

      {report.status === 'analyzing' && (
        <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 border-3 border-[#0050cb]/20 border-t-[#0050cb] rounded-full animate-spin mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900">AI is currently analyzing this report...</h3>
          <p className="text-sm text-gray-500 mt-1">Check back in a few moments.</p>
        </div>
      )}

      {report.status === 'analyzed' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Summary & Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Summary */}
            <div className="bg-gradient-to-br from-[#0050cb]/5 via-white to-white rounded-2xl border border-[#0050cb]/10 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#0050cb]" /> AI Summary
              </h2>
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                {report.ai_analysis?.summary ? (
                  <p>{report.ai_analysis.summary}</p>
                ) : (
                  <p>A comprehensive summary of your report indicates overall normal findings, but please review the flagged parameters below for any specifics.</p>
                )}
              </div>
            </div>

            {/* Flagged Parameters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className={`h-5 w-5 ${flaggedCount > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                Flagged Parameters
              </h2>
              
              {flaggedCount === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">All parameters look normal!</p>
                  <p className="text-xs text-gray-500 mt-1">No values were flagged as out of range by the AI.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {report.flagged_parameters?.map((param: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border border-red-100 bg-red-50/30">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                        <h3 className="font-bold text-gray-900 text-base">{param.name}</h3>
                        <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-red-100 shadow-sm w-fit">
                          <span className="text-red-600 font-bold font-mono">{param.value} {param.unit}</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-gray-500 text-xs">Normal: {param.normal_range}</span>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 border border-red-50">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          <span className="font-semibold text-gray-900">What it means: </span>
                          {param.explanation || "This value is outside the standard reference range."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* General Advice */}
            {report.ai_analysis?.recommendations && report.ai_analysis.recommendations.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  General Recommendations
                </h2>
                <ul className="space-y-3">
                  {report.ai_analysis.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      <p className="text-sm text-gray-600 leading-relaxed">{rec}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: Disclaimer & Doctor Link */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
              <h3 className="font-bold text-blue-900 mb-2">Discuss with a Doctor</h3>
              <p className="text-xs text-blue-700/80 mb-4 leading-relaxed">
                AI analysis is for informational purposes only. Book a consultation to discuss these results with a certified medical professional.
              </p>
              <Link
                href="/patient/doctors"
                className="w-full py-3 rounded-xl bg-[#0050cb] text-white font-semibold text-sm hover:bg-[#003d9e] transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                Find a Doctor
              </Link>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-2 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4" />
                Medical Disclaimer
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                This analysis is generated by an AI model and should not replace professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
