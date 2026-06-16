'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Stethoscope, Calendar, Pill, FileText,
  Sparkles, User, AlertCircle, CheckCircle2, ExternalLink,
  ChevronRight, Heart, Info, Activity
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SessionDetail {
  id: string
  started_at: string
  ended_at: string | null
  patient_summary: string | null
  ai_summary: string | null
  ai_issues: any[]
  ai_diagnosis: any[]
  ai_referrals: any[]
  lifestyle_suggestions: any[]
  doctor_notes: string | null
  doctor_profiles: {
    full_name: string
    specialization: string
    profile_image_url: string | null
    clinic_name: string | null
  } | null
}

interface PrescriptionItem {
  id: string
  name: string
  dosage: string | null
  when_to_take: string[] | null
  timing: string[] | null
  meal_relation: string | null
  duration_days: number | null
  notes: string | null
  actions: string | null
}

type TabType = 'summary' | 'prescriptions' | 'referrals'

export default function ConsultationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const supabase = createClient()

  const [session, setSession] = useState<SessionDetail | null>(null)
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('summary')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSessionData()
  }, [])

  const fetchSessionData = async () => {
    setIsLoading(true)

    // Fetch session
    const { data: sessionData }: { data: any } = await supabase
      .from('sessions')
      .select(`
        id, started_at, ended_at, patient_summary, ai_summary, ai_issues,
        ai_diagnosis, ai_referrals, lifestyle_suggestions, doctor_notes,
        doctor_profiles!sessions_doctor_id_fkey(full_name, specialization, profile_image_url, clinic_name)
      `)
      .eq('id', sessionId)
      .eq('is_confirmed', true)
      .maybeSingle()

    if (sessionData) setSession(sessionData)

    // Fetch prescription items linked to this session
    const { data: rxData }: { data: any } = await supabase
      .from('prescriptions')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle()

    if (rxData?.id) {
      const { data: items }: { data: any } = await supabase
        .from('prescription_items')
        .select('*')
        .eq('prescription_id', rxData.id)

      if (items) {
        setPrescriptions(
          items.map((item: any) => ({
            ...item,
            name: item.medicine_name || item.medication_name || '',
          }))
        )
      }
    }

    setIsLoading(false)
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  const getMealLabel = (relation: string | null) => {
    switch (relation) {
      case 'before_meals': return 'Before Meals'
      case 'after_meals': return 'After Meals'
      case 'with_meals': return 'With Meals'
      default: return 'As Directed'
    }
  }

  const getInitials = (name: string) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'DR'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-[#0050cb]/20 border-t-[#0050cb] rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold text-gray-800">Consultation not found</h2>
        <Link href="/patient/consultations" className="text-sm text-[#0050cb] hover:underline mt-2 inline-block">
          ← Back to consultations
        </Link>
      </div>
    )
  }

  const doctor = session.doctor_profiles
  const diagnoses = Array.isArray(session.ai_diagnosis) ? session.ai_diagnosis : []
  const issues = Array.isArray(session.ai_issues) ? session.ai_issues : []
  const referrals = Array.isArray(session.ai_referrals) ? session.ai_referrals : []
  const lifestyle = Array.isArray(session.lifestyle_suggestions) ? session.lifestyle_suggestions : []

  const TABS: { key: TabType; label: string; icon: any; count?: number }[] = [
    { key: 'summary', label: 'Summary', icon: Sparkles },
    { key: 'prescriptions', label: 'Prescriptions', icon: Pill, count: prescriptions.length },
    { key: 'referrals', label: 'Referrals', icon: ExternalLink, count: referrals.length + lifestyle.length },
  ]

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => router.push('/patient/consultations')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Consultations
      </button>

      {/* Doctor Header Card */}
      <div className="bg-gradient-to-br from-[#0050cb] to-[#3d8bfd] rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
        <div className="flex items-start gap-4">
          {doctor?.profile_image_url ? (
            <img
              src={doctor.profile_image_url}
              alt={doctor.full_name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xl font-bold flex-shrink-0 border border-white/20">
              {getInitials(doctor?.full_name || 'DR')}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-blue-100 text-xs font-medium mb-1">Consultation with</p>
            <h1 className="text-xl font-bold truncate" style={{ fontFamily: 'var(--font-headline)' }}>
              Dr. {doctor?.full_name || 'Your Doctor'}
            </h1>
            <p className="text-blue-200 text-sm">{doctor?.specialization}</p>
            {doctor?.clinic_name && (
              <p className="text-blue-200 text-xs mt-0.5">{doctor.clinic_name}</p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1 bg-white/20 rounded-xl px-2 py-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-300" />
              <span className="text-[10px] font-semibold text-emerald-200">Confirmed</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-3">
          <div>
            <p className="text-blue-200 text-[10px] font-medium uppercase tracking-wider">Date</p>
            <p className="text-white text-sm font-semibold mt-0.5">{formatDate(session.started_at)}</p>
          </div>
          <div>
            <p className="text-blue-200 text-[10px] font-medium uppercase tracking-wider">Time</p>
            <p className="text-white text-sm font-semibold mt-0.5">{formatTime(session.started_at)}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Symptoms', value: issues.length, icon: Activity, color: 'amber' },
          { label: 'Diagnoses', value: diagnoses.length, icon: FileText, color: 'blue' },
          { label: 'Medicines', value: prescriptions.length, icon: Pill, color: 'emerald' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-${stat.color}-50 rounded-2xl p-4 text-center border border-${stat.color}-100`}>
            <stat.icon className={`h-5 w-5 text-${stat.color}-500 mx-auto mb-1`} />
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-[10px] text-gray-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
              activeTab === tab.key
                ? 'border-[#0050cb] text-[#0050cb]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-blue-100 text-[#0050cb]' : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <div className="space-y-6 animate-fade-in">
          {/* AI Patient Summary */}
          {(session.patient_summary || session.ai_summary) && (
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#0050cb]" />
                What Your Doctor Found
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {session.patient_summary || session.ai_summary}
              </p>
            </div>
          )}

          {/* Issues / Symptoms */}
          {issues.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Reported Symptoms
              </h2>
              <div className="flex flex-wrap gap-2">
                {issues.map((issue, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl text-sm font-medium bg-amber-50 text-amber-700 border border-amber-100"
                  >
                    {issue}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Diagnoses */}
          {diagnoses.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#0050cb]" />
                Diagnosis
              </h2>
              <div className="space-y-3">
                {diagnoses.map((diag: any, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-[#0050cb]">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{diag.condition}</p>
                      {diag.icd10 && (
                        <p className="text-xs text-gray-400 font-mono">ICD-10: {diag.icd10}</p>
                      )}
                    </div>
                    {diag.confidence && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        diag.confidence === 'high'
                          ? 'bg-emerald-100 text-emerald-700'
                          : diag.confidence === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {diag.confidence}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctor Notes */}
          {session.doctor_notes && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                Doctor's Notes
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {session.doctor_notes}
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              <Info className="h-3.5 w-3.5 inline mr-1 text-gray-400" />
              This summary was generated by AI based on your clinical session. Always follow your doctor's direct advice. For any concerns, contact your doctor or call emergency services.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'prescriptions' && (
        <div className="space-y-4 animate-fade-in">
          {prescriptions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
              <Pill className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No prescriptions from this session</p>
            </div>
          ) : (
            <>
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-700 font-medium">
                  These medicines have been added to your Medication Tracker automatically.
                </p>
              </div>

              {prescriptions.map((rx, i) => (
                <div key={rx.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Pill className="h-5 w-5 text-[#0050cb]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-900 text-base">{rx.name}</h3>
                        {rx.dosage && (
                          <span className="text-sm font-mono font-semibold text-[#0050cb] bg-blue-50 px-2 py-0.5 rounded-lg flex-shrink-0">
                            {rx.dosage}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                        {rx.when_to_take && rx.when_to_take.length > 0 && (
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">When</p>
                            <p className="text-sm text-gray-700 capitalize">{rx.when_to_take.join(' + ')}</p>
                          </div>
                        )}
                        {rx.duration_days && (
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Duration</p>
                            <p className="text-sm text-gray-700">{rx.duration_days} days</p>
                          </div>
                        )}
                        {rx.meal_relation && (
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Meal</p>
                            <p className="text-sm text-gray-700">{getMealLabel(rx.meal_relation)}</p>
                          </div>
                        )}
                        {rx.timing && rx.timing.length > 0 && (
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Timing</p>
                            <p className="text-sm text-gray-700">{rx.timing.join(', ')}</p>
                          </div>
                        )}
                      </div>

                      {rx.notes && (
                        <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                          <p className="text-xs text-amber-700">{rx.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Link
                href="/patient/medications"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0050cb] text-white text-sm font-semibold hover:bg-[#003d9e] transition-colors shadow-lg shadow-blue-500/20"
              >
                <Pill className="h-4 w-4" />
                View Medication Tracker
                <ChevronRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      )}

      {activeTab === 'referrals' && (
        <div className="space-y-4 animate-fade-in">
          {/* Referrals */}
          {referrals.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-[#0050cb]" />
                Tests & Referrals Ordered
              </h2>
              <div className="space-y-2">
                {referrals.map((ref, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0050cb] flex-shrink-0" />
                    <p className="text-sm text-gray-800">{ref}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lifestyle */}
          {lifestyle.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-400" />
                Lifestyle Recommendations
              </h2>
              <div className="space-y-3">
                {lifestyle.map((item: any, i) => (
                  <div key={i} className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                    {item.category && (
                      <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider mb-1">
                        {item.category}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {typeof item === 'string' ? item : item.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {referrals.length === 0 && lifestyle.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
              <ExternalLink className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No referrals or lifestyle advice from this session</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
