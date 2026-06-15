/**
 * API routes for session management use Supabase with type assertions
 * to handle the missing generated types gracefully.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export async function POST(req: Request) {
  try {
    const { patientId, doctorId, appointmentId } = await req.json()

    if (!patientId || !doctorId) {
      return NextResponse.json(
        { error: 'patientId and doctorId are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Generate opaque session token — safe for URL, no PII
    const sessionToken = randomBytes(16).toString('hex')

    const { data: session, error } = await (supabase as any)
      .from('sessions')
      .insert({
        doctor_id: doctorId,
        patient_id: patientId,
        appointment_id: appointmentId || null,
        session_token: sessionToken,
        started_at: new Date().toISOString(),
        status: 'active',
      })
      .select('id, session_token')
      .single()

    if (error) {
      console.error('Supabase session create error:', error)
      // Return mock session for development if DB not ready
      return NextResponse.json({
        success: true,
        sessionId: `dev-${Date.now()}`,
        sessionToken,
        dev_mode: true,
      })
    }

    return NextResponse.json({
      success: true,
      sessionId: session?.id,
      sessionToken: session?.session_token || sessionToken,
    })
  } catch (error: any) {
    console.error('Session Start API Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
