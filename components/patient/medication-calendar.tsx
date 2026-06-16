'use client'

import { useState, useEffect } from 'react'
import {
  ChevronLeft, ChevronRight, Pill, Clock,
  CheckCircle2, Circle, Sun, Sunset, Moon, Coffee,
  Calendar
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface MedScheduleEntry {
  id: string
  medication_name: string
  dosage: string | null
  scheduled_date: string
  scheduled_time: string
  time_of_day: string
  instructions: string | null
  status: 'pending' | 'taken' | 'missed' | 'skipped'
}

interface Props {
  patientId: string
  view: 'weekly' | 'monthly'
}

const TIME_OF_DAY_CONFIG = {
  morning:   { label: 'Morning',   icon: Sun,     color: 'text-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  afternoon: { label: 'Afternoon', icon: Coffee,   color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
  evening:   { label: 'Evening',   icon: Sunset,   color: 'text-rose-500',   bg: 'bg-rose-50',   border: 'border-rose-200' },
  night:     { label: 'Night',     icon: Moon,     color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  as_needed: { label: 'As Needed', icon: Pill,     color: 'text-gray-500',   bg: 'bg-gray-50',   border: 'border-gray-200' },
}

// Status dot colours used in calendar cells
const STATUS_DOT_COLOR: Record<string, string> = {
  taken:   'bg-emerald-500',
  missed:  'bg-red-400',
  skipped: 'bg-gray-300',
  pending: 'bg-blue-300',
}

function formatDateKey(d: Date): string {
  return d.toISOString().split('T')[0]
}

export function MedicationCalendar({ patientId, view }: Props) {
  const supabase = createClient()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [scheduleMap, setScheduleMap] = useState<Record<string, MedScheduleEntry[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string>(formatDateKey(new Date()))
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // ── Date ranges ─────────────────────────────────────────────────────────────
  const getWeekDays = (): Date[] => {
    const start = new Date(currentDate)
    // Start from Monday of the week
    const dayOfWeek = start.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    start.setDate(start.getDate() + diff)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }

  const getMonthDays = (): (Date | null)[] => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = (firstDay.getDay() + 6) % 7 // Monday start
    const cells: (Date | null)[] = Array(startPadding).fill(null)
    for (let d = 1; d <= lastDay.getDate(); d++) {
      cells.push(new Date(year, month, d))
    }
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }

  // ── Fetch data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchSchedule()
  }, [currentDate, view])

  const fetchSchedule = async () => {
    setIsLoading(true)
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    let startDate: string, endDate: string

    if (view === 'weekly') {
      const days = getWeekDays()
      startDate = formatDateKey(days[0])
      endDate = formatDateKey(days[6])
    } else {
      startDate = formatDateKey(new Date(year, month, 1))
      endDate = formatDateKey(new Date(year, month + 1, 0))
    }

    const { data, error }: { data: any, error: any } = await supabase
      .from('medication_schedule')
      .select('*')
      .eq('patient_id', patientId)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .order('scheduled_time', { ascending: true })

    if (!error && data) {
      const map: Record<string, MedScheduleEntry[]> = {}
      for (const entry of data) {
        if (!map[entry.scheduled_date]) map[entry.scheduled_date] = []
        map[entry.scheduled_date].push(entry)
      }
      setScheduleMap(map)
    }
    setIsLoading(false)
  }

  // ── Mark taken/missed ────────────────────────────────────────────────────────
  const markStatus = async (id: string, status: 'taken' | 'pending') => {
    setUpdatingId(id)
    await (supabase as any)
      .from('medication_schedule')
      .update({ status, taken_at: status === 'taken' ? new Date().toISOString() : null })
      .eq('id', id)

    // Optimistic update
    setScheduleMap(prev => {
      const next = { ...prev }
      for (const key of Object.keys(next)) {
        next[key] = next[key].map(e => e.id === id ? { ...e, status } : e)
      }
      return next
    })
    setUpdatingId(null)
  }

  const navigate = (dir: 1 | -1) => {
    const d = new Date(currentDate)
    if (view === 'weekly') {
      d.setDate(d.getDate() + dir * 7)
    } else {
      d.setMonth(d.getMonth() + dir)
    }
    setCurrentDate(d)
  }

  const isToday = (d: Date) => formatDateKey(d) === formatDateKey(new Date())
  const isSelected = (d: Date) => formatDateKey(d) === selectedDay

  // ── Header label ─────────────────────────────────────────────────────────────
  const headerLabel = view === 'monthly'
    ? currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : (() => {
        const days = getWeekDays()
        return `${days[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${days[6].toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
      })()

  // ── Weekly view ──────────────────────────────────────────────────────────────
  if (view === 'weekly') {
    const days = getWeekDays()
    const selectedDayMeds = scheduleMap[selectedDay] || []

    return (
      <div className="space-y-8">
        {/* Day strip container */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm overflow-x-auto">
          <div className="flex min-w-[500px] justify-between">

            {days.map((day) => {
              const key = formatDateKey(day)
              const meds = scheduleMap[key] || []
              const takenCount = meds.filter(m => m.status === 'taken').length
              const total = meds.length
              const isSelectedDay = isSelected(day)
              
              // Normalize today logic for date boundary comparison
              const todayStr = formatDateKey(new Date())
              const isFuture = key > todayStr

              let progressColor = 'stroke-blue-500'
              let bgColor = 'bg-blue-50'
              
              if (total > 0 && takenCount === total) {
                progressColor = 'stroke-emerald-400'
                bgColor = 'bg-emerald-50'
              }

              const progress = total > 0 ? (takenCount / total) * 100 : 0

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(key)}
                  className={`flex flex-col items-center py-4 px-2 w-[14%] rounded-2xl transition-all ${
                    isSelectedDay
                      ? 'bg-blue-50/50 border border-blue-200 shadow-sm'
                      : 'hover:bg-gray-50 border border-transparent text-gray-700'
                  }`}
                >
                  <span className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isSelectedDay ? 'text-gray-900' : 'text-gray-400'}`}>
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className={`text-xl font-bold mb-4 ${isSelectedDay ? 'text-gray-900' : 'text-gray-700'}`}>
                    {day.getDate()}
                  </span>

                  {/* Ring / Icon */}
                  <div className="relative w-12 h-12 flex items-center justify-center mb-2">
                    {isFuture ? (
                      <div className="w-10 h-10 rounded-full border-[3px] border-gray-200 flex items-center justify-center bg-gray-50">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-gray-400" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                      </div>
                    ) : total > 0 && takenCount === total ? (
                      <div className="w-10 h-10 rounded-full border-[3px] border-emerald-400 flex items-center justify-center bg-emerald-50 text-emerald-500">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ) : (
                      <>
                        <svg className="w-12 h-12 -rotate-90 absolute inset-0" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-100" strokeWidth="3" />
                          <circle 
                            cx="18" cy="18" r="16" fill="none" 
                            className={progressColor} 
                            strokeWidth="3"
                            strokeDasharray={`${progress * 1.005} 100.5`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="text-lg font-bold text-[#0050cb] z-10">{takenCount}</span>
                      </>
                    )}
                  </div>

                  <span className={`text-[10px] font-bold ${isSelectedDay ? 'text-[#0050cb]' : 'text-gray-400'}`}>
                    {isSelectedDay && total > 0 ? `${takenCount}/${total} Tasks` : `${takenCount}/${total}`}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Day Schedule */}
        <div className="space-y-10 pl-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#0050cb]/20 border-t-[#0050cb] rounded-full animate-spin" />
            </div>
          ) : (
            Object.entries(TIME_OF_DAY_CONFIG).map(([slot, config]) => {
              const slotMeds = selectedDayMeds.filter(m => m.time_of_day === slot)
              // If there are no meds and it's not a primary slot, skip. But show empty state for evening/night etc if needed.
              // To match design exactly, we show primary slots even if empty.
              if (slot === 'as_needed' && slotMeds.length === 0) return null
              
              const Icon = config.icon

              return (
                <div key={slot} className="relative">
                  {/* Section Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shadow-sm border border-gray-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 capitalize tracking-tight">{slot.replace('_', ' ')}</h3>
                    <div className="flex-1 h-px bg-gray-200 ml-2" />
                  </div>

                  {slotMeds.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed ml-2">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="text-sm font-bold text-gray-900">No medications scheduled</p>
                      <p className="text-xs text-gray-500 mt-1">You're all clear for this {slot}. Enjoy your rest!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {slotMeds.map((med) => {
                        const isTaken = med.status === 'taken'
                        const isFuture = formatDateKey(new Date()) < selectedDay

                        let cardBorder = 'border-l-4 border-l-blue-500 border-gray-200 bg-blue-50/20'
                        let iconBg = 'bg-blue-100 text-[#0050cb]'
                        
                        if (isTaken) {
                          cardBorder = 'border-l-4 border-l-emerald-500 border-gray-100 bg-white'
                          iconBg = 'bg-emerald-100 text-emerald-600'
                        } else if (isFuture) {
                          cardBorder = 'border-l-4 border-l-gray-300 border-gray-100 bg-gray-50/50'
                          iconBg = 'bg-gray-200 text-gray-500'
                        }

                        return (
                          <div key={med.id} className={`flex items-center justify-between gap-4 rounded-xl p-4 border shadow-sm transition-all ${cardBorder}`}>
                            
                            <div className="flex items-center gap-4">
                              {/* Left Icon */}
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                                {isTaken ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M19 5L9 15L5 11" strokeLinecap="round" strokeLinejoin="round"/></svg> : <Pill className="h-5 w-5" />}
                              </div>
                              
                              {/* Content */}
                              <div>
                                <p className={`font-bold text-base ${isTaken ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {med.medication_name}
                                </p>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5 font-medium">
                                  {med.dosage && <span>{med.dosage}</span>}
                                  {med.dosage && med.instructions && <span>•</span>}
                                  {med.instructions && <span>{med.instructions}</span>}
                                </div>
                              </div>
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-3">
                              {isTaken && (
                                <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Reward
                                </span>
                              )}
                              
                              <button
                                onClick={() => markStatus(med.id, med.status === 'taken' ? 'pending' : 'taken')}
                                disabled={updatingId === med.id}
                                className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                  isTaken 
                                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                                    : 'border-gray-400 bg-white text-transparent hover:border-[#0050cb]'
                                }`}
                              >
                                <svg viewBox="0 0 14 14" fill="none" className="w-4 h-4"><path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/></svg>
                              </button>
                            </div>
                            
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  // ── Monthly view ─────────────────────────────────────────────────────────────
  const monthCells = getMonthDays()

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          </button>
          <p className="text-sm font-semibold text-gray-700">{headerLabel}</p>
          <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="text-center text-[9px] text-gray-400 font-semibold uppercase pb-1">{d}</div>
          ))}
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-7 gap-1">
          {monthCells.map((day, i) => {
            if (!day) return <div key={i} />
            const key = formatDateKey(day)
            const meds = scheduleMap[key] || []
            const takenCount = meds.filter(m => m.status === 'taken').length
            const totalCount = meds.length
            const hasMissed = meds.some(m => m.status === 'missed')

            return (
              <button
                key={key}
                onClick={() => { setSelectedDay(key); }}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl p-1 transition-all text-center min-h-[40px] ${
                  isSelected(day)
                    ? 'bg-[#0050cb] text-white shadow-md'
                    : isToday(day)
                      ? 'bg-blue-50 text-[#0050cb] border border-blue-200'
                      : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-xs font-bold leading-tight">{day.getDate()}</span>
                {totalCount > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {[...Array(Math.min(totalCount, 3))].map((_, di) => (
                      <div
                        key={di}
                        className={`w-1 h-1 rounded-full ${
                          di < takenCount
                            ? isSelected(day) ? 'bg-emerald-300' : 'bg-emerald-500'
                            : hasMissed
                              ? isSelected(day) ? 'bg-red-300' : 'bg-red-400'
                              : isSelected(day) ? 'bg-white/50' : 'bg-blue-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day detail */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">
          {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h3>
        {(scheduleMap[selectedDay] || []).length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-sm text-gray-500">No medications scheduled for this day</p>
          </div>
        ) : (
          (scheduleMap[selectedDay] || []).map((med) => (
            <div key={med.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
              <button
                onClick={() => markStatus(med.id, med.status === 'taken' ? 'pending' : 'taken')}
                disabled={updatingId === med.id}
                className="flex-shrink-0 hover:scale-110 transition-all"
              >
                {med.status === 'taken' ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-300" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${med.status === 'taken' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  {med.medication_name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                  {med.dosage && <span className="font-mono">{med.dosage}</span>}
                  <span className="capitalize">{med.time_of_day?.replace('_', ' ')}</span>
                  {med.scheduled_time && <span>• {med.scheduled_time}</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
