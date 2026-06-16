const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://lsukzhtngurykpgdstyn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdUk6bHlzdWt6aHRuZ3VyeWtwZ2RzdHluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDkxMzExNywiZXhwIjoyMDk2NDg5MTE3fQ.CfpzYZxemWk861MJdnOFNVFeToch4WkiPaj4FfYCjcY', // wait, let's get the exact service role key from diagnose-joel.js
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdWt6aHRuZ3VyeWtwZ2RzdHluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDkxMzExNywiZXhwIjoyMDk2NDg5MTE3fQ.CfpzYZxemWk861MJdnOFNVFeToch4WkiPaj4FfYCjcY'

const client = createClient(
  'https://lsukzhtngurykpgdstyn.supabase.co',
  serviceRoleKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function cleanup() {
  const sessionId = 'ea9af5a1-cf0b-4d87-84b7-2fb85213ff24'
  console.log('Cleaning up session:', sessionId)
  
  // Clean up medication schedule
  const { data: schedData, error: schedErr } = await client
    .from('medication_schedule')
    .delete()
    .eq('session_id', sessionId)
  if (schedErr) console.error('Schedule delete error:', schedErr)
  else console.log('Deleted medication schedules')

  // Clean up prescription items
  const { data: itemsData, error: itemsErr } = await client
    .from('prescription_items')
    .delete()
    .eq('prescription_id', '6ccf3dd5-d454-4c3b-bad5-f4bd3d0f70d6')
  if (itemsErr) console.error('Items delete error:', itemsErr)
  else console.log('Deleted prescription items')

  // Clean up prescriptions
  const { data: rxData, error: rxErr } = await client
    .from('prescriptions')
    .delete()
    .eq('session_id', sessionId)
  if (rxErr) console.error('Prescriptions delete error:', rxErr)
  else console.log('Deleted prescriptions')

  // Clean up session
  const { data: sessData, error: sessErr } = await client
    .from('sessions')
    .delete()
    .eq('id', sessionId)
  if (sessErr) console.error('Session delete error:', sessErr)
  else console.log('Deleted session')

  console.log('Cleanup completed.')
}

cleanup().catch(console.error)
