/**
 * POST /api/session/end
 * Finalizes session — saves transcript, AI extractions, prescriptions to Supabase.
 * Does NOT confirm to patient yet (that's /api/session/submit).
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const {
      sessionId,
      transcript,
      summary,
      patientSummary,
      issues,
      diagnosis,
      referrals,
      lifestyleSuggestions,
      prescriptions,
      doctorNotes,
    } = await req.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Step 1: Update session record
    const { data: session, error: sessionError } = await (supabase as any)
      .from('sessions')
      .update({
        ended_at: new Date().toISOString(),
        transcript: transcript,
        ai_summary: summary,
        patient_summary: patientSummary,
        ai_issues: issues,
        ai_diagnosis: diagnosis,
        ai_referrals: referrals,
        lifestyle_suggestions: lifestyleSuggestions,
        doctor_notes: doctorNotes,
        status: 'ended',
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select('id, patient_id, doctor_id')
      .single()

    if (sessionError) {
      console.error('Session end update error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to update session', details: sessionError.message },
        { status: 500 }
      )
    }

    // Step 2: Create prescription record
    let prescriptionId: string | null = null
    if (prescriptions && prescriptions.length > 0) {
      const { data: prescription, error: rxError } = await (supabase as any)
        .from('prescriptions')
        .insert({
          session_id: sessionId,
          doctor_id: session.doctor_id,
          patient_id: session.patient_id,
          is_confirmed: false,
        })
        .select('id')
        .single()

      if (rxError) {
        console.error('Prescription create error:', rxError)
      } else {
        prescriptionId = prescription.id

        // Step 3: Insert prescription items
        const items = prescriptions.map((rx: any, index: number) => ({
          prescription_id: prescriptionId,
          medicine_name: rx.name,
          dosage: rx.dosage,
          when_to_take: rx.when_to_take || rx.whenToTake,
          timing: rx.timing,
          meal_relation: rx.meal_relation || rx.mealRelation,
          duration_days: rx.duration_days || rx.durationDays,
          notes: rx.notes,
          actions: rx.actions,
          sort_order: index,
        }))

        const { error: itemsError } = await (supabase as any)
          .from('prescription_items')
          .insert(items)

        if (itemsError) {
          console.error('Prescription items insert error:', itemsError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      sessionId,
      prescriptionId,
    })
  } catch (error: any) {
    console.error('Session End API Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to end session' },
      { status: 500 }
    )
  }
}
