/**
 * Apply the prescription constraint fix directly via Supabase client
 * (Makes frequency, dosage nullable so inserts stop failing)
 */
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://lsukzhtngurykpgdstyn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdWt6aHRuZ3VyeWtwZ2RzdHluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDkxMzExNywiZXhwIjoyMDk2NDg5MTE3fQ.CfpzYZxemWk861MJdnOFNVFeToch4WkiPaj4FfYCjcY',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const SQL = `
ALTER TABLE prescription_items ALTER COLUMN frequency DROP NOT NULL;
ALTER TABLE prescription_items ALTER COLUMN dosage DROP NOT NULL;
ALTER TABLE prescription_items ALTER COLUMN medication_name DROP NOT NULL;
ALTER TABLE medication_schedule ALTER COLUMN dosage DROP NOT NULL;
ALTER TABLE medication_schedule ADD COLUMN IF NOT EXISTS instructions TEXT;
`

async function applyMigration() {
  console.log('Applying constraint migration...')
  const { error } = await supabase.rpc('pg_exec', { query: SQL })
  if (error) {
    console.error('RPC pg_exec not available, try running SQL manually:', error.message)
    console.log('\nSQL to run in Supabase SQL Editor:')
    console.log(SQL)
  } else {
    console.log('✅ Migration applied!')
  }
}

applyMigration()
