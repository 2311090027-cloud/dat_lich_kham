import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient()
  const date = new URL(req.url).searchParams.get('date')

  const { data } = await supabase
    .from('doctor_slots')
    .select('*')
    .eq('doctor_id', params.id)
    .eq('slot_date', date)
    .eq('is_available', true)
    .order('slot_time')

  return NextResponse.json(data || [])
}