import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

interface UserSession {
  id: string | null
  role: 'doctor' | 'patient' | null
  email: string | null
  fullName: string | null
}

interface AuthState {
  session: UserSession
  isLoading: boolean
  setSession: (session: Partial<UserSession>) => void
  setLoading: (isLoading: boolean) => void
  clearSession: () => void
  initialize: () => () => void // Returns a unsubscribe function
  fetchProfile: (userId: string) => Promise<UserSession['role']>
}

export const useAuthStore = create<AuthState>((set, get) => {
  const supabase = createClient()

  return {
    session: {
      id: null,
      role: null,
      email: null,
      fullName: null,
    },
    isLoading: true,
    setSession: (newSession) =>
      set((state) => ({ session: { ...state.session, ...newSession } })),
    setLoading: (isLoading) => set({ isLoading }),
    clearSession: () =>
      set({
        session: { id: null, role: null, email: null, fullName: null },
      }),
    fetchProfile: async (userId) => {
      try {
        // Try Doctor
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctor_profiles')
          .select('full_name')
          .eq('user_id', userId)
          .maybeSingle()

        if (doctorData) {
          set((state) => ({
            session: {
              ...state.session,
              id: userId,
              role: 'doctor',
              fullName: (doctorData as any).full_name,
            },
          }))
          return 'doctor'
        }

        // Try Patient
        const { data: patientData, error: patientError } = await supabase
          .from('patient_profiles')
          .select('full_name')
          .eq('user_id', userId)
          .maybeSingle()

        if (patientData) {
          set((state) => ({
            session: {
              ...state.session,
              id: userId,
              role: 'patient',
              fullName: (patientData as any).full_name,
            },
          }))
          return 'patient'
        }
      } catch (err) {
        console.error('Error fetching user profile in auth store:', err)
      }
      return null
    },
    initialize: () => {
      set({ isLoading: true })
      
      // Get initial session
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const userId = session.user.id
          set((state) => ({
            session: {
              ...state.session,
              id: userId,
              email: session.user.email ?? null,
            },
          }))
          await get().fetchProfile(userId)
        }
        set({ isLoading: false })
      })

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const userId = session.user.id
          set((state) => ({
            session: {
              ...state.session,
              id: userId,
              email: session.user.email ?? null,
            },
          }))
          await get().fetchProfile(userId)
        } else {
          get().clearSession()
        }
        set({ isLoading: false })
      })

      return () => {
        subscription.unsubscribe()
      }
    },
  }
})
