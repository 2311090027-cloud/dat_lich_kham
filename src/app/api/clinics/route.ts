import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

function boDau(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
}

function tinhKhoangCach(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const keyword = boDau(searchParams.get('keyword') || '')
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lng = parseFloat(searchParams.get('lng') || '0')
  const specialty = searchParams.get('specialty') || ''

  const { data, error } = await supabase
    .from('clinics')
    .select(`*, doctors(id, name, specialty, fee, rating, experience_years)`)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let result = data.map(c => ({
    ...c,
    distance: lat ? tinhKhoangCach(lat, lng, c.lat, c.lng) : 999
  }))

  // Lọc theo từ khóa (không dấu)
  if (keyword) {
    result = result.filter(c =>
      boDau(c.name).includes(keyword) ||
      boDau(c.district || '').includes(keyword) ||
      c.doctors?.some((d: any) =>
        boDau(d.name).includes(keyword) ||
        boDau(d.specialty || '').includes(keyword)
      )
    )
  }

  // Lọc theo chuyên khoa
  if (specialty) {
    result = result.filter(c =>
      c.doctors?.some((d: any) =>
        boDau(d.specialty || '').includes(boDau(specialty))
      )
    )
  }

  result.sort((a, b) => a.distance - b.distance)
  return NextResponse.json(result)
}