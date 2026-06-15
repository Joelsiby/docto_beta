'use server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function supabaseInsert(table: string, data: object) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`DB insert failed (${res.status}): ${body}`)
  }
  return { success: true }
}

export async function createDoctorProfile(data: any) {
  try {
    if (!SERVICE_KEY) {
      return { error: 'SUPABASE_SERVICE_ROLE_KEY is missing in .env.local' }
    }
    await supabaseInsert('doctor_profiles', data)
    return { success: true }
  } catch (err: any) {
    return { error: err?.message || 'Unknown server error' }
  }
}

export async function createPatientProfile(data: any) {
  try {
    if (!SERVICE_KEY) {
      return { error: 'SUPABASE_SERVICE_ROLE_KEY is missing in .env.local' }
    }
    await supabaseInsert('patient_profiles', data)
    return { success: true }
  } catch (err: any) {
    return { error: err?.message || 'Unknown server error' }
  }
}

