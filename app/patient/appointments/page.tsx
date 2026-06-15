'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Calendar, Clock, Video, Building2, Plus, Search,
  ArrowRight, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Appointment {
  id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  status: string
  type: string
  notes: string | null
  doctor_profiles: {
    full_name: string
    specialization: string
    profile_image_url: string | null
  } | null
}

export default function PatientAppointmentsPage() {
  const supabase = createClient()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoading(false); return }

    const { data: patientProfile }: { data: any } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!patientProfile) { setIsLoading(false); return }

    const { data, error }: { data: any, error: any } = await supabase
      .from('appointments')
      .select('*, doctor_profiles!appointments_doctor_id_fkey(full_name, specialization, profile_image_url)')
      .eq('patient_id', patientProfile.id)
      .order('appointment_date', { ascending: false })

    if (!error && data) {
      setAppointments(data)
    }
    setIsLoading(false)
  }

  const filteredAppointments = appointments.filter(a => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return a.status === 'scheduled'
    if (filter === 'completed') return a.status === 'completed'
    if (filter === 'cancelled') return a.status === 'cancelled'
    return true
  })

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { label: 'Upcoming', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock }
      case 'completed':
        return { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 }
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle }
      case 'in-progress':
        return { label: 'In Progress', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle }
      default:
        return { label: status, color: 'bg-gray-50 text-gray-700 border-gray-200', icon: Clock }
    }
  }

  const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DR'

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-headline)' }}>
            My Appointments
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage all your bookings</p>
        </div>
        <Link
          href="/patient/doctors"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0050cb] text-white text-sm font-semibold hover:bg-[#003d9e] transition-colors shadow-lg shadow-blue-500/20 self-start"
        >
          <Plus className="h-4 w-4" /> Book New Appointment
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'All' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
              filter === key
                ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {label}
            {key === 'upcoming' && appointments.filter(a => a.status === 'scheduled').length > 0 && (
              <span className="ml-1.5 bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full">
                {appointments.filter(a => a.status === 'scheduled').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded-lg w-1/3" />
                  <div className="h-3 bg-gray-100 rounded-lg w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5">
            <Calendar className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No appointments yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
            Find a specialist and book your first consultation to get started.
          </p>
          <Link
            href="/patient/doctors"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0050cb] text-white text-sm font-semibold hover:bg-[#003d9e] transition-colors"
          >
            <Search className="h-4 w-4" /> Find a Doctor
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const status = getStatusConfig(appointment.status)
            const StatusIcon = status.icon
            const doctorName = appointment.doctor_profiles?.full_name || 'Doctor'
            const specialty = appointment.doctor_profiles?.specialization || 'Specialist'

            return (
              <div
                key={appointment.id}
                className="group bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-100 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Doctor Info */}
                  <div className="flex items-center gap-4">
                    {appointment.doctor_profiles?.profile_image_url ? (
                      <img
                        src={appointment.doctor_profiles.profile_image_url}
                        alt={doctorName}
                        className="w-14 h-14 rounded-2xl object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0050cb] to-[#3d8bfd] flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/20">
                        {getInitials(doctorName)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">Dr. {doctorName}</h3>
                      <p className="text-xs text-gray-500">{specialty}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${status.color}`}>
                          <StatusIcon className="h-3 w-3" /> {status.label}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                          {appointment.type === 'teleconsultation' ? (
                            <><Video className="h-3 w-3" /> Video</>
                          ) : (
                            <><Building2 className="h-3 w-3" /> Clinic</>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Date & Actions */}
                  <div className="flex items-center gap-4 md:text-right">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(appointment.appointment_date)}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 md:justify-end">
                        <Clock className="h-3 w-3" /> {appointment.appointment_time}
                      </p>
                    </div>
                    {appointment.status === 'scheduled' && (
                      <button className="px-4 py-2.5 rounded-xl bg-[#0050cb] text-white text-xs font-semibold hover:bg-[#003d9e] transition-colors shadow-md shadow-blue-500/20 flex items-center gap-1.5">
                        Join <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
