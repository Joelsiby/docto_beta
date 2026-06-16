import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { renderToStream } from '@react-pdf/renderer'
import PrescriptionPDF from '@/lib/pdf/prescription-template'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
  }

  const { data: session, error } = await supabase
    .from('sessions')
    .select(`
      id,
      started_at,
      doctor_notes,
      ai_diagnosis,
      patient_id,
      doctor_id,
      doctor_profiles!sessions_doctor_id_fkey(
        full_name,
        specialization,
        qualifications,
        license_number,
        clinic_name,
        clinic_address
      )
    `)
    .eq('id', sessionId)
    .single()

  if (error || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const sessionData = session as any
  const doctor = sessionData.doctor_profiles

  const { data: patient } = await supabase
    .from('patient_profiles')
    .select('full_name, date_of_birth, gender')
    .eq('id', sessionData.patient_id)
    .single()

  const rxQuery = await supabase
    .from('prescriptions')
    .select('id')
    .eq('session_id', sessionId)
    .single()

  let items: any[] = []
  if (rxQuery.data?.id) {
    const { data: rxItems } = await supabase
      .from('prescription_items')
      .select('*')
      .eq('prescription_id', rxQuery.data.id)
      .order('sort_order', { ascending: true })
    if (rxItems) items = rxItems
  }

  const stream = await renderToStream(
    <PrescriptionPDF
      doctor={{
        full_name: doctor.full_name,
        specialization: doctor.specialization,
        qualifications: doctor.qualifications,
        license_number: doctor.license_number,
        clinic_name: doctor.clinic_name,
        clinic_address: doctor.clinic_address,
      }}
      patient={{
        full_name: patient?.full_name || 'Unknown',
        date_of_birth: patient?.date_of_birth || null,
        gender: patient?.gender || null,
      }}
      items={items.map((item: any) => ({
        id: item.id,
        name: item.medicine_name || item.medication_name || '',
        dosage: item.dosage,
        dosage_unit: item.dosage_unit,
        frequency: item.frequency || item.when_to_take,
        timing: item.timing,
        meal_relation: item.meal_relation,
        quantity_per_dose: item.quantity_per_dose,
        duration_days: item.duration_days,
        notes: item.notes,
      }))}
      diagnosis={sessionData.ai_diagnosis || []}
      doctorNotes={sessionData.doctor_notes}
      sessionDate={sessionData.started_at}
    />
  )

  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk))
  }
  const pdfBuffer = Buffer.concat(chunks)

  const filename = `prescription-${sessionId.slice(0, 8)}.pdf`

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length.toString(),
    },
  })
}
