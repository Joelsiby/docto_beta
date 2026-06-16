'use client'

import { useEffect, useState } from 'react'
import { DoctorTopBar } from '@/components/doctor/top-bar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  type: string
  notes: string
  patient_id: string
  patient_profiles: {
    id: string
    full_name: string
  } | null
}

interface Patient {
  id: string
  full_name: string
}

export default function AppointmentsPage() {
  const supabase = createClient()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [doctorId, setDoctorId] = useState<string | null>(null)

  // Form states for new appointment
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [newType, setNewType] = useState('Consultation')
  const [newMode, setNewMode] = useState('Clinic Visit') // stored as metadata or notes if needed, or status/type
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [newTime, setNewTime] = useState('09:00')
  const [newNotes, setNewNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchDoctorAndData = async () => {
    setIsLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch doctor profile
      const { data: doctor, error: docError } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (docError) throw docError

      if (doctor) {
        setDoctorId((doctor as any).id)

        // Fetch today's appointments
        const { data: appData, error: appError } = await supabase
          .from('appointments')
          .select(`
            id,
            appointment_date,
            appointment_time,
            status,
            type,
            notes,
            patient_id,
            patient_profiles (
              id,
              full_name
            )
          `)
          .eq('doctor_id', (doctor as any).id)
          .eq('appointment_date', new Date().toISOString().split('T')[0])
          .order('appointment_time', { ascending: true })

        if (appError) throw appError
        setAppointments(appData as unknown as Appointment[] || [])
      }

      // Fetch all patients for selection dropdown
      const { data: patientData, error: patError } = await supabase
        .from('patient_profiles')
        .select('id, full_name')
        .order('full_name', { ascending: true })

      if (patError) throw patError
      setPatients(patientData || [])
    } catch (err) {
      console.error('Error fetching dashboard appointments data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctorAndData()
  }, [])

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!doctorId || !selectedPatientId) {
      setError('Please select a patient.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const { error: insertError } = await (supabase as any).from('appointments').insert({
        doctor_id: doctorId,
        patient_id: selectedPatientId,
        appointment_date: newDate,
        appointment_time: `${newTime}:00`,
        type: `${newType} (${newMode})`,
        notes: newNotes,
        status: 'scheduled',
      })

      if (insertError) throw insertError

      setIsModalOpen(false)
      // Reset form
      setSelectedPatientId('')
      setNewNotes('')
      // Refresh list
      fetchDoctorAndData()
    } catch (err: any) {
      setError(err?.message || 'Error booking appointment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper stats computation
  const stats = [
    { label: "Today's Total", value: appointments.length.toString(), color: '#0050cb', bg: 'rgba(0,80,203,0.08)' },
    { label: 'Pending Triage', value: appointments.filter(a => a.status === 'scheduled').length.toString(), color: '#FF9500', bg: 'rgba(255,149,0,0.08)' },
    { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length.toString(), color: '#34C759', bg: 'rgba(52,199,89,0.08)' },
    { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length.toString(), color: '#FF3B30', bg: 'rgba(255,59,48,0.08)' },
  ]

  // Formats time strings (e.g. 09:30:00 -> 09:30 AM)
  const formatTime = (timeStr: string) => {
    const parts = timeStr.split(':')
    if (parts.length < 2) return timeStr
    const hour = parseInt(parts[0], 10)
    const min = parts[1]
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const dispHour = hour % 12 || 12
    return `${dispHour}:${min} ${ampm}`
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <DoctorTopBar
        title="Appointments"
        subtitle={`Today · ${new Date().toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}`}
        actions={
          <>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                border: 'none',
                background: '#0050cb',
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: '-apple-system, sans-serif',
              }}
            >
              + New Appointment
            </button>
          </>
        }
      />

      <div style={{ flex: 1, overflow: 'auto', background: '#F5F5F7', padding: 24 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                background: '#fff',
                borderRadius: 14,
                padding: '18px 20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ fontSize: 12, color: '#86868B', fontFamily: '-apple-system, sans-serif', marginBottom: 8, fontWeight: 500 }}>
                {s.label}
              </div>
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 700,
                  color: s.color,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Patient queue */}
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1D1D1F', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
              Live Queue
            </h2>
          </div>

          {/* Patient rows */}
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#86868B', fontSize: 14, fontFamily: '-apple-system, sans-serif' }}>
              No appointments scheduled for today. Click "+ New Appointment" to create one.
            </div>
          ) : (
            appointments.map((a, idx) => {
              const patientName = a.patient_profiles?.full_name || 'Unknown Patient'
              const patientInitials = getInitials(patientName)
              const colors = { bg: 'rgba(0,80,203,0.08)', dot: '#0050cb', text: '#0050cb' } // default color
              
              return (
                <div
                  key={a.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: idx < appointments.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      background: colors.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 600,
                      color: colors.text,
                      fontFamily: '-apple-system, sans-serif',
                      flexShrink: 0,
                    }}
                  >
                    {patientInitials}
                  </div>

                  {/* Name + type */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1D1D1F', fontFamily: '-apple-system, sans-serif', marginBottom: 2 }}>
                      {patientName}
                    </div>
                    <div style={{ fontSize: 12, color: '#86868B', fontFamily: '-apple-system, sans-serif' }}>
                      {a.type}
                    </div>
                  </div>

                  {/* Time */}
                  <div style={{ textAlign: 'right', marginRight: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1D1D1F', fontFamily: '-apple-system, sans-serif' }}>
                      {formatTime(a.appointment_time)}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: a.status === 'in-progress' ? '#34C759' : a.status === 'scheduled' ? '#FF9500' : '#86868B',
                        fontFamily: '-apple-system, sans-serif',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                      }}
                    >
                      ● {a.status}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={async () => {
                        const btn = document.getElementById(`export-btn-${a.id}`) as HTMLButtonElement
                        if (btn) btn.innerHTML = '...'
                        try {
                          const res = await fetch(`/api/export?format=fhir&patientId=${a.patient_id}`)
                          if (!res.ok) throw new Error('Export failed')
                          const blob = await res.blob()
                          const url = window.URL.createObjectURL(blob)
                          const link = document.createElement('a')
                          link.href = url
                          link.download = `docto_patient_${a.patient_id}_records.json`
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                          window.URL.revokeObjectURL(url)
                        } catch (err) {
                          alert('Failed to export patient records.')
                        } finally {
                          if (btn) btn.innerHTML = 'Export FHIR'
                        }
                      }}
                      id={`export-btn-${a.id}`}
                      style={{
                        padding: '7px 12px',
                        borderRadius: 8,
                        border: '1px solid #0050cb',
                        background: 'transparent',
                        color: '#0050cb',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: '-apple-system, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      Export FHIR
                    </button>
                    <Link
                      href={`/doctor/session/${a.patient_id}`}
                      style={{
                        padding: '7px 16px',
                        borderRadius: 8,
                        border: 'none',
                        background: '#0050cb',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: '-apple-system, sans-serif',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                      Start Session
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 450,
              padding: 24,
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1D1D1F' }}>Book Appointment</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#86868B' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {error && (
              <div className="p-3 bg-error-container text-on-error-container text-xs rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateAppointment} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#86868B', marginBottom: 6 }}>Select Patient</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary text-black"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name}
                    </option>
                  ))}
                </select>
                {patients.length === 0 && (
                  <p style={{ fontSize: 11, color: '#FF3B30', marginTop: 4 }}>
                    No patient profiles registered in system yet. Please create a patient account first.
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#86868B', marginBottom: 6 }}>Appointment Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary text-black"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Procedure">Procedure</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#86868B', marginBottom: 6 }}>Visit Mode</label>
                  <select
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary text-black"
                  >
                    <option value="Clinic Visit">Clinic Visit</option>
                    <option value="Teleconsultation">Teleconsultation</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#86868B', marginBottom: 6 }}>Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary text-black"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#86868B', marginBottom: 6 }}>Time</label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary text-black"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#86868B', marginBottom: 6 }}>Symptoms / Notes</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Reason for visit..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary text-black resize-none"
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid rgba(0,0,0,0.1)',
                    background: '#fff',
                    color: '#1D1D1F',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || patients.length === 0}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#0050cb',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    opacity: (isSubmitting || patients.length === 0) ? 0.6 : 1,
                  }}
                >
                  {isSubmitting ? 'Booking...' : 'Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
