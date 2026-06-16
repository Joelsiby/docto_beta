'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Activity, Calendar, Clock, FileText, 
  MessageSquare, ArrowRight, CheckCircle2, Sparkles,
  ArrowUpRight, ShieldAlert, Pill
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DashboardData {
  patientId: string
  fullName: string
  streak: number
  upcomingAppointments: any[]
  healthReports: any[]
  meds: any[]
}

export default function PatientDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoading(false); return }

    // 1. Get Patient Profile
    const { data: profile }: { data: any } = await supabase
      .from('patient_profiles')
      .select('id, full_name')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile) { setIsLoading(false); return }

    const patientId = profile.id
    const todayStr = new Date().toISOString().split('T')[0]

    // 2. Get Streak
    const { data: streakData }: { data: any } = await supabase
      .from('medication_streaks')
      .select('current_streak')
      .eq('patient_id', patientId)
      .maybeSingle()
    
    const streak = streakData?.current_streak || 0

    // 3. Get Today's Meds
    const { data: medsData }: { data: any } = await supabase
      .from('medication_schedule')
      .select('*')
      .eq('patient_id', patientId)
      .eq('scheduled_date', todayStr)
      .order('scheduled_time', { ascending: true })

    // 4. Get Upcoming Appointments
    const { data: apptData }: { data: any } = await supabase
      .from('appointments')
      .select('*, doctor_profiles(full_name, specialization)')
      .eq('patient_id', patientId)
      .eq('status', 'scheduled')
      .gte('appointment_date', todayStr)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })
      .limit(3)

    // 5. Get Recent Health Reports
    const { data: reportsData }: { data: any } = await supabase
      .from('health_reports')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(3)

    setData({
      patientId,
      fullName: profile.full_name,
      streak,
      meds: medsData || [],
      upcomingAppointments: apptData || [],
      healthReports: reportsData || [],
    })
    setIsLoading(false)
  }

  const handleTakeMed = async (medId: string, currentStatus: string) => {
    if (currentStatus === 'taken' || !data) return
    
    // Optimistic UI update
    setData({
      ...data,
      meds: data.meds.map(m => m.id === medId ? { ...m, status: 'taken' } : m),
      streak: data.streak + 1
    })

    await (supabase as any)
      .from('medication_schedule')
      .update({ status: 'taken', taken_at: new Date().toISOString(), is_on_time: true })
      .eq('id', medId)

    await (supabase as any)
      .from('medication_streaks')
      .upsert({ 
        patient_id: data.patientId, 
        current_streak: data.streak + 1 
      })
  }

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':')
    const hour = parseInt(h, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${m} ${ampm}`
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-[#0050cb]/20 border-t-[#0050cb] rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const pendingMedsCount = data.meds.filter(m => m.status !== 'taken').length

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Welcome & Streak Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-blue-50 via-white to-white p-6 rounded-3xl border border-blue-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2" style={{ fontFamily: 'var(--font-headline)' }}>
            Namaste, {data.fullName.split(' ')[0]} <Sparkles className="h-6 w-6 text-[#0050cb] animate-pulse" />
          </h1>
          <p className="text-sm text-gray-600">
            {pendingMedsCount > 0 
              ? `You have ${pendingMedsCount} medication${pendingMedsCount > 1 ? 's' : ''} left for today.` 
              : "You're all caught up on your medications for today!"}
          </p>
        </div>
        

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle Column: Meds Tracker & Appointments */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Daily Meds Checklist */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#0050cb]" /> Today's Medications
                </h2>
                <p className="text-xs text-gray-500 mt-1">Log your dosage to keep your streak going</p>
              </div>
              <Link href="/patient/medications" className="text-xs font-semibold text-[#0050cb] hover:underline flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full">
                View Schedule <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {data.meds.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                <Pill className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-600">No medications for today</p>
                <p className="text-xs text-gray-400">Enjoy your day!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.meds.map(med => {
                  const isTaken = med.status === 'taken'
                  return (
                    <div key={med.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isTaken ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200 hover:border-[#0050cb]/30 shadow-sm'
                    }`}>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleTakeMed(med.id, med.status)}
                          className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                            isTaken 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'border-gray-200 bg-gray-50 hover:border-emerald-500 hover:text-emerald-500 text-gray-300'
                          }`}
                        >
                          {isTaken ? <CheckCircle2 className="h-5 w-5" /> : <Pill className="h-5 w-5" />}
                        </button>
                        <div>
                          <h3 className={`font-bold text-sm ${isTaken ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {med.medication_name} <span className="text-xs font-medium text-[#0050cb] bg-blue-50 px-1.5 py-0.5 rounded ml-1 no-underline">{med.dosage}</span>
                          </h3>
                          <p className={`text-xs mt-0.5 ${isTaken ? 'text-gray-400' : 'text-gray-500'}`}>{med.instructions}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                        <Clock className="h-3.5 w-3.5 text-gray-500" /> {formatTime(med.scheduled_time)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Upcoming Consultations */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#0050cb]" /> Upcoming Appointments
                </h2>
                <p className="text-xs text-gray-500 mt-1">Manage your booked slots and sessions</p>
              </div>
              <Link href="/patient/appointments" className="text-xs font-semibold text-[#0050cb] hover:underline flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {data.upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-600">No upcoming appointments</p>
                <Link href="/patient/doctors" className="text-xs text-[#0050cb] hover:underline mt-1 inline-block">Book a consultation</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.upcomingAppointments.map((appt) => (
                  <div key={appt.id} className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-[#0050cb]/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0050cb] flex items-center justify-center border border-blue-100">
                        <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">Dr. {appt.doctor_profiles?.full_name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{appt.doctor_profiles?.specialization} • {appt.type === 'teleconsultation' ? 'Video Consult' : 'Clinic Visit'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 border-gray-100 pt-3 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-bold text-gray-900">{formatDate(appt.appointment_date)}</p>
                        <p className="text-xs text-gray-500 font-medium">{formatTime(appt.appointment_time)}</p>
                      </div>
                      <button className="px-4 py-2 bg-[#0050cb] text-white hover:bg-[#003d9e] rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all">
                        Join Call <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: AI Reports & Quick Chat */}
        <div className="space-y-6">
          
          {/* Health Report Analysis */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-[#0050cb]" /> AI Report Analysis
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Upload blood reports or diagnostic tests to view AI insights instantly
            </p>



            <div className="space-y-3">
              {data.healthReports.map((report) => (
                <Link key={report.id} href={`/patient/reports/${report.id}`} className="block p-3 rounded-xl border border-gray-100 bg-white hover:border-[#0050cb]/30 transition-all shadow-sm group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center border border-gray-100 group-hover:bg-blue-50 group-hover:text-[#0050cb] group-hover:border-blue-100 transition-colors flex-shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-xs text-gray-900 truncate">{report.report_name}</h3>
                      <p className="text-[10px] text-gray-500 mt-0.5">{formatDate(report.created_at)} • {report.status === 'analyzed' ? 'Analyzed' : 'Processing'}</p>
                    </div>
                    {report.flagged_parameters && report.flagged_parameters.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold bg-red-50 px-2 py-1 rounded-md border border-red-100 flex-shrink-0">
                        <ShieldAlert className="h-3 w-3" />
                        {report.flagged_parameters.length} Flagged
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>



          </div>

          {/* Docto Bot AI Assistant */}
          <div className="bg-gradient-to-br from-[#0050cb] via-[#0066ff] to-[#3d8bfd] rounded-3xl p-6 shadow-xl shadow-blue-500/20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-headline)' }}>Docto Bot AI</h2>
                  <p className="text-xs text-blue-100 font-medium">Your 24/7 Health Assistant</p>
                </div>
              </div>
              <p className="text-xs text-blue-100 mb-6 leading-relaxed opacity-90">
                "What did the doctor mean by taking Atorvastatin before sleep?" or "Explain my lab report findings in simple language."
              </p>
              <Link 
                href="/patient/chat" 
                className="w-full py-3 px-4 bg-white text-[#0050cb] hover:bg-blue-50 text-center font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                Start Conversation <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
