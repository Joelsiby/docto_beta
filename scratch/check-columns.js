const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://lsukzhtngurykpgdstyn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdWt6aHRuZ3VyeWtwZ2RzdHluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDkxMzExNywiZXhwIjoyMDk2NDg5MTE3fQ.CfpzYZxemWk861MJdnOFNVFeToch4WkiPaj4FfYCjcY',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function check() {
  const { data, error } = await supabase.rpc('get_table_columns', { t_name: 'prescription_items' })
  if (error) {
    // If no RPC, let's query postgres via a raw sql query if possible, or information_schema.columns
    // Wait, since we are using service role key, does postgrest allow querying information_schema?
    // Let's try selecting from information_schema.columns.
    const { data: cols, error: colErr } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'prescription_items')
    
    if (colErr) {
      console.error('Direct information_schema select failed:', colErr)
      // Let's try select * from prescription_items limit 1 to see the keys of the returned object
      const { data: rows, error: rowErr } = await supabase
        .from('prescription_items')
        .select('*')
        .limit(1)
      if (rowErr) {
        console.error('Row select failed:', rowErr)
      } else {
        console.log('prescription_items sample row keys:', rows.length > 0 ? Object.keys(rows[0]) : 'no rows in table')
      }
    } else {
      console.log('Columns:', cols)
    }
  } else {
    console.log('RPC Columns:', data)
  }
}

check().catch(console.error)
