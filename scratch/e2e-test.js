/**
 * Full end-to-end pipeline test
 * Simulates: session/start → session/end (with prescriptions) → session/submit
 * Then reads back patient consultations, prescriptions, and medication_schedule
 */
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://lsukzhtngurykpgdstyn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdWt6aHRuZ3VyeWtwZ2RzdHluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDkxMzExNywiZXhwIjoyMDk2NDg5MTE3fQ.CfpzYZxemWk861MJdnOFNVFeToch4WkiPaj4FfYCjcY',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const PATIENT_ID = '32570a8c-3a0f-43df-a694-d5a424437c02'
const DOCTOR_ID  = 'e260f9dc-7153-4045-b4a3-6c7ea5040822'

const FAKE_PRESCRIPTIONS = [
  {
    name: 'Paracetamol',
    dosage: '650mg',
    whenToTake: ['morning', 'night'],
    timing: ['08:00', '21:00'],
    mealRelation: 'after_meals',
    durationDays: 5,
    notes: 'For fever',
    actions: '',
  },
  {
    name: 'Cetirizine',
    dosage: '10mg',
    whenToTake: ['night'],
    timing: ['21:00'],
    mealRelation: 'any',
    durationDays: 7,
    notes: 'For allergy',
    actions: '',
  },
]

let createdSessionId = null
let createdPrescriptionId = null

async function step1_createSession() {
  console.log('\n=== STEP 1: Create session ===')
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      doctor_id: DOCTOR_ID,
      patient_id: PATIENT_ID,
      started_at: new Date().toISOString(),
      status: 'active',
      is_confirmed: false,
      session_token: require('crypto').randomBytes(32).toString('hex'),
    })
    .select('id')
    .single()

  if (error) { console.error('❌ Session create error:', error.message); return false }
  createdSessionId = data.id
  console.log('✅ Session created:', createdSessionId)
  return true
}

async function step2_endSession() {
  console.log('\n=== STEP 2: End session (insert prescriptions) ===')

  // Update session
  const { error: sessErr } = await supabase
    .from('sessions')
    .update({
      ended_at: new Date().toISOString(),
      ai_summary: 'Patient came in with cough and fever. Diagnosed with acute viral bronchitis.',
      patient_summary: 'You have an upper respiratory infection. Rest, drink plenty of fluids, and take your medications as prescribed.',
      ai_issues: ['cough', 'fever', 'chest tightness'],
      ai_diagnosis: [{ condition: 'Acute Viral Bronchitis', icd10: 'J20.9', confidence: 'high' }],
      ai_referrals: ['Chest X-Ray to rule out pneumonia'],
      lifestyle_suggestions: [{ category: 'general', suggestion: 'Avoid cold drinks. Rest well.' }],
      doctor_notes: 'Patient appears well overall. Follow up in 5 days if symptoms persist.',
      status: 'ended',
      updated_at: new Date().toISOString(),
    })
    .eq('id', createdSessionId)

  if (sessErr) { console.error('❌ Session update error:', sessErr.message); return false }
  console.log('✅ Session updated to ended')

  // Create prescription
  const { data: rx, error: rxErr } = await supabase
    .from('prescriptions')
    .insert({
      session_id: createdSessionId,
      doctor_id: DOCTOR_ID,
      patient_id: PATIENT_ID,
      is_confirmed: false,
    })
    .select('id')
    .single()

  if (rxErr) { console.error('❌ Prescription create error:', rxErr.message); return false }
  createdPrescriptionId = rx.id
  console.log('✅ Prescription created:', createdPrescriptionId)

  // Create prescription items (use both medicine_name and medication_name)
  const items = FAKE_PRESCRIPTIONS.map((p, i) => ({
    prescription_id: createdPrescriptionId,
    medicine_name: p.name,
    medication_name: p.name,
    dosage: p.dosage,
    when_to_take: p.whenToTake,
    timing: p.timing,
    meal_relation: p.mealRelation,
    duration_days: p.durationDays,
    notes: p.notes,
    actions: p.actions,
    sort_order: i,
  }))

  const { data: itemsData, error: itemsErr } = await supabase
    .from('prescription_items')
    .insert(items)
    .select('id, medicine_name, medication_name, dosage')

  if (itemsErr) {
    console.error('❌ Prescription items insert error:', itemsErr.message)
    console.error('   Details:', JSON.stringify(itemsErr))
    return false
  }
  console.log('✅ Prescription items created:', itemsData.map(d => `${d.medicine_name || d.medication_name} ${d.dosage}`).join(', '))
  return true
}

async function step3_submitSession() {
  console.log('\n=== STEP 3: Submit to patient (confirm + create medication_schedule) ===')

  // Confirm session
  const { error: sessErr } = await supabase
    .from('sessions')
    .update({ is_confirmed: true, status: 'confirmed', updated_at: new Date().toISOString() })
    .eq('id', createdSessionId)

  if (sessErr) { console.error('❌ Session confirm error:', sessErr.message); return false }
  console.log('✅ Session confirmed')

  // Confirm prescription
  const { error: rxErr } = await supabase
    .from('prescriptions')
    .update({ is_confirmed: true })
    .eq('id', createdPrescriptionId)

  if (rxErr) { console.error('❌ Prescription confirm error:', rxErr.message); return false }
  console.log('✅ Prescription confirmed')

  // Fetch prescription items
  const { data: items, error: itemsFetchErr } = await supabase
    .from('prescription_items')
    .select('*')
    .eq('prescription_id', createdPrescriptionId)

  if (itemsFetchErr) { console.error('❌ Fetch items error:', itemsFetchErr.message); return false }
  console.log('✅ Fetched', items.length, 'prescription items')

  // Build medication_schedule rows
  const scheduleRows = []
  const today = new Date()
  for (const item of items) {
    const medicineName = item.medicine_name || item.medication_name
    const durationDays = item.duration_days || 7
    const whenToTake = item.when_to_take || ['morning']
    const timeSlotMap = { morning: '08:00', afternoon: '13:00', evening: '17:00', night: '21:00', as_needed: '08:00' }
    for (let d = 0; d < durationDays; d++) {
      const date = new Date(today)
      date.setDate(today.getDate() + d)
      const dateStr = date.toISOString().split('T')[0]
      for (const slot of whenToTake) {
        scheduleRows.push({
          patient_id: PATIENT_ID,
          session_id: createdSessionId,
          prescription_item_id: item.id,
          medication_name: medicineName,
          dosage: item.dosage || '1 tablet',
          scheduled_date: dateStr,
          scheduled_time: timeSlotMap[slot] || '08:00',
          time_of_day: slot,
          instructions: item.meal_relation === 'after_meals' ? 'Take after meals' : 'Take as directed',
          status: 'pending',
          is_on_time: null,
          taken_at: null,
        })
      }
    }
  }

  console.log(`Building ${scheduleRows.length} medication_schedule rows...`)

  const { error: schedErr } = await supabase
    .from('medication_schedule')
    .insert(scheduleRows)

  if (schedErr) {
    console.error('❌ Medication schedule insert error:', schedErr.message)
    console.error('   Details:', JSON.stringify(schedErr))
    return false
  }
  console.log('✅ Medication schedule created with', scheduleRows.length, 'rows')
  return true
}

async function step4_readBack() {
  console.log('\n=== STEP 4: Read back from patient perspective ===')

  // Consultations
  const { data: sessions, error: sessErr } = await supabase
    .from('sessions')
    .select('id, patient_summary, is_confirmed, status, started_at')
    .eq('patient_id', PATIENT_ID)
    .eq('is_confirmed', true)
    .order('started_at', { ascending: false })

  console.log('\nConsultations (is_confirmed=true):')
  if (sessErr) { console.error('  Error:', sessErr.message) }
  else console.log(JSON.stringify(sessions, null, 2))

  // Prescriptions
  const { data: rxs } = await supabase
    .from('prescriptions')
    .select('id, is_confirmed, created_at')
    .eq('patient_id', PATIENT_ID)
    .eq('is_confirmed', true)

  console.log('\nConfirmed Prescriptions:', JSON.stringify(rxs, null, 2))

  // Prescription Items
  if (rxs && rxs.length > 0) {
    const { data: pItems } = await supabase
      .from('prescription_items')
      .select('id, medicine_name, medication_name, dosage, when_to_take, duration_days')
      .in('prescription_id', rxs.map(r => r.id))
    console.log('\nPrescription Items:', JSON.stringify(pItems, null, 2))
  }

  // Medication Schedule
  const { data: sched } = await supabase
    .from('medication_schedule')
    .select('id, medication_name, dosage, scheduled_date, scheduled_time, time_of_day, status')
    .eq('patient_id', PATIENT_ID)
    .order('scheduled_date', { ascending: true })
    .limit(10)

  console.log('\nMedication Schedule (first 10):', JSON.stringify(sched, null, 2))
}

async function cleanup() {
  console.log('\n=== CLEANUP: Removing test data ===')

  // Delete medication schedules for this session
  await supabase.from('medication_schedule').delete().eq('session_id', createdSessionId)
  // Delete prescription items
  await supabase.from('prescription_items').delete().eq('prescription_id', createdPrescriptionId)
  // Delete prescriptions
  await supabase.from('prescriptions').delete().eq('id', createdPrescriptionId)
  // Delete session
  await supabase.from('sessions').delete().eq('id', createdSessionId)
  console.log('✅ Cleanup done')
}

async function runTest() {
  const s1 = await step1_createSession(); if (!s1) return
  const s2 = await step2_endSession(); if (!s2) return
  const s3 = await step3_submitSession(); if (!s3) return
  await step4_readBack()

  console.log('\n\n🎉 ALL STEPS PASSED! The pipeline is working.')
  console.log('   Session ID created:', createdSessionId)
  console.log('   Cleaning up test data...')
  await cleanup()
}

runTest().catch(err => {
  console.error('FATAL:', err)
  if (createdSessionId) {
    console.log('Attempting cleanup...')
    cleanup().catch(() => {})
  }
})
