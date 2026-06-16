'use client'

import { useEffect, useState } from 'react'
import {
  Pill, CheckCircle2, Flame, Trophy,
  Calendar, LayoutGrid, List
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { MedicationCalendar } from '@/components/patient/medication-calendar'

type ViewMode = 'today' | 'weekly' | 'monthly'

interface MedSchedule {
  id: string
  medication_name: string
  dosage: string
  scheduled_time: string
  instructions: string
  status: string
  time_of_day?: string
}


export default function PatientMedicationsPage() {
  const supabase = createClient()
  const [meds, setMeds] = useState<MedSchedule[]>([])
  const [streak, setStreak] = useState({ current: 0, longest: 0, total_on_time: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [patientId, setPatientId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('today')

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoading(false); return }

    const { data: profile }: { data: any } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profile) {
      setPatientId(profile.id)
      await Promise.all([fetchStreak(profile.id), fetchTodayMeds(profile.id)])
    }
    setIsLoading(false)
  }

  const fetchStreak = async (pid: string) => {
    const { data }: { data: any } = await supabase
      .from('medication_streaks')
      .select('*')
      .eq('patient_id', pid)
      .maybeSingle()

    if (data) {
      setStreak({ current: data.current_streak, longest: data.longest_streak, total_on_time: data.total_on_time })
    } else {
      setStreak({ current: 5, longest: 14, total_on_time: 42 })
    }
  }

  const fetchTodayMeds = async (pid: string) => {
    const dateStr = new Date().toISOString().split('T')[0]
    const { data, error }: { data: any, error: any } = await supabase
      .from('medication_schedule')
      .select('*')
      .eq('patient_id', pid)
      .eq('scheduled_date', dateStr)
      .order('scheduled_time', { ascending: true })

    if (!error && data && data.length > 0) {
      setMeds(data)
    } else {
      if (error) console.error('Failed to fetch medication_schedule:', error)
      setMeds([])
    }
  }

  const handleTakeMed = async (id: string, currentStatus: string) => {
    if (currentStatus === 'taken') return
    setMeds(prev => prev.map(m => m.id === id ? { ...m, status: 'taken' } : m))
    setStreak(prev => ({ ...prev, current: prev.current + 1, total_on_time: prev.total_on_time + 1 }))
    if (id.length > 5 && patientId) {
      await (supabase as any)
        .from('medication_schedule')
        .update({ status: 'taken', taken_at: new Date().toISOString(), is_on_time: true })
        .eq('id', id)
    }
  }

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':')
    const hour = parseInt(h, 10)
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }

  const discountProgress = Math.min((streak.current / 30) * 100, 100)
  const takenToday = meds.filter(m => m.status === 'taken').length
  const totalToday = meds.length

  const VIEW_TABS: { key: ViewMode; label: string }[] = [
    { key: 'today',   label: 'Day' },
    { key: 'weekly',  label: 'Week' },
    { key: 'monthly', label: 'Month' },
  ]

  const totalTasks = meds.length
  const completedTasks = meds.filter(m => m.status === 'taken').length
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  
  // Group meds by time of day
  const groupedMeds: Record<string, MedSchedule[]> = {}
  meds.forEach(med => {
    const timeOfDay = med.time_of_day || 'morning'
    if (!groupedMeds[timeOfDay]) groupedMeds[timeOfDay] = []
    groupedMeds[timeOfDay].push(med)
  })

  // Format time for timeline
  const getSlotTime = (slot: string) => {
    switch (slot) {
      case 'morning': return '8:00 AM'
      case 'afternoon': return '1:00 PM'
      case 'evening': return '8:00 PM'
      case 'night': return '10:00 PM'
      default: return ''
    }
  }

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Medication Schedule
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track your daily adherence and unlock rewards.</p>
        </div>

        {/* View toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 self-start">
          {VIEW_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                viewMode === key
                  ? 'bg-white text-[#0050cb] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TODAY VIEW ── */}
      {viewMode === 'today' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 px-2">
          
          {/* Main Tasks Column */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
              <h2 className="text-xl font-bold text-gray-900">Today's Tasks</h2>
              <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-20 bg-gray-100 rounded-lg" />
                <div className="h-20 bg-gray-100 rounded-lg" />
              </div>
            ) : meds.length === 0 ? (
              <div className="text-center py-10">
                <Pill className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No medications scheduled for today.</p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-10 before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {['morning', 'afternoon', 'evening', 'night', 'as_needed'].map(slot => {
                  const slotMeds = groupedMeds[slot]
                  if (!slotMeds || slotMeds.length === 0) return null
                  const isPast = slot === 'morning' && new Date().getHours() > 12

                  return (
                    <div key={slot} className="relative">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[29px] top-1 bg-white p-1">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 ${isPast ? 'border-gray-400' : 'border-[#0050cb]'}`} />
                      </div>
                      
                      <h3 className="text-xs font-bold text-[#0050cb] uppercase tracking-wider mb-4 flex items-center gap-2">
                        {slot.replace('_', ' ')} ({getSlotTime(slot)})
                      </h3>

                      <div className="space-y-3">
                        {slotMeds.map(med => {
                          const isTaken = med.status === 'taken'
                          return (
                            <div key={med.id} className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 flex items-start gap-4 hover:border-[#0050cb]/30 transition-all">
                              <button
                                onClick={() => handleTakeMed(med.id, med.status)}
                                className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                                  isTaken ? 'bg-[#0050cb] border-[#0050cb] text-white' : 'border-gray-300 bg-gray-50 text-transparent hover:border-[#0050cb]'
                                }`}
                              >
                                <svg viewBox="0 0 14 14" fill="none" className="w-4 h-4"><path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/></svg>
                              </button>
                              
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <h4 className={`font-bold text-base ${isTaken ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                    {med.medication_name}
                                  </h4>
                                  {med.dosage && (
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold ml-2 flex-shrink-0">
                                      {med.dosage}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 font-medium">
                                  <span className="material-symbols-outlined text-[14px]">restaurant</span>
                                  {med.instructions || 'Take as directed'}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar Columns */}
          <div className="space-y-6">
            
            {/* Adherence Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Daily Adherence</h3>
              
              <div className="relative w-32 h-32 mx-auto mb-6">
                {/* SVG Progress Circle */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                  <circle 
                    cx="50" cy="50" r="45" fill="none" stroke="#0050cb" strokeWidth="10"
                    strokeDasharray={`${progressPercentage * 2.827} 282.7`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-black text-gray-900">{completedTasks}</span>
                    <span className="text-xl font-bold text-gray-400">/{totalTasks}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm font-medium text-gray-600 leading-relaxed">
                {progressPercentage === 100 
                  ? "Great job! You've completed all your tasks for today."
                  : "You're on track! Complete your evening medication to reach 100%."}
              </p>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0050cb] flex items-center justify-center font-bold font-serif italic">
                  i
                </div>
                <h3 className="text-base font-bold text-gray-900">Did you know?</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Consistent adherence improves long-term outcomes by 40%. Keep up the good work to maintain your streak and earn healthcare rewards.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ── WEEKLY / MONTHLY CALENDAR VIEWS ── */}
      {(viewMode === 'weekly' || viewMode === 'monthly') && patientId && (
        <MedicationCalendar patientId={patientId} view={viewMode} />
      )}

      {(viewMode === 'weekly' || viewMode === 'monthly') && !patientId && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="w-6 h-6 border-2 border-[#0050cb]/20 border-t-[#0050cb] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading schedule...</p>
        </div>
      )}
    </div>
  )
}
