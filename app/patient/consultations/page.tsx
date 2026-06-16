'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Stethoscope, Calendar, Pill, FileText,
  ChevronRight, AlertCircle, CheckCircle2, Clock
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Session {
  id: string
  started_at: string
  ended_at: string | null
  patient_summary: string | null
  ai_summary: string | null
  ai_diagnosis: any[]
  ai_issues: string[]
  ai_referrals: string[]
  is_confirmed: boolean
  doctor_profiles: {
    full_name: string
    specialization: string
    profile_image_url: string | null
  } | null
  prescriptions: { id: string }[]
}

export default function ConsultationsPage() {
  const supabase = createClient()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoading(false); return }

    const { data: patient }: { data: any } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!patient) { setIsLoading(false); return }

    const { data, error }: { data: any, error: any } = await supabase
      .from('sessions')
      .select(`
        id, started_at, ended_at, patient_summary, ai_summary, 
        ai_diagnosis, ai_issues, ai_referrals, is_confirmed,
        doctor_profiles!sessions_doctor_id_fkey(full_name, specialization, profile_image_url),
        prescriptions(id)
      `)
      .eq('patient_id', patient.id)
      .eq('is_confirmed', true)
      .order('started_at', { ascending: false })

    if (!error && data) {
      setSessions(data)
    }
    setIsLoading(false)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const today = new Date()
    const diffDays = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getInitials = (name: string) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'DR'

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          <Stethoscope className="h-6 w-6 text-[#0050cb]" />
          My Consultations
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review summaries, diagnoses, and prescriptions from your past sessions.
        </p>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded-lg w-1/3" />
                  <div className="h-3 bg-gray-100 rounded-lg w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5">
            <Stethoscope className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No consultations yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
            Your consultation summaries will appear here after your doctor completes a session with you.
          </p>
          <Link
            href="/patient/doctors"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0050cb] text-white text-sm font-semibold hover:bg-[#003d9e] transition-colors"
          >
            Book a Consultation
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const doctor = session.doctor_profiles
            const diagnosisCount = Array.isArray(session.ai_diagnosis) ? session.ai_diagnosis.length : 0
            const rxCount = session.prescriptions?.length || 0
            const issues = Array.isArray(session.ai_issues) ? session.ai_issues : []

            return (
              <Link
                key={session.id}
                href={`/patient/consultations/${session.id}`}
                className="group block bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-100 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  {/* Doctor Avatar */}
                  {doctor?.profile_image_url ? (
                    <img
                      src={doctor.profile_image_url}
                      alt={doctor.full_name}
                      className="w-14 h-14 rounded-2xl object-cover border border-gray-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0050cb] to-[#3d8bfd] flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-500/20 flex-shrink-0">
                      {getInitials(doctor?.full_name || 'DR')}
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">
                          Dr. {doctor?.full_name || 'Unknown'}
                        </h3>
                        <p className="text-xs text-gray-500">{doctor?.specialization || 'Specialist'}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                        <Clock className="h-3 w-3" />
                        {formatDate(session.started_at)}
                      </div>
                    </div>

                    {/* AI Summary preview */}
                    {(session.patient_summary || session.ai_summary) && (
                      <p className="text-xs text-gray-600 mt-2 leading-relaxed line-clamp-2">
                        {session.patient_summary || session.ai_summary}
                      </p>
                    )}

                    {/* Issue tags */}
                    {issues.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {issues.slice(0, 3).map((issue, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100"
                          >
                            {issue}
                          </span>
                        ))}
                        {issues.length > 3 && (
                          <span className="text-[10px] text-gray-400">+{issues.length - 3} more</span>
                        )}
                      </div>
                    )}

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                      {diagnosisCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <FileText className="h-3.5 w-3.5 text-blue-400" />
                          {diagnosisCount} diagnosis
                        </div>
                      )}
                      {rxCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Pill className="h-3.5 w-3.5 text-emerald-500" />
                          {rxCount} prescription{rxCount > 1 ? 's' : ''}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-emerald-600 ml-auto">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirmed
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#0050cb] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
