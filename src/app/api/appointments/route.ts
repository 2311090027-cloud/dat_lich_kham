import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const TAT_CA_SLOT = [
  '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
]

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || ''
  const date = searchParams.get('date') || ''

  let query = supabase
    .from('appointments')
    .select(`*, doctors(name, specialty, clinic_id), clinics(name)`)
    .order('appointment_date', { ascending: false })

  if (status) query = query.eq('status', status)
  if (date) query = query.eq('appointment_date', date)

  const { data } = await query
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()
  const {
    doctor_id, appointment_date, appointment_time,
    patient_name, patient_phone, patient_email, symptoms
  } = body

  // Chuẩn hóa time về HH:mm:ss
  const timeForDB = appointment_time.length === 5
    ? appointment_time + ':00'
    : appointment_time

  // Kiểm tra trùng lịch
  const { data: trungLich } = await supabase
    .from('appointments')
    .select('id')
    .eq('doctor_id', doctor_id)
    .eq('appointment_date', appointment_date)
    .eq('appointment_time', timeForDB)  // ← dùng timeForDB
    .in('status', ['pending', 'confirmed'])
    .maybeSingle()

  if (trungLich) {
    const { data: daDat } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('doctor_id', doctor_id)
      .eq('appointment_date', appointment_date)
      .in('status', ['pending', 'confirmed'])

    const gioBoiBat = new Set((daDat || []).map((a: any) =>
      a.appointment_time.slice(0, 5)
    ))

    const goiY = TAT_CA_SLOT.filter(s => !gioBoiBat.has(s)).slice(0, 3)

    return NextResponse.json({
      error: 'Khung giờ này đã được đặt',
      conflict: true,
      goiY,
    }, { status: 409 })
  }

  // Đặt lịch
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert({
      doctor_id, appointment_date,
      appointment_time: timeForDB,
      patient_name, patient_phone,
      patient_email: patient_email || null,
      symptoms: symptoms || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ appointment })
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