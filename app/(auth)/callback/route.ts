import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect destination
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error, data: { user } } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      // Fetch user profile to see if doctor or patient
      const { data: doctor } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (doctor) {
        return NextResponse.redirect(`${origin}/doctor/planner`)
      }

      const { data: patient } = await supabase
        .from('patient_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (patient) {
        return NextResponse.redirect(`${origin}/patient/dashboard`)
      }

      // If user has no profile, it might be a new registration, redirect to finish profile or default
      const forwardUrl = searchParams.get('next')
      if (forwardUrl) {
        return NextResponse.redirect(`${origin}${forwardUrl}`)
      }
      
      return NextResponse.redirect(`${origin}/`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not exchange token`)
}
