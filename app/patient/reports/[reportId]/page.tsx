'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, FileText, AlertTriangle, CheckCircle2, Info,
  Download, ExternalLink, Sparkles, TrendingUp, TrendingDown,
  Minus, Leaf, Zap, Upload, RefreshCw
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell
} from 'recharts'
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

// ── Custom Recharts Tooltip ───────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-xs">
        <p className="font-bold text-gray-900">{d.name}</p>
        <p className="text-gray-600">Value: <span className="font-semibold">{d.value} {d.unit}</span></p>
        <p className="text-gray-400">Normal: {d.normal_range}</p>
      </div>
    )
  }
  return null
}

// ── Status colour helpers ─────────────────────────────────────────────────────
const statusColor = (status: string) => {
  switch (status) {
    case 'low':        return '#ef4444'
    case 'high':       return '#f97316'
    case 'critical':   return '#dc2626'
    case 'borderline': return '#f59e0b'
    default:           return '#10b981'
  }
}

const statusBg = (status: string) => {
  switch (status) {
    case 'low':        return 'bg-red-50 border-red-200 text-red-700'
    case 'high':       return 'bg-orange-50 border-orange-200 text-orange-700'
    case 'critical':   return 'bg-red-100 border-red-300 text-red-800'
    case 'borderline': return 'bg-amber-50 border-amber-200 text-amber-700'
    default:           return 'bg-emerald-50 border-emerald-200 text-emerald-700'
  }
}

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'low' || status === 'critical') return <TrendingDown className="h-3.5 w-3.5" />
  if (status === 'high') return <TrendingUp className="h-3.5 w-3.5" />
  if (status === 'borderline') return <AlertTriangle className="h-3.5 w-3.5" />
  return <Minus className="h-3.5 w-3.5" />
}

const OverallBadge = ({ status }: { status: string }) => {
  const config: Record<string, { label: string; cls: string }> = {
    normal:             { label: 'All Clear', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    borderline:         { label: 'Borderline', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    attention_required: { label: 'Needs Attention', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
    critical:           { label: 'Critical', cls: 'bg-red-100 text-red-700 border-red-200' },
  }
  const c = config[status] || config.normal
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${c.cls}`}>
      {c.label}
    </span>
  )
}

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params.reportId as string
  const supabase = createClient()

  const [report, setReport] = useState<HealthReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isReanalyzing, setIsReanalyzing] = useState(false)

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    setIsLoading(true)
    const { data }: { data: any } = await supabase
      .from('health_reports')
      .select('*')
      .eq('id', reportId)
      .maybeSingle()

    if (data) setReport(data)
    setIsLoading(false)
  }

  const handleReanalyze = async () => {
    if (!report?.file_url) return
    setIsReanalyzing(true)
    try {
      // Fetch the file from supabase storage URL, rebuild formdata and re-trigger analysis
      const response = await fetch('/api/reports/analyze', {
        method: 'POST',
        // For re-analysis without the file, we can trigger via a dedicated re-analyze endpoint
        // Here we just refetch the existing analysis
      })
      // Placeholder: in production this would re-call the analyze endpoint with the stored file
      await fetchReport()
    } catch {}
    setIsReanalyzing(false)
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

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
        <Link href="/patient/reports" className="text-sm text-[#0050cb] hover:underline mt-2 inline-block">← Back</Link>
      </div>
    )
  }

  const analysis = report.ai_analysis
  const flagged: any[] = report.flagged_parameters || analysis?.flagged_parameters || []
  const allParams: any[] = analysis?.all_parameters || []
  const recommendations: string[] = analysis?.recommendations || []

  // Build chart data from all_parameters or flagged_parameters
  const chartData = (allParams.length > 0 ? allParams : flagged).map((p: any) => ({
    name: p.name.length > 14 ? p.name.slice(0, 13) + '…' : p.name,
    fullName: p.name,
    value: parseFloat(p.value) || 0,
    unit: p.unit || '',
    status: p.status || 'normal',
    normal_range: p.normal_range || '',
  })).filter(p => !isNaN(p.value) && p.value > 0).slice(0, 12)

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => router.push('/patient/reports')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Reports
      </button>

      {/* Report Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100 flex-shrink-0">
              <FileText className="h-6 w-6 text-[#0050cb]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-headline)' }}>
                {report.report_name}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Uploaded {formatDate(report.created_at)}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {report.status === 'analyzed' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> AI Analyzed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700">
                    <Info className="h-3.5 w-3.5" /> {report.status === 'analyzing' ? 'Analyzing…' : 'Pending Analysis'}
                  </span>
                )}
                {analysis?.overall_status && <OverallBadge status={analysis.overall_status} />}
                {flagged.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-600">
                    <AlertTriangle className="h-3.5 w-3.5" /> {flagged.length} Flagged
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {report.file_url && (
              <a
                href={report.file_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <ExternalLink className="h-3.5 w-3.5" /> View Original
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Analyzing state */}
      {report.status === 'analyzing' && (
        <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 border-3 border-[#0050cb]/20 border-t-[#0050cb] rounded-full animate-spin mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900">AI is analyzing your report…</h3>
          <p className="text-sm text-gray-500 mt-1">This usually takes 10–30 seconds. Check back shortly.</p>
        </div>
      )}

      {report.status === 'analyzed' && analysis && (
        <div className="space-y-6">
          {/* AI Summary */}
          {analysis.summary && (
            <div className="bg-gradient-to-br from-[#0050cb]/5 via-white to-white rounded-2xl border border-[#0050cb]/10 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#0050cb]" /> AI Summary
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">{analysis.summary}</p>
              {analysis.follow_up && (
                <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-xs text-[#0050cb] font-semibold">📅 Follow-up:</p>
                  <p className="text-xs text-gray-700 mt-0.5">{analysis.follow_up}</p>
                </div>
              )}
            </div>
          )}

          {/* Interactive Chart — All Parameters */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#0050cb]" /> Parameter Overview
              </h2>
              <p className="text-xs text-gray-400 mb-5">Red/orange bars indicate out-of-range values</p>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9, fill: '#94a3b8' }}
                      angle={-35}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={statusColor(entry.status)} opacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 mt-2 justify-center flex-wrap">
                {[
                  { color: '#10b981', label: 'Normal' },
                  { color: '#f59e0b', label: 'Borderline' },
                  { color: '#f97316', label: 'High' },
                  { color: '#ef4444', label: 'Low / Critical' },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
                    <span className="text-[10px] text-gray-500">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flagged Parameters with Remedies */}
          {flagged.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Values That Need Attention
              </h2>
              <div className="space-y-5">
                {flagged.map((param: any, idx: number) => (
                  <div key={idx} className={`rounded-2xl border p-5 ${statusBg(param.status)}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <StatusIcon status={param.status} />
                        <h3 className="font-bold text-gray-900 text-base">{param.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBg(param.status)}`}>
                          {param.status?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm w-fit">
                        <span className="font-bold font-mono text-gray-900">{param.value} {param.unit}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-500 text-xs">Normal: {param.normal_range}</span>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="bg-white/70 rounded-xl p-3 border border-white mb-3">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-semibold text-gray-900">What this means: </span>
                        {param.explanation || 'This value is outside the normal range.'}
                      </p>
                    </div>

                    {/* Indian Remedy */}
                    {param.remedy && (
                      <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 flex items-start gap-2">
                        <Leaf className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">
                            Remedy & Diet Tips
                          </p>
                          <p className="text-xs text-emerald-800 leading-relaxed">{param.remedy}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No flagged = all clear */}
          {flagged.length === 0 && (
            <div className="text-center py-10 bg-emerald-50 rounded-2xl border border-emerald-100">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
              <p className="font-semibold text-emerald-800 text-lg">All Parameters Normal!</p>
              <p className="text-sm text-emerald-600 mt-1">Great news — no values were flagged as out of range.</p>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Recommendations
              </h2>
              <ul className="space-y-3">
                {recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0050cb] flex-shrink-0" />
                    <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Book Doctor CTA */}
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-blue-900 text-sm">Discuss with a Doctor</h3>
                <p className="text-xs text-blue-700/80 mt-0.5 leading-relaxed">
                  AI analysis is for information only. A certified doctor can properly diagnose and treat based on these results.
                </p>
              </div>
              <Link
                href="/patient/doctors"
                className="whitespace-nowrap py-2.5 px-5 rounded-xl bg-[#0050cb] text-white font-semibold text-sm hover:bg-[#003d9e] transition-colors shadow-lg shadow-blue-500/20"
              >
                Find a Doctor
              </Link>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
            <div className="flex items-start gap-2 text-gray-500 font-semibold text-xs uppercase tracking-wider mb-2">
              <AlertTriangle className="h-3.5 w-3.5" />
              Medical Disclaimer
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              This analysis is generated by an AI model using ICMR reference ranges and should not replace professional medical advice, diagnosis, or treatment. Always consult your physician for medical decisions.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
