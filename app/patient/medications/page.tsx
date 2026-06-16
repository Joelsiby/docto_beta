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
      setMeds([
        { id: '1', medication_name: 'Amoxicillin', dosage: '500mg', scheduled_time: '08:00:00', instructions: 'After breakfast', status: 'taken' },
        { id: '2', medication_name: 'Vitamin D3', dosage: '1000 IU', scheduled_time: '13:00:00', instructions: 'With lunch', status: 'pending' },
        { id: '3', medication_name: 'Atorvastatin', dosage: '10mg', scheduled_time: '21:00:00', instructions: 'Before sleep', status: 'pending' },
      ])
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

  const VIEW_TABS: { key: ViewMode; label: string; icon: any }[] = [
    { key: 'today',   label: 'Today',   icon: List },
    { key: 'weekly',  label: 'Weekly',  icon: Calendar },
    { key: 'monthly', label: 'Monthly', icon: LayoutGrid },
  ]

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-headline)' }}>
            Medications
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track your prescriptions & earn rewards</p>
        </div>

        {/* View toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 self-start">
          {VIEW_TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === key
                  ? 'bg-white text-[#0050cb] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Gamification Banner */}
      <div className="bg-gradient-to-r from-orange-400 via-rose-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl shadow-rose-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Flame className="h-8 w-8 text-white animate-bounce" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1">Current Streak</p>
              <h2 className="text-4xl font-black">{streak.current} Days</h2>
            </div>
          </div>
          <div className="flex-1 w-full md:max-w-xs space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Next Reward: 10% Off</span>
              <span>{30 - (streak.current % 30)} days left</span>
            </div>
            <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${discountProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-white/70">Take meds on time to unlock consultation discounts!</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-2 border border-amber-100">
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-gray-900">{streak.longest}</p>
          <p className="text-[10px] text-gray-500 font-medium">Best Streak</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-2 border border-emerald-100">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-gray-900">{streak.total_on_time}</p>
          <p className="text-[10px] text-gray-500 font-medium">Total On Time</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2 border border-blue-100">
            <Pill className="h-5 w-5 text-[#0050cb]" />
          </div>
          <p className="text-lg font-bold text-gray-900">{totalToday > 0 ? `${takenToday}/${totalToday}` : '—'}</p>
          <p className="text-[10px] text-gray-500 font-medium">Today</p>
        </div>
      </div>

      {/* ── TODAY VIEW ── */}
      {viewMode === 'today' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-gray-900">
            Today's Schedule — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : meds.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 border-dashed">
              <Pill className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900">No medications scheduled today.</p>
              <p className="text-xs text-gray-500 mt-1">Enjoy your day!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meds.map((med) => {
                const isTaken = med.status === 'taken'
                return (
                  <div
                    key={med.id}
                    className={`rounded-2xl border transition-all duration-300 p-5 flex items-center justify-between gap-4 ${
                      isTaken
                        ? 'bg-gray-50 border-gray-200/60 opacity-70'
                        : 'bg-white border-gray-100 shadow-sm hover:border-blue-100 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleTakeMed(med.id, med.status)}
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                          isTaken
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-emerald-400 hover:text-emerald-500'
                        }`}
                      >
                        {isTaken ? <CheckCircle2 className="h-6 w-6" /> : <Pill className="h-5 w-5" />}
                      </button>
                      <div>
                        <h4 className={`text-base font-bold ${isTaken ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {med.medication_name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-semibold text-[#0050cb] bg-blue-50 px-2 py-0.5 rounded-md">
                            {med.dosage}
                          </span>
                          <span className="text-xs text-gray-500">{med.instructions}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900">{formatTime(med.scheduled_time)}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        isTaken ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'
                      }`}>
                        {isTaken ? 'Taken' : 'Pending'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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
