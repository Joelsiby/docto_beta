import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'json'
    const targetPatientId = searchParams.get('patientId')

    let patientId = targetPatientId

    // If a specific patientId is requested, verify the caller is a doctor (or the patient themselves)
    let dbClient = supabase
    if (targetPatientId) {
      const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (doctorProfile) {
        // Caller is a doctor. We use the service role key to bypass RLS for this specific read operation
        // (Alternatively, we could set up complex RLS policies, but this is secure for MVP)
        const { createClient: createAdminClient } = await import('@supabase/supabase-js')
        dbClient = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        ) as any
      } else {
        // Not a doctor, ensure they are requesting their own
        const { data: myProfile }: { data: any } = await supabase.from('patient_profiles').select('id').eq('user_id', user.id).maybeSingle()
        if (!myProfile || myProfile.id !== targetPatientId) {
          return NextResponse.json({ error: 'Unauthorized to export this patient data' }, { status: 403 })
        }
      }
    } else {
      // Default to the caller's own patient profile
      const { data: myProfile }: { data: any } = await supabase.from('patient_profiles').select('id').eq('user_id', user.id).maybeSingle()
      if (!myProfile) return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
      patientId = myProfile.id
    }

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
    }

    // Fetch Patient Profile using the determined dbClient
    const { data: profile, error: profileError }: { data: any, error: any } = await dbClient
      .from('patient_profiles')
      .select('*')
      .eq('id', patientId)
      .maybeSingle()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    patientId = profile.id

    // Fetch Prescriptions & Prescription Items
    const { data: prescriptions, error: prescrError }: { data: any, error: any } = await dbClient
      .from('prescriptions')
      .select(`
        id,
        created_at,
        total_fee,
        is_confirmed,
        prescription_items (
          id,
          medicine_name,
          dosage,
          duration_days,
          meal_relation,
          notes
        )
      `)
      .eq('patient_id', patientId as string)
      .order('created_at', { ascending: false })

    // Fetch Health Reports
    const { data: reports, error: reportsError }: { data: any, error: any } = await dbClient
      .from('health_reports')
      .select('*')
      .eq('patient_id', patientId as string)
      .order('created_at', { ascending: false })

    // Fetch Medication Streaks
    const { data: streaks, error: streaksError }: { data: any, error: any } = await dbClient
      .from('medication_streaks')
      .select('*')
      .eq('patient_id', patientId as string)
      .maybeSingle()

    if (format === 'csv') {
      // Generate CSV of medications
      let csvContent = 'Date,Prescription ID,Medicine Name,Dosage,Duration (Days),Meal Relation,Notes\n'
      prescriptions?.forEach((p: any) => {
        const date = new Date(p.created_at).toLocaleDateString()
        p.prescription_items?.forEach((item: any) => {
          csvContent += `"${date}","${p.id}","${item.medicine_name}","${item.dosage}","${item.duration_days || ''}","${item.meal_relation || ''}","${item.notes || ''}"\n`
        })
      })

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="docto_medication_history_${patientId}.csv"`,
        },
      })
    }

    if (format === 'fhir') {
      // Generate HL7 FHIR R4 Bundle Resource
      const fhirBundle = {
        resourceType: 'Bundle',
        id: `bundle-${patientId}`,
        type: 'document',
        timestamp: new Date().toISOString(),
        entry: [
          // Patient Resource
          {
            fullUrl: `urn:uuid:${patientId}`,
            resource: {
              resourceType: 'Patient',
              id: patientId,
              active: true,
              name: [
                {
                  use: 'official',
                  text: profile.full_name,
                },
              ],
              gender: profile.gender ? profile.gender.toLowerCase() : 'unknown',
              birthDate: profile.date_of_birth,
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/patient-bloodGroup',
                  valueString: profile.blood_group || 'Unknown',
                },
              ],
            },
          },
          // MedicationRequest Resources
          ...(prescriptions || []).flatMap((p: any) =>
            (p.prescription_items || []).map((item: any) => ({
              fullUrl: `urn:uuid:${item.id}`,
              resource: {
                resourceType: 'MedicationRequest',
                id: item.id,
                status: p.is_confirmed ? 'active' : 'draft',
                intent: 'order',
                medicationCodeableConcept: {
                  text: item.medicine_name,
                },
                subject: {
                  reference: `Patient/${patientId}`,
                },
                authoredOn: p.created_at,
                dosageInstruction: [
                  {
                    text: `${item.dosage} - ${item.meal_relation || ''}`,
                    additionalInstruction: item.notes ? [{ text: item.notes }] : [],
                  },
                ],
              },
            }))
          ),
          // DiagnosticReport & Observation Resources from Health Reports
          ...(reports || []).flatMap((r: any) => [
            {
              fullUrl: `urn:uuid:${r.id}`,
              resource: {
                resourceType: 'DiagnosticReport',
                id: r.id,
                status: r.status === 'analyzed' ? 'final' : 'partial',
                code: {
                  text: r.report_type || 'General Lab Panel',
                },
                subject: {
                  reference: `Patient/${patientId}`,
                },
                effectiveDateTime: r.created_at,
                issued: r.analyzed_at || r.created_at,
                conclusion: r.ai_analysis?.overall_summary || 'Uploaded report',
              },
            },
            ...(r.flagged_parameters || []).map((param: any, idx: number) => ({
              fullUrl: `urn:uuid:${r.id}-obs-${idx}`,
              resource: {
                resourceType: 'Observation',
                id: `${r.id}-obs-${idx}`,
                status: 'final',
                code: {
                  text: param.parameter || param.name || 'Lab Parameter',
                },
                subject: {
                  reference: `Patient/${patientId}`,
                },
                valueQuantity: {
                  value: parseFloat(param.value) || null,
                  unit: param.unit || '',
                },
                interpretation: [
                  {
                    coding: [
                      {
                        system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                        code: 'H',
                        display: 'High',
                      },
                    ],
                    text: param.explanation || 'Flagged parameter',
                  },
                ],
              },
            })),
          ]),
        ],
      }

      return new NextResponse(JSON.stringify(fhirBundle, null, 2), {
        headers: {
          'Content-Type': 'application/fhir+json',
          'Content-Disposition': `attachment; filename="docto_fhir_records_${patientId}.json"`,
        },
      })
    }

    // Default JSON raw download
    const exportData = {
      exportedAt: new Date().toISOString(),
      patientProfile: profile,
      prescriptions,
      healthReports: reports,
      medicationStreaks: streaks,
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="docto_health_records_${patientId}.json"`,
      },
    })
  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}
