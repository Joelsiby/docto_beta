'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, FileText, Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PrescriptionTable } from '@/components/doctor/prescription-table'
import { useSessionStore } from '@/stores/session-store'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SessionReviewPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.patientId as string
  const supabase = createClient()

  const { 
    summary, 
    diagnosis, 
    issues, 
    referrals, 
    prescriptions,
    clearSession 
  } = useSessionStore()

  const [patientName, setPatientName] = useState('Rahul Kumar')
  const [doctorId, setDoctorId] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    // Get patient details
    supabase.from('patient_profiles')
      .select('full_name')
      .eq('id', patientId)
      .maybeSingle()
      .then(({ data }: { data: any }) => {
        if (data) setPatientName(data.full_name)
      })

    // Get doctor profile
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('doctor_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()
          .then(({ data }: { data: any }) => {
            if (data) setDoctorId(data.id)
          })
      }
    })
  }, [patientId])

  const handleSendToPatient = async () => {
    if (!doctorId) {
      alert("Doctor profile not found.")
      return
    }

    setIsSending(true)
    try {
      // 1. Create a session record in Supabase
      const { data: sessionData, error: sessionError }: { data: any, error: any } = await supabase
        .from('sessions')
        .insert({
          doctor_id: doctorId,
          patient_id: patientId,
          status: 'completed',
          transcript: '', // can be populated if saved in store
          summary: summary || 'Routine clinical session completed.',
          clinical_notes: {
            issues,
            diagnosis,
            referrals,
          }
        } as any)
        .select()
        .single()

      if (sessionError) throw sessionError

      // 2. Create prescription record in Supabase
      if (prescriptions.length > 0 && sessionData) {
        const { data: rxData, error: rxError }: { data: any, error: any } = await supabase
          .from('prescriptions')
          .insert({
            session_id: sessionData.id,
            doctor_id: doctorId,
            patient_id: patientId,
            diagnosis: diagnosis.map((d: any) => `${d.condition} (${d.icd10})`).join(', '),
            notes: referrals.join('. ')
          } as any)
          .select()
          .single()

        if (rxError) throw rxError

        // 3. Create prescription items
        const itemsToInsert = prescriptions.map((p: any) => {
          const whenToTake: string[] = p.whenToTake || p.when_to_take || ['as directed']
          const frequencyStr = whenToTake
            .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' '))
            .join(' + ')
          return {
            prescription_id: rxData.id,
            medication_name: p.name,
            medicine_name: p.name,
            frequency: frequencyStr,
            dosage: p.dosage || null,
            when_to_take: whenToTake,
            timing: p.timing || null,
            meal_relation: p.mealRelation || p.meal_relation || 'any',
            duration_days: p.durationDays || p.duration_days || 7,
            notes: p.notes || null,
          }
        })

        const { error: itemsError } = await supabase
          .from('prescription_items')
          .insert(itemsToInsert as any)

        if (itemsError) throw itemsError

        // 4. Populate medication_schedule for patient's daily/weekly tasks
        const submitRes = await fetch('/api/session/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionData.id,
            prescriptionId: rxData.id,
            patientId,
          }),
        })
        if (!submitRes.ok) {
          console.error('Medication schedule population failed:', await submitRes.text())
        }
      }

      alert("Clinical findings and prescription successfully sent to patient profile!")
      clearSession()
      router.push('/doctor/appointments')
    } catch (err: any) {
      console.error("Error sending session to patient:", err)
      alert("Error saving session record: " + (err?.message || err))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/doctor/session/${patientId}`}><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-headline-md font-bold text-on-surface">Review & Diagnosis</h1>
            <p className="text-body-sm text-on-surface-variant flex items-center gap-2">
              Patient: <span className="font-semibold text-primary">{patientName}</span>
              <span>•</span>
              Session Completed
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="success" 
            className="gap-2" 
            onClick={handleSendToPatient}
            disabled={isSending}
          >
            <CheckCircle2 className="h-4 w-4" /> 
            {isSending ? "Sending..." : "Send to Patient"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: AI Diagnosis & Summary */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="elevation-1">
            <CardHeader className="border-b border-outline-variant bg-surface-container-lowest">
              <CardTitle className="text-lg">AI Session Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-on-surface leading-relaxed text-gray-700">
                {summary || "No summary generated. Run 'Extract AI Insights' in the session workspace first."}
              </p>
            </CardContent>
          </Card>

          <Card className="elevation-1">
            <CardHeader className="border-b border-outline-variant bg-surface-container-lowest flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Diagnosis Details</CardTitle>
              <Badge variant="success">Auto-Extracted</Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase text-on-surface-variant mb-2">Diagnosed Conditions</h4>
                {diagnosis.length === 0 ? (
                  <p className="text-sm text-gray-500">No diagnoses extracted.</p>
                ) : (
                  <div className="space-y-2">
                    {diagnosis.map((d, i) => (
                      <div key={i} className="flex items-center justify-between bg-surface-container-low p-3 rounded-md border text-black">
                        <span className="font-medium">{d.condition}</span>
                        <Badge variant="outline">{d.icd10 || 'N/A'}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="text-xs font-semibold uppercase text-on-surface-variant mb-2">Symptoms & Issues</h4>
                {issues.length === 0 ? (
                  <p className="text-sm text-gray-500">No issues extracted.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {issues.map((issue, i) => (
                      <Badge key={i} variant="secondary" className="px-3 py-1 text-xs">
                        {issue}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="elevation-1">
            <CardHeader className="border-b border-outline-variant bg-surface-container-lowest">
              <CardTitle className="text-lg">Advice & Referrals</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {referrals.length === 0 ? (
                <p className="text-sm text-gray-500">No advice/referrals generated.</p>
              ) : (
                <ul className="list-disc pl-5 text-sm space-y-2 text-on-surface text-gray-800">
                  {referrals.map((ref, i) => (
                    <li key={i}>{ref}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Middle/Right Column: Prescriptions */}
        <div className="xl:col-span-2 space-y-6">
          <PrescriptionTable />
          
          {/* Prescription Preview (Stub) */}
          <Card className="elevation-1 overflow-hidden">
            <CardHeader className="border-b border-outline-variant bg-surface flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Prescription Preview</CardTitle>
              </div>
              <Button size="sm" variant="outline" className="gap-2" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print
              </Button>
            </CardHeader>
            <CardContent className="bg-surface-container-lowest p-8 flex items-center justify-center min-h-[400px]">
              <div className="text-center text-on-surface-variant">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-20 text-gray-400" />
                <h4 className="font-semibold text-gray-700 mb-1">Prescription Form Generated</h4>
                <p className="text-sm text-gray-500 max-w-sm">
                  Ready to send to patient or print. You can review the details on the left panels or click 'Send to Patient' to save it permanently.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
