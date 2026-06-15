'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Star, Clock, Video, Building2, ChevronRight, Filter, Sparkles } from 'lucide-react'
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
  is_active: boolean
}

const specializations = [
  'All',
  'Cardiologist',
  'Dermatologist',
  'General Physician',
  'Neurologist',
  'Orthopedic',
  'Pediatrician',
  'Psychiatrist',
  'ENT Specialist',
  'Gynecologist',
]

export default function DoctorDiscoveryPage() {
  const supabase = createClient()
  const [doctors, setDoctors] = useState<DoctorProfile[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('All')
  const [consultationType, setConsultationType] = useState<'all' | 'online' | 'clinic'>('all')

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    filterDoctors()
  }, [doctors, searchQuery, selectedSpecialization, consultationType])

  const fetchDoctors = async () => {
    setIsLoading(true)
    const { data, error }: { data: any, error: any } = await supabase
      .from('doctor_profiles')
      .select('*')
      .eq('is_active', true)
      .order('full_name')

    if (!error && data) {
      setDoctors(data)
    }
    setIsLoading(false)
  }

  const filterDoctors = () => {
    let result = [...doctors]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(d =>
        d.full_name.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q) ||
        d.clinic_name?.toLowerCase().includes(q)
      )
    }

    if (selectedSpecialization !== 'All') {
      result = result.filter(d =>
        d.specialization?.toLowerCase() === selectedSpecialization.toLowerCase()
      )
    }

    if (consultationType === 'online') {
      result = result.filter(d => d.teleconsultation)
    } else if (consultationType === 'clinic') {
      result = result.filter(d => d.clinic_visit)
    }

    setFilteredDoctors(result)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0050cb] via-[#0066ff] to-[#3d8bfd] p-6 md:p-12 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-blue-200" />
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-200">Find Your Doctor</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" style={{ fontFamily: 'var(--font-headline)' }}>
            Book an Appointment
          </h1>
          <p className="text-blue-100 text-sm md:text-base max-w-lg leading-relaxed">
            Browse our network of verified specialists. Get teleconsultations from home or visit in-clinic — your health, your choice.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        {/* Search Bar — Apple-style frosted glass */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by doctor name, specialty, or clinic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200/60 text-gray-900 placeholder:text-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0050cb]/30 focus:border-[#0050cb]/40 shadow-sm transition-all"
          />
        </div>

        {/* Specialization Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {specializations.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialization(spec)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 border ${
                selectedSpecialization === spec
                  ? 'bg-[#0050cb] text-white border-[#0050cb] shadow-md shadow-blue-500/20'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Consultation Type Toggle */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {[
            { key: 'all', label: 'All Types', icon: Filter },
            { key: 'online', label: 'Video Consult', icon: Video },
            { key: 'clinic', label: 'In-Clinic', icon: Building2 },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setConsultationType(key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                consultationType === key
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{filteredDoctors.length}</span> doctor{filteredDoctors.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Doctor Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 p-6 animate-pulse">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5">
            <Search className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No doctors found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Try adjusting your search filters or check back later. More doctors are joining Docto every day.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredDoctors.map((doctor) => (
            <Link
              key={doctor.id}
              href={`/patient/doctors/${doctor.id}`}
              className="group relative rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-100 transition-all duration-300 cursor-pointer"
            >
              {/* Top Row: Avatar + Name */}
              <div className="flex items-start gap-4 mb-4">
                {doctor.profile_image_url ? (
                  <img
                    src={doctor.profile_image_url}
                    alt={doctor.full_name}
                    className="w-14 h-14 rounded-2xl object-cover border border-gray-100"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0050cb] to-[#3d8bfd] flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/20">
                    {getInitials(doctor.full_name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-base group-hover:text-[#0050cb] transition-colors truncate">
                    Dr. {doctor.full_name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{doctor.specialization || 'General Physician'}</p>
                  {doctor.clinic_name && (
                    <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 flex-shrink-0" /> {doctor.clinic_name}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-[#0050cb] group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
              </div>

              {/* Meta Row */}
              <div className="flex items-center gap-3 flex-wrap mb-4">
                {doctor.experience_years && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                    <Clock className="h-3 w-3" /> {doctor.experience_years} yrs exp
                  </span>
                )}
                <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 4.8
                </span>
                {doctor.teleconsultation && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    <Video className="h-3 w-3" /> Video
                  </span>
                )}
              </div>

              {/* Fee + CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div>
                  <span className="text-xs text-gray-400">Consultation fee</span>
                  <p className="text-lg font-bold text-gray-900 -mt-0.5">
                    {doctor.consultation_fee ? `₹${doctor.consultation_fee}` : 'Free'}
                  </p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-[#0050cb] text-white text-xs font-semibold group-hover:bg-[#003d9e] transition-colors shadow-md shadow-blue-500/20">
                  Book Now
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
