const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://lsukzhtngurykpgdstyn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdWt6aHRuZ3VyeWtwZ2RzdHluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDkxMzExNywiZXhwIjoyMDk2NDg5MTE3fQ.CfpzYZxemWk861MJdnOFNVFeToch4WkiPaj4FfYCjcY',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function diagnose() {
  console.log('\n=== QUERY 1: Joel patient profile ===')
  // Get patient_profiles linked to Joel's email via user_id
  const { data: profiles, error: profileErr } = await supabase
    .from('patient_profiles')
    .select('id, user_id, full_name')

  if (profileErr) { console.error('profile error:', profileErr); return }
  console.log('All patient profiles:', JSON.stringify(profiles, null, 2))

  // Check auth users for Joel's email using admin API
  const { data: { users }, error: usersErr } = await supabase.auth.admin.listUsers()
  if (usersErr) { console.error('users error:', usersErr); return }
  const joel = users.find(u => u.email === 'joellsiby@gmail.com')
  console.log('\nJoel auth user:', joel ? { id: joel.id, email: joel.email } : 'NOT FOUND')

  if (!joel) return

  const joelProfile = profiles.find(p => p.user_id === joel.id)
  console.log('Joel patient profile:', joelProfile || 'NOT FOUND')

  if (!joelProfile) {
    console.log('\n⚠️  PROBLEM: Joel has no patient_profiles row — this is why nothing shows!')
    return
  }

  const patientId = joelProfile.id

  console.log('\n=== QUERY 2: Sessions for Joel ===')
  const { data: sessions, error: sessErr } = await supabase
    .from('sessions')
    .select('id, patient_id, is_confirmed, status, started_at, ended_at')
    .eq('patient_id', patientId)
    .order('started_at', { ascending: false })
  console.log('Sessions error:', sessErr?.message || 'none')
  console.log('Sessions:', JSON.stringify(sessions, null, 2))

  console.log('\n=== QUERY 3: Prescriptions for Joel ===')
  const { data: rxs, error: rxErr } = await supabase
    .from('prescriptions')
    .select('id, session_id, patient_id, is_confirmed, created_at')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
  console.log('Prescriptions error:', rxErr?.message || 'none')
  console.log('Prescriptions:', JSON.stringify(rxs, null, 2))

  if (rxs && rxs.length > 0) {
    console.log('\n=== QUERY 4: Prescription Items ===')
    const { data: items, error: itemErr } = await supabase
      .from('prescription_items')
      .select('id, medicine_name, dosage, when_to_take, duration_days')
      .in('prescription_id', rxs.map(r => r.id))
    console.log('Items error:', itemErr?.message || 'none')
    console.log('Items:', JSON.stringify(items, null, 2))
  }

  console.log('\n=== QUERY 5: Medication Schedule ===')
  const { data: schedule, error: schedErr } = await supabase
    .from('medication_schedule')
    .select('id, medication_name, dosage, scheduled_date, scheduled_time, status')
    .eq('patient_id', patientId)
    .order('scheduled_date', { ascending: true })
    .limit(10)
  console.log('Schedule error:', schedErr?.message || 'none')
  console.log('Schedule:', JSON.stringify(schedule, null, 2))
}

diagnose().catch(console.error)
