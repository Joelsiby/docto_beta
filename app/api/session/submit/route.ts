/**
 * POST /api/session/submit
 * Doctor confirms and submits session data to patient's record.
 * Marks session as 'confirmed', marks prescription as confirmed.
 * Future: triggers patient notification.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { sessionId, prescriptionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Mark session as confirmed
    const { error: sessionError } = await (supabase as any)
      .from('sessions')
      .update({
        is_confirmed: true,
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    if (sessionError) {
      console.error('Session confirm error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to confirm session', details: sessionError.message },
        { status: 500 }
      )
    }

    // Mark prescription as confirmed
    if (prescriptionId) {
      const { error: rxError } = await (supabase as any)
        .from('prescriptions')
        .update({ is_confirmed: true })
        .eq('id', prescriptionId)

      if (rxError) {
        console.error('Prescription confirm error:', rxError)
      }
    }

    // TODO: Trigger patient notification (push/email/SMS) — Phase 2
    // await notifyPatient(patientId, sessionId)

    return NextResponse.json({
      success: true,
      message: 'Session confirmed and saved to patient record.',
    })
  } catch (error: any) {
    console.error('Session Submit API Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to submit session' },
      { status: 500 }
    )
  }
}
