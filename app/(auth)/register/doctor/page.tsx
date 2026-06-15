'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DoctorRegisterPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    licenseNumber: '',
    specialization: 'General Practice',
    experienceYears: '',
    clinicName: '',
    consultationFee: '',
    teleconsultation: true,
    clinicVisit: true,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (step < 3) {
      setStep(step + 1)
      return
    }

    // Submit flow on Step 3
    setIsLoading(true)
    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        setError(authError.message)
        setIsLoading(false)
        return
      }

      const user = authData?.user
      if (!user) {
        setError('Failed to create account user.')
        setIsLoading(false)
        return
      }

      // 2. Insert doctor profile via API route
      const profileRes = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'doctor_profiles',
          data: {
            user_id: user.id,
            full_name: formData.fullName,
            specialization: formData.specialization,
            license_number: formData.licenseNumber,
            experience_years: formData.experienceYears ? parseInt(formData.experienceYears, 10) : null,
            clinic_name: formData.clinicName,
            consultation_fee: formData.consultationFee ? parseFloat(formData.consultationFee) : null,
            teleconsultation: formData.teleconsultation,
            clinic_visit: formData.clinicVisit,
            qualifications: [],
          }
        })
      })

      const profileData = await profileRes.json()
      if (!profileRes.ok || profileData.error) {
        setError(profileData.error || 'Failed to create doctor profile')
        setIsLoading(false)
        return
      }

      // Redirect on success
      router.push('/login?registered=true')
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.')
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-headline-lg font-headline-lg text-deep-navy mb-2">Join as a Doctor</h2>
        <p className="text-body-md text-on-surface-variant">
          Step {step} of 3: {step === 1 ? 'Personal Details' : step === 2 ? 'Professional Info' : 'Clinic Setup'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-surface-container-high rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
      </div>

      <form onSubmit={handleNext} className="space-y-5">
        {error && (
          <div className="p-3 bg-error-container text-on-error-container text-sm rounded-lg border border-error/20">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5 animate-fade-in-up">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Full Name</label>
              <input
                required
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Dr. Jane Smith"
                className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Email</label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="jane.smith@hospital.com"
                className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Password</label>
              <input
                required
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-fade-in-up">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Medical License Number</label>
              <input
                required
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                placeholder="LIC-123456"
                className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Specialization</label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
              >
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="General Practice">General Practice</option>
                <option value="Pediatrics">Pediatrics</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Years of Experience</label>
              <input
                required
                type="number"
                name="experienceYears"
                min="0"
                value={formData.experienceYears}
                onChange={handleInputChange}
                placeholder="10"
                className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-fade-in-up">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Clinic/Hospital Name</label>
              <input
                required
                type="text"
                name="clinicName"
                value={formData.clinicName}
                onChange={handleInputChange}
                placeholder="City Medical Center"
                className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Consultation Fee (INR)</label>
              <input
                required
                type="number"
                name="consultationFee"
                min="0"
                value={formData.consultationFee}
                onChange={handleInputChange}
                placeholder="500"
                className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
                <input
                  type="checkbox"
                  name="teleconsultation"
                  checked={formData.teleconsultation}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                Teleconsultation
              </label>
              <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
                <input
                  type="checkbox"
                  name="clinicVisit"
                  checked={formData.clinicVisit}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                In-Person Visit
              </label>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              disabled={isLoading}
              className="px-4 py-2.5 bg-surface-container-lowest border border-border-subtle text-on-surface font-medium rounded-lg hover:bg-surface-container-low transition-colors shadow-sm disabled:opacity-50"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 bg-primary text-on-primary font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            ) : step === 3 ? (
              'Complete Registration'
            ) : (
              'Next Step'
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center text-sm text-on-surface-variant">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  )
}
