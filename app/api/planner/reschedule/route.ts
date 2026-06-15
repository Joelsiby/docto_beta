import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { from_date, to_date } = await req.json()

    if (!from_date || !to_date) {
      return NextResponse.json({ error: 'from_date and to_date are required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await (supabase as any)
      .from('planner_tasks')
      .update({ due_date: to_date })
      .eq('user_id', user.id)
      .like('due_date', `${from_date}%`)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      rescheduled: data?.length ?? 0,
    })
  } catch (error: any) {
    console.error('Reschedule API Error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to reschedule tasks' }, { status: 500 })
  }
}
