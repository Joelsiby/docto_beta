import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function test() {
  console.log("Testing insert...")
  const res = await supabaseAdmin.from('doctor_profiles').insert({
    user_id: "00000000-0000-0000-0000-000000000000",
    full_name: "Test Doctor",
    specialization: "General Practice",
    license_number: "TEST-123",
    experience_years: 1,
    clinic_name: "Test Clinic",
    consultation_fee: 100,
    teleconsultation: true,
    clinic_visit: true,
    qualifications: [],
  }).select()
  console.log("Insert result:", JSON.stringify(res, null, 2))
}

test()
