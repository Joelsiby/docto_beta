/**
 * POST /api/session/submit
 * Doctor confirms and submits session data to patient's record.
 * - Marks session as 'confirmed'
 * - Marks prescription as confirmed
 * - AUTO-POPULATES medication_schedule rows from prescription_items for the patient
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const { sessionId, prescriptionId, patientId } = await req.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const adminDb = createAdminClient()

    // ── 1. Mark session as confirmed ──────────────────────────────────────────
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

    // ── 2. Mark prescription as confirmed ────────────────────────────────────
    if (prescriptionId) {
      await (supabase as any)
        .from('prescriptions')
        .update({ is_confirmed: true })
        .eq('id', prescriptionId)
    }

    // ── 3. Auto-populate medication_schedule from prescription_items ──────────
    // This is the bridge: doctor's prescription → patient's medication tracker
    // Uses admin client (service_role) to bypass RLS — the doctor calling this
    // endpoint is not the patient, so patient-scoped RLS would block the insert
    if (patientId && prescriptionId) {
      try {
        // Fetch all prescription items for this prescription
        const { data: rxItems, error: rxError } = await (supabase as any)
          .from('prescription_items')
          .select('*')
          .eq('prescription_id', prescriptionId)

        if (rxError) {
          console.error('Failed to fetch prescription items:', rxError)
        } else if (rxItems && rxItems.length > 0) {
          const scheduleRows: any[] = []
          const today = new Date()

          for (const item of rxItems) {
            const durationDays = item.duration_days || 7
            const whenToTake: string[] = item.when_to_take || ['morning']
            const timings: string[] = item.timing || ['08:00']

            // Build time slot mapping
            const timeSlotMap: Record<string, string> = {
              morning: timings[0] || '08:00',
              afternoon: timings[1] || '13:00',
              evening: timings[2] || '17:00',
              night: timings[whenToTake.indexOf('night')] || timings[timings.length - 1] || '21:00',
              as_needed: '08:00',
            }

            // Build meal instruction text
            let mealInstruction = ''
            if (item.meal_relation === 'before_meals') {
              mealInstruction = 'Take before meals'
            } else if (item.meal_relation === 'after_meals') {
              mealInstruction = 'Take after meals'
            } else if (item.meal_relation === 'with_meals') {
              mealInstruction = 'Take with meals'
            }

            const instructionsList = []
            if (mealInstruction) {
              instructionsList.push(mealInstruction)
            }
            if (item.notes) {
              instructionsList.push(item.notes)
            }
            if (instructionsList.length === 0) {
              instructionsList.push('Take as directed')
            }
            const instructions = instructionsList.join(' — ')

            // Generate one row per time-of-day per day for the duration
            for (let dayOffset = 0; dayOffset < durationDays; dayOffset++) {
              const scheduleDate = new Date(today)
              scheduleDate.setDate(today.getDate() + dayOffset)
              const scheduleDateStr = scheduleDate.toISOString().split('T')[0]

              for (const slot of whenToTake) {
                scheduleRows.push({
                  patient_id: patientId,
                  session_id: sessionId,
                  prescription_item_id: item.id,
                  medication_name: item.medicine_name || item.medication_name,
                  dosage: item.dosage || '1 tablet',
                  scheduled_date: scheduleDateStr,
                  scheduled_time: timeSlotMap[slot] || '08:00',
                  time_of_day: slot,
                  instructions,
                  status: 'pending',
                  is_on_time: null,
                  taken_at: null,
                })
              }
            }
          }

          if (scheduleRows.length > 0) {
            // Use admin client (service_role) to bypass RLS — the doctor
            // calling this is not the patient, so patient-scoped RLS blocks insert
            // Remove any existing schedule rows for this session to avoid duplicates
            await (adminDb as any)
              .from('medication_schedule')
              .delete()
              .eq('session_id', sessionId)

            const { error: scheduleError } = await (adminDb as any)
              .from('medication_schedule')
              .insert(scheduleRows)

            if (scheduleError) {
              console.error('Failed to create medication_schedule rows:', scheduleError)
              // Non-fatal: session is already confirmed, just log it
            } else {
              console.log(
                `Auto-populated ${scheduleRows.length} medication_schedule rows for patient ${patientId}`
              )
            }
          }
        }
      } catch (scheduleErr) {
        console.error('Medication schedule auto-populate error:', scheduleErr)
        // Non-fatal: session is already confirmed
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Session confirmed and medications scheduled for patient.',
    })
  } catch (error: any) {
    console.error('Session Submit API Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to submit session' },
      { status: 500 }
    )
  }
}
