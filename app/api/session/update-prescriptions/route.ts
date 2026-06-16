import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const { prescriptionId, prescriptions } = await req.json()

    if (!prescriptionId || !prescriptions || !Array.isArray(prescriptions)) {
      return NextResponse.json(
        { error: 'prescriptionId and prescriptions array are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Delete existing prescription items for this prescription
    const { error: deleteError } = await (supabase as any)
      .from('prescription_items')
      .delete()
      .eq('prescription_id', prescriptionId)

    if (deleteError) {
      console.error('Failed to delete old prescription items:', deleteError)
      return NextResponse.json(
        { error: 'Failed to update prescriptions', details: deleteError.message },
        { status: 500 }
      )
    }

    // Insert updated prescription items (camelCase from store → snake_case for DB)
    const items = prescriptions.map((rx: any, index: number) => {
      const whenToTake: string[] = rx.whenToTake || rx.when_to_take || ['morning']
      const frequencyStr = whenToTake
        .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' '))
        .join(' + ')

      return {
        prescription_id: prescriptionId,
        medicine_name: rx.name,
        medication_name: rx.name,
        dosage: rx.dosage || null,
        frequency: frequencyStr,
        when_to_take: whenToTake,
        timing: rx.timing || [],
        meal_relation: rx.mealRelation || rx.meal_relation || 'any',
        duration_days: rx.durationDays || rx.duration_days || 7,
        notes: rx.notes || null,
        actions: rx.actions || null,
        sort_order: index,
      }
    })

    const { error: insertError } = await (supabase as any)
      .from('prescription_items')
      .insert(items)

    if (insertError) {
      console.error('Failed to insert updated prescription items:', insertError)
      return NextResponse.json(
        { error: 'Failed to update prescriptions', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: items.length,
    })
  } catch (error: any) {
    console.error('Update Prescriptions API Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to update prescriptions' },
      { status: 500 }
    )
  }
}
