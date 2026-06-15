import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import dns from 'dns'

dns.setDefaultResultOrder('ipv4first')

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
