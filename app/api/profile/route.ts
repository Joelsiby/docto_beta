import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  try {
    const { table, data } = await req.json()

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return NextResponse.json(
        { error: 'Missing Supabase environment variables on server' },
        { status: 500 }
      )
    }

    const allowedTables = ['doctor_profiles', 'patient_profiles']
    if (!allowedTables.includes(table)) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }

    const url = `${SUPABASE_URL}/rest/v1/${table}`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.text()
      return NextResponse.json(
        { error: `Database error (${res.status}): ${body}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: `Server error: ${err?.message || 'Unknown'}` },
      { status: 500 }
    )
  }
}
