'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PatientRegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'Prefer not to say',
    email: '',
    password: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

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

      // 2. Insert patient profile via API route
      const profileRes = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'patient_profiles',
          data: {
            user_id: user.id,
            full_name: formData.fullName,
            date_of_birth: formData.dateOfBirth || null,
            gender: formData.gender,
            blood_group: '',
            emergency_contact: {},
            address: {},
            medical_history: {},
            preferred_lang: 'en',
          }
        })
      })

      const profileData = await profileRes.json()
      if (!profileRes.ok || profileData.error) {
        setError(profileData.error || 'Failed to create patient profile')
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

  const handleGoogleSignup = async () => {
    setError('')
    setIsLoading(true)
    const { error: oAuthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback`
      }
    })
    if (oAuthError) {
      setError(oAuthError.message)
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-headline-lg font-headline-lg text-deep-navy mb-2">Create Patient Account</h2>
        <p className="text-body-md text-on-surface-variant">Join MedFlow to manage your health seamlessly.</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-5 animate-fade-in-up">
        {error && (
          <div className="p-3 bg-error-container text-on-error-container text-sm rounded-lg border border-error/20">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1.5">Full Name</label>
          <input
            required
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Alex Johnson"
            className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Date of Birth</label>
            <input
              required
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-on-surface"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1.5">Email</label>
          <input
            required
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="alex@example.com"
            className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
            className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 py-2.5 px-4 bg-primary text-on-primary font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center h-11"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
          ) : (
            'Create Account'
          )}
        </button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-border-subtle"></div>
          <span className="flex-shrink-0 mx-4 text-xs text-on-surface-variant">or</span>
          <div className="flex-grow border-t border-border-subtle"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-surface-container-lowest border border-border-subtle text-on-surface font-medium rounded-lg hover:bg-surface-container-low transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Sign up with Google
        </button>
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
