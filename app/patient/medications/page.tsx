'use client'

import { useEffect, useState } from 'react'
import {
  Pill, Clock, CheckCircle2, Flame, Trophy,
  Calendar, ChevronLeft, ChevronRight, AlertCircle, Info
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface MedSchedule {
  id: string
  medication_name: string
  dosage: string
  scheduled_time: string
  instructions: string
  status: string // 'pending', 'taken', 'missed'
}

export default function PatientMedicationsPage() {
  const supabase = createClient()
  const [meds, setMeds] = useState<MedSchedule[]>([])
  const [streak, setStreak] = useState({ current: 0, longest: 0, total_on_time: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [patientId, setPatientId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Generate week days
  const getWeekDays = () => {
    const days = []
    for (let i = -3; i <= 3; i++) {
      const d = new Date(selectedDate)
      d.setDate(d.getDate() + i)
      days.push(d)
    }
    return days
  }

  useEffect(() => {
    init()
  }, [selectedDate])

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
      await fetchStreak(profile.id)
      await fetchMeds(profile.id)
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
      // Mock for display if no data
      setStreak({ current: 5, longest: 14, total_on_time: 42 })
    }
  }

  const fetchMeds = async (pid: string) => {
    const dateStr = selectedDate.toISOString().split('T')[0]
    const { data, error }: { data: any, error: any } = await supabase
      .from('medication_schedule')
      .select('*')
      .eq('patient_id', pid)
      .eq('scheduled_date', dateStr)
      .order('scheduled_time', { ascending: true })

    if (!error && data && data.length > 0) {
      setMeds(data)
    } else {
      // Generate some mock meds for demonstration purposes if DB is empty for the day
      setMeds([
        { id: '1', medication_name: 'Amoxicillin', dosage: '500mg', scheduled_time: '08:00:00', instructions: 'After breakfast', status: 'taken' },
        { id: '2', medication_name: 'Vitamin D3', dosage: '1000 IU', scheduled_time: '13:00:00', instructions: 'With lunch', status: 'pending' },
        { id: '3', medication_name: 'Atorvastatin', dosage: '10mg', scheduled_time: '21:00:00', instructions: 'Before sleep', status: 'pending' },
      ])
    }
  }

  const handleTakeMed = async (id: string, currentStatus: string) => {
    if (currentStatus === 'taken') return
    
    // Optimistic UI update
    setMeds(prev => prev.map(m => m.id === id ? { ...m, status: 'taken' } : m))
    setStreak(prev => ({ ...prev, current: prev.current + 1, total_on_time: prev.total_on_time + 1 }))

    // Actual DB update if not mock data (len > 3)
    if (id.length > 5 && patientId) {
       await (supabase as any)
        .from('medication_schedule')
        .update({ status: 'taken', taken_at: new Date().toISOString(), is_on_time: true })
        .eq('id', id)

       // Also update streak
       await (supabase as any)
        .from('medication_streaks')
        .upsert({ 
          patient_id: patientId, 
          current_streak: streak.current + 1,
          total_on_time: streak.total_on_time + 1
        })
    }
  }

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':')
    const hour = parseInt(h, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${m} ${ampm}`
  }

  const isToday = (d: Date) => {
    const today = new Date()
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  }

  const isSameDay = (a: Date, b: Date) => a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()

  // Calculate discount progress (e.g. 10% off per 30 day streak max)
  const discountProgress = Math.min((streak.current / 30) * 100, 100)

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-headline)' }}>
            Medications
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track your daily prescriptions & earn rewards</p>
        </div>
      </div>

      {/* Gamification Banner */}
      <div className="bg-gradient-to-r from-orange-400 via-rose-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl shadow-rose-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
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
            <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${discountProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/50 to-white/0 animate-[shimmer_2s_infinite]" />
              </div>
            </div>
            <p className="text-[10px] text-white/70">Keep taking your meds on time to unlock discounts on your next consultation!</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
            <Trophy className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Longest Streak</p>
            <p className="text-xl font-bold text-gray-900">{streak.longest} Days</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total On Time</p>
            <p className="text-xl font-bold text-gray-900">{streak.total_on_time} Doses</p>
          </div>
        </div>
      </div>

      {/* Calendar Strip */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d) }}
              className="p-1 rounded bg-gray-50 hover:bg-gray-100 text-gray-600"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setSelectedDate(new Date())}
              className="text-xs font-semibold text-[#0050cb] px-2 hover:bg-blue-50 rounded"
            >
              Today
            </button>
            <button 
              onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d) }}
              className="p-1 rounded bg-gray-50 hover:bg-gray-100 text-gray-600"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="flex justify-between gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {getWeekDays().map((day) => {
            const selected = isSameDay(day, selectedDate)
            const today = isToday(day)
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center min-w-[3rem] py-2 px-1 rounded-xl transition-all ${
                  selected 
                    ? 'bg-[#0050cb] text-white shadow-md' 
                    : today 
                      ? 'bg-blue-50 text-[#0050cb] border border-blue-100' 
                      : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                <span className="text-[10px] font-medium uppercase mb-1">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span className="text-lg font-bold">{day.getDate()}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Daily Schedule */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-gray-900">
          {isToday(selectedDate) ? "Today's Schedule" : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
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
            <p className="text-sm font-medium text-gray-900">No medications scheduled.</p>
            <p className="text-xs text-gray-500 mt-1">Enjoy your day!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {meds.map((med) => {
              const isTaken = med.status === 'taken'
              
              return (
                <div 
                  key={med.id}
                  className={`relative overflow-hidden rounded-2xl border transition-all duration-300 p-5 flex items-center justify-between gap-4 ${
                    isTaken 
                      ? 'bg-gray-50 border-gray-200/60 opacity-70' 
                      : 'bg-white border-gray-100 shadow-sm hover:border-blue-100 hover:shadow-md'
                  }`}
                >
                  {isTaken && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-success/5 rounded-bl-full" />
                  )}
                  
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleTakeMed(med.id, med.status)}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                        isTaken 
                          ? 'bg-success border-success text-white' 
                          : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-success hover:text-success'
                      }`}
                    >
                      {isTaken ? <CheckCircle2 className="h-6 w-6" /> : <Pill className="h-5 w-5" />}
                    </button>
                    
                    <div>
                      <h4 className={`text-base font-bold transition-colors ${isTaken ? 'text-gray-500 line-through decoration-gray-300' : 'text-gray-900'}`}>
                        {med.medication_name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-semibold text-[#0050cb] bg-blue-50 px-2 py-0.5 rounded-md">
                          {med.dosage}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Info className="h-3 w-3" /> {med.instructions}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 justify-end mb-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {formatTime(med.scheduled_time)}
                    </div>
                    {isTaken ? (
                      <span className="text-[10px] font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">Taken</span>
                    ) : (
                      <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pending</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
