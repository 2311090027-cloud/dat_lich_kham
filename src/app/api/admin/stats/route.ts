import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()

  const [
    { count: totalApt },
    { count: confirmedApt },
    { count: cancelledApt },
    { count: todayApt },
    { data: recentApts },
  ] = await Promise.all([
    supabase.from('appointments').select('*', { count: 'exact', head: true }),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('appointment_date', new Date().toISOString().split('T')[0]),
    supabase.from('appointments').select(`*, doctors(name, specialty), clinics(name)`).order('created_at', { ascending: false }).limit(10),
  ])

  return NextResponse.json({
    totalApt, confirmedApt, cancelledApt, todayApt, recentApts
  })
}