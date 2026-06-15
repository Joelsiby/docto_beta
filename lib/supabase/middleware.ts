import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session — important for Server Components
  let user = null
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser
  } catch (err) {
    console.error('Supabase auth error in middleware:', err)
  }

  // Redirect requests to deprecated /doctor/dashboard to /doctor/planner
  if (request.nextUrl.pathname === '/doctor/dashboard') {
    const url = request.nextUrl.clone()
    url.pathname = '/doctor/planner'
    return NextResponse.redirect(url)
  }

  // Protect doctor and patient routes
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register')
  const isDoctorRoute = request.nextUrl.pathname.startsWith('/doctor')
  const isPatientRoute = request.nextUrl.pathname.startsWith('/patient')

  if (!user && (isDoctorRoute || isPatientRoute)) {
    // TEMPORARY BYPASS: Allow access to doctor/patient routes without auth for Phase 3 dev
    // const url = request.nextUrl.clone()
    // url.pathname = '/login'
    // url.searchParams.set('redirect', request.nextUrl.pathname)
    // return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    
    // Check if user has a doctor profile
    let doctorProfile = null
    try {
      const { data } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      doctorProfile = data
    } catch (err) {
      console.error('Error querying doctor profile in middleware:', err)
    }

    if (doctorProfile) {
      url.pathname = '/doctor/planner'
    } else {
      url.pathname = '/patient/dashboard'
    }
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
