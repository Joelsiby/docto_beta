'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Star, Clock, Video, Building2, MapPin,
  Calendar, CheckCircle2, ChevronLeft, ChevronRight, Sparkles, GraduationCap, Shield, Phone
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DoctorProfile {
  id: string
  full_name: string
  specialization: string
  qualifications: string[] | null
  experience_years: number | null
  bio: string | null
  profile_image_url: string | null
  clinic_name: string | null
  consultation_fee: number | null
  teleconsultation: boolean
  clinic_visit: boolean
  appointment_duration: number | null
  working_hours: any | null
}

type BookingStep = 'profile' | 'slot' | 'triage' | 'confirm'

export default function DoctorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const doctorId = params.doctorId as string
  const supabase = createClient()

  const [doctor, setDoctor] = useState<DoctorProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [step, setStep] = useState<BookingStep>('profile')
  const [patientProfileId, setPatientProfileId] = useState<string | null>(null)

  // Booking state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [consultType, setConsultType] = useState<'teleconsultation' | 'clinic_visit'>('teleconsultation')
  const [triageResponses, setTriageResponses] = useState({
    chiefComplaint: '',
    duration: '',
    severity: 'moderate',
    additionalNotes: '',
  })
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // Calendar week
  const [weekOffset, setWeekOffset] = useState(0)
  const getWeekDays = () => {
    const start = new Date()
    start.setDate(start.getDate() + weekOffset * 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      return d
    })
  }
  const weekDays = getWeekDays()

  // Time slots
  const generateSlots = () => {
    const slots: string[] = []
    for (let h = 9; h <= 17; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`)
      if (h < 17) slots.push(`${h.toString().padStart(2, '0')}:30`)
    }
    return slots
  }
  const timeSlots = generateSlots()

  useEffect(() => {
    fetchDoctor()
    fetchPatientProfile()
  }, [])

  const fetchDoctor = async () => {
    setIsLoading(true)
    const { data, error }: { data: any, error: any } = await supabase
      .from('doctor_profiles')
      .select('*')
      .eq('id', doctorId)
      .maybeSingle()
    if (data) setDoctor(data)
    setIsLoading(false)
  }

  const fetchPatientProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data }: { data: any } = await supabase
        .from('patient_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      if (data) setPatientProfileId(data.id)
    }
  }

  const handleBookAppointment = async () => {
    if (!patientProfileId || !selectedSlot || !doctor) {
      alert('Please log in as a patient and select a time slot.')
      return
    }
    setIsBooking(true)
    try {
      const appointmentDate = selectedDate.toISOString().split('T')[0]
      const { error }: { data: any, error: any } = await supabase
        .from('appointments')
        .insert({
          doctor_id: doctorId,
          patient_id: patientProfileId,
          appointment_date: appointmentDate,
          appointment_time: selectedSlot,
          status: 'scheduled',
          type: consultType === 'teleconsultation' ? 'teleconsultation' : 'clinic_visit',
          notes: JSON.stringify({
            triage: triageResponses,
            consultation_type: consultType,
          }),
        } as any)
      if (error) throw error
      setBookingSuccess(true)
      setStep('confirm')
    } catch (err: any) {
      console.error('Booking error:', err)
      alert('Failed to book appointment: ' + (err?.message || err))
    } finally {
      setIsBooking(false)
    }
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const isToday = (d: Date) => {
    const today = new Date()
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  }
  const isSameDay = (a: Date, b: Date) => a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()

  // ── Loading ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[#f5f5f7]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-[#0050cb]/20 border-t-[#0050cb] rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading profile…</p>
        </div>
      </div>
    )
  }

  // ── Not found ────────────────────────────────────────────────
  if (!doctor) {
    return (
      <div className="flex items-center justify-center min-h-dvh px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👨‍⚕️</span>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">Doctor not found</h2>
          <p className="text-sm text-gray-500 mb-4">This profile may no longer be available.</p>
          <Link href="/patient/doctors" className="inline-flex items-center gap-1.5 text-sm text-[#0050cb] font-semibold">
            <ChevronLeft className="h-4 w-4" /> Back to Doctors
          </Link>
        </div>
      </div>
    )
  }

  // ── Booking success ──────────────────────────────────────────
  if (step === 'confirm' && bookingSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-6 animate-fade-in">
        <div className="text-center w-full max-w-sm">
          <div className="w-24 h-24 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
            All Booked! 🎉
          </h2>
          <p className="text-gray-500 text-sm mb-1">Your appointment with</p>
          <p className="font-bold text-gray-900 mb-4">Dr. {doctor.full_name}</p>
          <div className="inline-flex items-center gap-2 bg-blue-50 rounded-2xl px-5 py-3 mb-8 border border-blue-100">
            <Calendar className="h-4 w-4 text-[#0050cb]" />
            <span className="text-sm font-semibold text-[#0050cb]">
              {formatDate(selectedDate)} · {selectedSlot}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/patient/appointments"
              className="w-full py-4 rounded-2xl bg-[#0050cb] text-white font-bold text-[15px] shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform text-center"
            >
              View My Appointments
            </Link>
            <Link
              href="/patient/doctors"
              className="w-full py-4 rounded-2xl bg-gray-100 text-gray-700 font-semibold text-[15px] active:scale-[0.98] transition-transform text-center"
            >
              Browse More Doctors
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── STEP LABELS ──────────────────────────────────────────────
  const STEPS: BookingStep[] = ['slot', 'triage', 'confirm']
  const stepLabels: Record<string, string> = { slot: 'Date & Time', triage: 'Pre-visit Form', confirm: 'Review' }

  // ────────────────────────────────────────────────────────────
  //  MAIN RENDER
  // ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-[#f5f5f7] pb-32">

      {/* ── Sticky Top Navigation Bar ── */}
      <div className="sticky top-0 z-20 bg-[#f5f5f7]/90 backdrop-blur-xl border-b border-black/[0.05] px-4 h-12 flex items-center justify-between">
        <button
          onClick={() => step === 'profile' ? router.push('/patient/doctors') : setStep('profile')}
          className="flex items-center gap-0.5 text-[15px] text-[#0050cb] font-semibold active:opacity-60 transition-opacity -ml-1"
        >
          <ChevronLeft className="h-5 w-5" />
          {step === 'profile' ? 'Doctors' : 'Profile'}
        </button>

        {/* Step progress pills */}
        {step !== 'profile' && (
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`h-[5px] rounded-full transition-all duration-300 ${
                  step === s
                    ? 'w-6 bg-[#0050cb]'
                    : i < STEPS.indexOf(step)
                    ? 'w-4 bg-emerald-400'
                    : 'w-4 bg-gray-200'
                }`} />
              </div>
            ))}
          </div>
        )}

        <div className="w-16" /> {/* spacer for centering */}
      </div>

      {/* ════════════════════════════════════════
          PROFILE STEP
      ════════════════════════════════════════ */}
      {step === 'profile' && (
        <div className="animate-fade-in">

          {/* Hero Banner */}
          <div className="relative bg-gradient-to-b from-[#0050cb] to-[#1a6bff] pt-8 pb-16 px-5 overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
            <div className="absolute top-4 -right-4 w-24 h-24 bg-white/5 rounded-full" />

            <div className="relative flex items-start gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {doctor.profile_image_url ? (
                  <img
                    src={doctor.profile_image_url}
                    alt={doctor.full_name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30 shadow-xl"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white text-2xl font-black shadow-xl">
                    {getInitials(doctor.full_name)}
                  </div>
                )}
              </div>

              {/* Name & specialty */}
              <div className="flex-1 min-w-0 pt-1">
                <h1 className="text-xl font-black text-white leading-tight" style={{ fontFamily: 'var(--font-headline)' }}>
                  Dr. {doctor.full_name}
                </h1>
                <p className="text-sm text-blue-100 mt-0.5 font-medium">
                  {doctor.specialization || 'General Physician'}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Shield className="h-3.5 w-3.5 text-emerald-300" />
                  <span className="text-xs text-emerald-300 font-semibold">Verified Doctor</span>
                </div>
              </div>
            </div>

            {/* Consultation mode badges */}
            <div className="flex items-center gap-2 mt-4">
              {doctor.teleconsultation && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 text-white text-xs font-semibold border border-white/20">
                  <Video className="h-3 w-3" /> Video
                </span>
              )}
              {doctor.clinic_visit && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 text-white text-xs font-semibold border border-white/20">
                  <Building2 className="h-3 w-3" /> In-Clinic
                </span>
              )}
            </div>
          </div>

          {/* Stats Row — overlaps hero */}
          <div className="mx-4 -mt-8 relative z-10">
            <div className="bg-white rounded-2xl shadow-lg shadow-blue-900/8 border border-gray-100 grid grid-cols-3 divide-x divide-gray-100 overflow-hidden">
              <div className="flex flex-col items-center py-4">
                <p className="text-xl font-black text-gray-900">{doctor.experience_years || 5}+</p>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Yrs Exp</p>
              </div>
              <div className="flex flex-col items-center py-4">
                <div className="flex items-center gap-0.5">
                  <p className="text-xl font-black text-amber-500">4.8</p>
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 mt-0.5" />
                </div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Rating</p>
              </div>
              <div className="flex flex-col items-center py-4">
                <p className="text-xl font-black text-gray-900">500+</p>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Patients</p>
              </div>
            </div>
          </div>

          {/* Content cards */}
          <div className="px-4 mt-4 space-y-3">

            {/* Quick Info */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              {doctor.clinic_name && (
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-[#0050cb]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400 font-medium">Clinic</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{doctor.clinic_name}</p>
                  </div>
                </div>
              )}
              {doctor.qualifications?.length && (
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400 font-medium">Qualifications</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{doctor.qualifications.join(', ')}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Session duration</p>
                  <p className="text-sm font-semibold text-gray-800">{doctor.appointment_duration || 30} minutes</p>
                </div>
              </div>
            </div>

            {/* About */}
            {doctor.bio && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{doctor.bio}</p>
              </div>
            )}

            {/* Consultation Types */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Consultation Options</h3>
              <div className="space-y-2.5">
                {doctor.teleconsultation && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Video className="h-4.5 w-4.5 text-emerald-600" style={{ width: 18, height: 18 }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Video Consultation</p>
                      <p className="text-xs text-gray-500">From the comfort of your home</p>
                    </div>
                  </div>
                )}
                {doctor.clinic_visit && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-4.5 w-4.5 text-blue-600" style={{ width: 18, height: 18 }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">In-Clinic Visit</p>
                      <p className="text-xs text-gray-500">{doctor.clinic_name ? `At ${doctor.clinic_name}` : 'Visit the clinic'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          BOOKING STEPS — Compact doctor header
      ════════════════════════════════════════ */}
      {step !== 'profile' && (
        <div>
          {/* Mini doctor card */}
          <div className="mx-4 mt-3 bg-white rounded-2xl border border-gray-100 p-3.5 flex items-center gap-3 shadow-sm">
            {doctor.profile_image_url ? (
              <img src={doctor.profile_image_url} alt={doctor.full_name} className="w-11 h-11 rounded-xl object-cover border border-gray-100" />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0050cb] to-[#3d8bfd] flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                {getInitials(doctor.full_name)}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-[15px] truncate">Dr. {doctor.full_name}</p>
              <p className="text-xs text-gray-500">{doctor.specialization || 'General Physician'}</p>
            </div>
            <div className="ml-auto text-right flex-shrink-0">
              <p className="text-xs text-gray-400">Fee</p>
              <p className="text-sm font-black text-gray-900">{doctor.consultation_fee ? `₹${doctor.consultation_fee}` : 'Free'}</p>
            </div>
          </div>

          {/* Step label */}
          <div className="px-4 mt-4 mb-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Step {STEPS.indexOf(step) + 1} of {STEPS.length} · {stepLabels[step]}
            </p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          SLOT STEP
      ════════════════════════════════════════ */}
      {step === 'slot' && (
        <div className="px-4 mt-3 space-y-3 animate-fade-in">

          {/* Consultation Type Toggle */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3">How would you like to consult?</h3>
            <div className="flex gap-2.5">
              {doctor.teleconsultation && (
                <button
                  id="consult-type-video"
                  onClick={() => setConsultType('teleconsultation')}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-4 rounded-xl border-2 transition-all active:scale-[0.97] ${
                    consultType === 'teleconsultation'
                      ? 'border-[#0050cb] bg-blue-50/60 shadow-sm'
                      : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <Video className={`h-5 w-5 ${consultType === 'teleconsultation' ? 'text-[#0050cb]' : 'text-gray-400'}`} />
                  <p className={`text-sm font-bold ${consultType === 'teleconsultation' ? 'text-[#0050cb]' : 'text-gray-600'}`}>Video</p>
                  <p className="text-[10px] text-gray-400">From home</p>
                </button>
              )}
              {doctor.clinic_visit && (
                <button
                  id="consult-type-clinic"
                  onClick={() => setConsultType('clinic_visit')}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-4 rounded-xl border-2 transition-all active:scale-[0.97] ${
                    consultType === 'clinic_visit'
                      ? 'border-[#0050cb] bg-blue-50/60 shadow-sm'
                      : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <Building2 className={`h-5 w-5 ${consultType === 'clinic_visit' ? 'text-[#0050cb]' : 'text-gray-400'}`} />
                  <p className={`text-sm font-bold ${consultType === 'clinic_visit' ? 'text-[#0050cb]' : 'text-gray-600'}`}>In-Clinic</p>
                  <p className="text-[10px] text-gray-400 truncate">{doctor.clinic_name || 'Visit'}</p>
                </button>
              )}
            </div>
          </div>

          {/* Date Picker */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Select Date</h3>
              <div className="flex items-center gap-0.5">
                <button
                  id="week-prev"
                  onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-500" />
                </button>
                <button
                  id="week-next"
                  onClick={() => setWeekOffset(weekOffset + 1)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            {/* Horizontally scrollable day strip */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide snap-x snap-mandatory">
              {weekDays.map((day) => (
                <button
                  key={day.toISOString()}
                  id={`day-${day.toISOString().split('T')[0]}`}
                  onClick={() => setSelectedDate(day)}
                  className={`snap-start flex-shrink-0 flex flex-col items-center pt-2.5 pb-2 px-2 rounded-xl transition-all active:scale-[0.95] min-w-[52px] ${
                    isSameDay(day, selectedDate)
                      ? 'bg-[#0050cb] text-white shadow-md shadow-blue-500/30'
                      : isToday(day)
                      ? 'bg-blue-50 text-[#0050cb] border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className="text-[17px] font-black leading-tight mt-0.5">{day.getDate()}</span>
                  <span className="text-[9px] opacity-60 mt-0.5">
                    {day.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Available Slots</h3>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  id={`slot-${slot.replace(':', '-')}`}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.95] ${
                    selectedSlot === slot
                      ? 'bg-[#0050cb] text-white shadow-md shadow-blue-500/30'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          TRIAGE STEP
      ════════════════════════════════════════ */}
      {step === 'triage' && (
        <div className="px-4 mt-3 space-y-3 animate-fade-in">

          {/* Triage form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#0050cb]/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-[#0050cb]" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-gray-900">Pre-Consultation Form</h3>
                <p className="text-xs text-gray-400">Help the doctor prepare for your visit</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  What brings you in today? <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="chief-complaint"
                  rows={3}
                  value={triageResponses.chiefComplaint}
                  onChange={(e) => setTriageResponses(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                  placeholder="Describe your main concern or symptoms…"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[16px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20 focus:border-[#0050cb]/40 transition-all resize-none bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  How long have you had these symptoms?
                </label>
                <input
                  id="symptom-duration"
                  type="text"
                  value={triageResponses.duration}
                  onChange={(e) => setTriageResponses(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 3 days, 2 weeks, 1 month"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[16px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20 focus:border-[#0050cb]/40 transition-all bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Severity</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['mild', 'moderate', 'severe'] as const).map((sev) => (
                    <button
                      id={`severity-${sev}`}
                      key={sev}
                      onClick={() => setTriageResponses(prev => ({ ...prev, severity: sev }))}
                      className={`py-3 rounded-xl text-sm font-bold capitalize transition-all active:scale-[0.97] border ${
                        triageResponses.severity === sev
                          ? sev === 'severe'
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : sev === 'moderate'
                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-gray-50 border-gray-100 text-gray-500'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Additional notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  id="additional-notes"
                  rows={2}
                  value={triageResponses.additionalNotes}
                  onChange={(e) => setTriageResponses(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  placeholder="Allergies, current medications, or relevant history…"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[16px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20 focus:border-[#0050cb]/40 transition-all resize-none bg-gray-50/50"
                />
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Booking Summary</h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Doctor</span>
                <span className="font-semibold text-gray-900 text-right">Dr. {doctor.full_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Date</span>
                <span className="font-semibold text-gray-900">{formatDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Time</span>
                <span className="font-semibold text-gray-900">{selectedSlot}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Type</span>
                <span className="font-semibold text-gray-900">{consultType === 'teleconsultation' ? 'Video Consult' : 'In-Clinic'}</span>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-gray-100">
                <span className="font-bold text-gray-700">Consultation Fee</span>
                <span className="font-black text-xl text-gray-900">
                  {doctor.consultation_fee ? `₹${doctor.consultation_fee}` : 'Free'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          STICKY BOTTOM CTA
      ════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#f5f5f7]/95 backdrop-blur-xl border-t border-black/[0.06] px-4 pb-[calc(env(safe-area-inset-bottom,0px)+68px)] pt-3">

        {/* Fee + CTA — profile step */}
        {step === 'profile' && (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <p className="text-[10px] text-gray-400 font-medium">Consultation Fee</p>
              <p className="text-xl font-black text-gray-900">
                {doctor.consultation_fee ? `₹${doctor.consultation_fee}` : 'Free'}
              </p>
            </div>
            <button
              id="book-appointment-btn"
              onClick={() => setStep('slot')}
              className="flex-1 py-4 rounded-2xl bg-[#0050cb] text-white font-bold text-[15px] shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
              Book Appointment
            </button>
          </div>
        )}

        {/* Slot step CTA */}
        {step === 'slot' && (
          <button
            id="continue-to-triage-btn"
            onClick={() => selectedSlot ? setStep('triage') : alert('Please select a time slot')}
            disabled={!selectedSlot}
            className="w-full py-4 rounded-2xl bg-[#0050cb] text-white font-bold text-[15px] shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all disabled:opacity-40 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {selectedSlot ? (
              <>
                <Clock className="h-4 w-4" /> Continue · {formatDate(selectedDate)} at {selectedSlot}
              </>
            ) : (
              'Select a Time Slot to Continue'
            )}
          </button>
        )}

        {/* Triage step CTA */}
        {step === 'triage' && (
          <button
            id="confirm-booking-btn"
            onClick={handleBookAppointment}
            disabled={isBooking || !triageResponses.chiefComplaint}
            className="w-full py-4 rounded-2xl bg-[#0050cb] text-white font-bold text-[15px] shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all disabled:opacity-40 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {isBooking ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Booking…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> Confirm & Book Appointment
              </>
            )}
          </button>
        )}
      </div>

    </div>
  )
}
