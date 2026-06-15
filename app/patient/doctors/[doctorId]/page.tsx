'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Star, Clock, Video, Building2, MapPin,
  Calendar, CheckCircle2, ChevronLeft, ChevronRight, Sparkles, GraduationCap, Shield
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

  // Generate calendar week starting from selectedDate
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

  // Generate time slots
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-[#0050cb]/20 border-t-[#0050cb] rounded-full animate-spin" />
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold text-gray-800">Doctor not found</h2>
        <Link href="/patient/doctors" className="text-sm text-[#0050cb] hover:underline mt-2 inline-block">
          ← Back to doctors
        </Link>
      </div>
    )
  }

  // Success Screen
  if (step === 'confirm' && bookingSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
            Appointment Confirmed!
          </h2>
          <p className="text-gray-500 text-sm mb-2">
            Your appointment with <span className="font-semibold text-gray-800">Dr. {doctor.full_name}</span> has been booked.
          </p>
          <div className="inline-flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 mt-2 mb-8">
            <Calendar className="h-4 w-4 text-[#0050cb]" />
            <span className="text-sm font-medium text-gray-700">
              {formatDate(selectedDate)} at {selectedSlot}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/patient/appointments"
              className="w-full py-3 rounded-xl bg-[#0050cb] text-white font-semibold text-sm hover:bg-[#003d9e] transition-colors shadow-lg shadow-blue-500/20"
            >
              View My Appointments
            </Link>
            <Link
              href="/patient/doctors"
              className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              Browse More Doctors
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* iOS-Style Navigation Header */}
      <div className="flex items-center justify-between py-2 mb-2">
        <button
          onClick={() => step === 'profile' ? router.push('/patient/doctors') : setStep('profile')}
          className="flex items-center gap-1.5 text-[15px] text-[#0050cb] font-medium transition-opacity active:opacity-70"
        >
          <ChevronLeft className="h-5 w-5 -ml-1.5" />
          {step === 'profile' ? 'Doctors' : 'Profile'}
        </button>

        {/* Step Indicator */}
        {step !== 'profile' && (
          <div className="flex items-center gap-1.5 md:gap-3 bg-gray-50/80 px-3 py-1.5 rounded-full border border-gray-100">
            {['slot', 'triage', 'confirm'].map((s, i) => (
              <div key={s} className="flex items-center gap-1.5 md:gap-2">
                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[11px] md:text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-[#0050cb] text-white shadow-sm'
                    : i < ['slot', 'triage', 'confirm'].indexOf(step)
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {i + 1}
                </div>
                {i < 2 && <div className={`w-4 md:w-8 h-0.5 rounded ${
                  i < ['slot', 'triage', 'confirm'].indexOf(step) ? 'bg-emerald-200' : 'bg-gray-200'
                }`} />}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Doctor Profile Card (always visible on desktop, hidden on mobile if booking) */}
        <div className={`lg:col-span-1 ${step !== 'profile' ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-6">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center mb-6">
              {doctor.profile_image_url ? (
                <img
                  src={doctor.profile_image_url}
                  alt={doctor.full_name}
                  className="w-24 h-24 rounded-3xl object-cover border-2 border-gray-100 shadow-lg mb-4"
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#0050cb] to-[#3d8bfd] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20 mb-4">
                  {getInitials(doctor.full_name)}
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-headline)' }}>
                Dr. {doctor.full_name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{doctor.specialization || 'General Physician'}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 rounded-xl bg-gray-50">
                <p className="text-lg font-bold text-gray-900">{doctor.experience_years || '5'}+</p>
                <p className="text-[10px] text-gray-500 font-medium">Years</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-gray-50">
                <p className="text-lg font-bold text-amber-500">4.8</p>
                <p className="text-[10px] text-gray-500 font-medium">Rating</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-gray-50">
                <p className="text-lg font-bold text-gray-900">500+</p>
                <p className="text-[10px] text-gray-500 font-medium">Patients</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-6">
              {doctor.clinic_name && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span>{doctor.clinic_name}</span>
                </div>
              )}
              {doctor.qualifications?.length && (
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <GraduationCap className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>{doctor.qualifications.join(', ')}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{doctor.appointment_duration || 30} min consultation</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-600 font-medium">Verified Doctor</span>
              </div>
            </div>

            {/* Modes */}
            <div className="flex gap-2 mb-6">
              {doctor.teleconsultation && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  <Video className="h-3 w-3" /> Video
                </span>
              )}
              {doctor.clinic_visit && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                  <Building2 className="h-3 w-3" /> Clinic
                </span>
              )}
            </div>

            {/* Bio */}
            {doctor.bio && (
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">About</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{doctor.bio}</p>
              </div>
            )}

            {/* Fee */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-xs text-gray-500">Consultation Fee</span>
              <p className="text-2xl font-bold text-gray-900">
                {doctor.consultation_fee ? `₹${doctor.consultation_fee}` : 'Free'}
              </p>
            </div>

            {step === 'profile' && (
              <button
                onClick={() => setStep('slot')}
                className="w-full mt-6 py-3.5 rounded-xl bg-[#0050cb] text-white font-semibold text-sm hover:bg-[#003d9e] transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Calendar className="h-4 w-4" /> Book Appointment
              </button>
            )}
          </div>
        </div>

        {/* Right: Booking Flow */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Compact Doctor Header for Mobile (only visible when step !== 'profile') */}
          {step !== 'profile' && (
            <div className="lg:hidden flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm sticky top-4 z-10 animate-fade-in">
              {doctor.profile_image_url ? (
                <img src={doctor.profile_image_url} alt={doctor.full_name} className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0050cb] to-[#3d8bfd] flex items-center justify-center text-white font-bold text-sm">
                  {getInitials(doctor.full_name)}
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-900 text-[15px]">Dr. {doctor.full_name}</h3>
                <p className="text-xs text-gray-500">{doctor.specialization || 'General Physician'}</p>
              </div>
            </div>
          )}

          {step === 'profile' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-headline)' }}>
                About Dr. {doctor.full_name}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                {doctor.bio || `Dr. ${doctor.full_name} is a highly experienced ${doctor.specialization || 'General Physician'} with ${doctor.experience_years || '5'}+ years of practice. They are committed to providing compassionate, evidence-based care to all patients.`}
              </p>

              {/* Consultation types info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctor.teleconsultation && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
                      <Video className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Video Consultation</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Connect face-to-face from the comfort of your home. Secure, private video call with screen sharing.
                    </p>
                  </div>
                )}
                {doctor.clinic_visit && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">In-Clinic Visit</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {doctor.clinic_name ? `Visit at ${doctor.clinic_name}.` : 'Visit the doctor\'s clinic.'} Walk-in and scheduled appointments available.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Slot Selection */}
          {step === 'slot' && (
            <div className="space-y-6 animate-fade-in">
              {/* Consultation Type */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-4">Consultation Type</h3>
                <div className="flex gap-3">
                  {doctor.teleconsultation && (
                    <button
                      onClick={() => setConsultType('teleconsultation')}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        consultType === 'teleconsultation'
                          ? 'border-[#0050cb] bg-blue-50/50 shadow-sm'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <Video className={`h-5 w-5 mb-2 ${consultType === 'teleconsultation' ? 'text-[#0050cb]' : 'text-gray-400'}`} />
                      <p className="font-semibold text-sm text-gray-900">Video</p>
                      <p className="text-xs text-gray-500">From home</p>
                    </button>
                  )}
                  {doctor.clinic_visit && (
                    <button
                      onClick={() => setConsultType('clinic_visit')}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        consultType === 'clinic_visit'
                          ? 'border-[#0050cb] bg-blue-50/50 shadow-sm'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <Building2 className={`h-5 w-5 mb-2 ${consultType === 'clinic_visit' ? 'text-[#0050cb]' : 'text-gray-400'}`} />
                      <p className="font-semibold text-sm text-gray-900">In-Clinic</p>
                      <p className="text-xs text-gray-500">{doctor.clinic_name || 'Visit'}</p>
                    </button>
                  )}
                </div>
              </div>

              {/* Date Picker */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900">Select Date</h3>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <ChevronLeft className="h-4 w-4 text-gray-500" />
                    </button>
                    <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 md:grid md:grid-cols-7 md:mx-0 md:px-0">
                  {weekDays.map((day) => (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`min-w-[64px] md:min-w-0 flex flex-col items-center py-3 px-1 rounded-xl transition-all ${
                        isSameDay(day, selectedDate)
                          ? 'bg-[#0050cb] text-white shadow-md shadow-blue-500/30'
                          : isToday(day)
                            ? 'bg-blue-50 text-[#0050cb] border border-blue-200'
                            : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-[10px] font-medium uppercase opacity-70">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-lg font-bold mt-0.5">{day.getDate()}</span>
                      <span className="text-[10px] opacity-60">
                        {day.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-4">Available Slots</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-3 px-3 rounded-xl text-sm font-medium transition-all ${
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

              {/* Continue */}
              <button
                onClick={() => selectedSlot ? setStep('triage') : alert('Please select a time slot')}
                disabled={!selectedSlot}
                className="w-full py-3.5 rounded-xl bg-[#0050cb] text-white font-semibold text-sm hover:bg-[#003d9e] transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Pre-Consultation Form
              </button>
            </div>
          )}

          {/* Triage Form */}
          {step === 'triage' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#0050cb]/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-[#0050cb]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Pre-Consultation Form</h3>
                    <p className="text-xs text-gray-500">Help the doctor prepare for your visit</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      What brings you in today? <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={triageResponses.chiefComplaint}
                      onChange={(e) => setTriageResponses(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                      placeholder="Describe your main concern or symptoms..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[16px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20 focus:border-[#0050cb]/40 transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      How long have you had these symptoms?
                    </label>
                    <input
                      type="text"
                      value={triageResponses.duration}
                      onChange={(e) => setTriageResponses(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 3 days, 2 weeks, 1 month"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[16px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20 focus:border-[#0050cb]/40 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Severity</label>
                    <div className="flex gap-2">
                      {['mild', 'moderate', 'severe'].map((sev) => (
                        <button
                          key={sev}
                          onClick={() => setTriageResponses(prev => ({ ...prev, severity: sev }))}
                          className={`flex-1 py-3 rounded-xl text-sm font-medium capitalize transition-all border ${
                            triageResponses.severity === sev
                              ? sev === 'severe'
                                ? 'bg-red-50 border-red-200 text-red-700'
                                : sev === 'moderate'
                                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          {sev}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Additional notes for the doctor
                    </label>
                    <textarea
                      rows={2}
                      value={triageResponses.additionalNotes}
                      onChange={(e) => setTriageResponses(prev => ({ ...prev, additionalNotes: e.target.value }))}
                      placeholder="Any allergies, current medications, or relevant history..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[16px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20 focus:border-[#0050cb]/40 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-6">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Doctor</span>
                    <span className="font-medium text-gray-900">Dr. {doctor.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium text-gray-900">{formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium text-gray-900">{selectedSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type</span>
                    <span className="font-medium text-gray-900">{consultType === 'teleconsultation' ? 'Video Consult' : 'In-Clinic'}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100">
                    <span className="text-gray-500 font-semibold">Fee</span>
                    <span className="font-bold text-gray-900 text-lg">
                      {doctor.consultation_fee ? `₹${doctor.consultation_fee}` : 'Free'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBookAppointment}
                disabled={isBooking || !triageResponses.chiefComplaint}
                className="w-full py-3.5 rounded-xl bg-[#0050cb] text-white font-semibold text-sm hover:bg-[#003d9e] transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isBooking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Confirm & Book Appointment
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
