import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || ''
  const date = searchParams.get('date') || ''

  let query = supabase
    .from('appointments')
    .select(`*, doctors(name, specialty), clinics(name, phone)`)
    .order('appointment_date', { ascending: false })

  if (status) query = query.eq('status', status)
  if (date) query = query.eq('appointment_date', date)

  const { data } = await query
  return NextResponse.json(data || [])
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerClient()
  const { id, status } = await req.json()
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}