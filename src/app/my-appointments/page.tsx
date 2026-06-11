'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Calendar, Clock, Phone, MapPin, X, CheckCircle } from 'lucide-react'

type Appointment = {
  id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  patient_name: string
  patient_phone: string
  patient_email: string
  symptoms: string
  status: string
  created_at: string
  doctors?: { name: string; specialty: string; fee: number }
  clinics?: { name: string; address: string; phone: string }
}

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [tabChon, setTabChon] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming')
  const [dangHuy, setDangHuy] = useState<string | null>(null)
  const [xacNhanHuy, setXacNhanHuy] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [daNhapSDT, setDaNhapSDT] = useState(false)

  const layLichHen = async (sdt: string) => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('appointments')
      .select(`
        *,
        doctors(name, specialty, fee),
        clinics(name, address, phone)
      `)
      .eq('patient_phone', sdt)
      .order('appointment_date', { ascending: false })

    setAppointments(data || [])
    setLoading(false)
  }

  const huyLich = async (id: string) => {
    setDangHuy(id)
    const supabase = createClient()
    await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id)

    setAppointments(prev =>
      prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a)
    )
    setDangHuy(null)
    setXacNhanHuy(null)
  }

  const locTheoTab = appointments.filter(a => {
    const homNay = new Date()
    const ngayKham = new Date(a.appointment_date)
    if (tabChon === 'upcoming') return a.status === 'confirmed' && ngayKham >= homNay
    if (tabChon === 'completed') return a.status === 'confirmed' && ngayKham < homNay
    return a.status === 'cancelled'
  })

  const mauTrangThai = (status: string, date: string) => {
    const qua = new Date(date) < new Date()
    if (status === 'cancelled') return { bg: '#FDEDEC', color: '#C0392B', label: '❌ Đã hủy' }
    if (qua) return { bg: '#E9F7EF', color: '#1E8449', label: '✅ Đã khám' }
    return { bg: '#EBF5FB', color: '#2980B9', label: '📅 Sắp tới' }
  }

  if (!daNhapSDT) return (
    <div style={{ maxWidth: 440, margin: '60px auto', padding: '0 16px' }}>
      <div style={{
        background: 'white', borderRadius: 16,
        border: '1px solid #D6EAF8', padding: '32px 28px',
        boxShadow: '0 2px 12px rgba(41,128,185,0.08)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
        <h1 style={{ fontSize: 20, fontWeight: 500, color: '#1A5276', margin: '0 0 8px' }}>
          Lịch hẹn của tôi
        </h1>
        <p style={{ fontSize: 13, color: '#7F8C8D', marginBottom: 24 }}>
          Nhập số điện thoại đã dùng khi đặt lịch để xem lịch hẹn
        </p>
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && phone && (setDaNhapSDT(true), layLichHen(phone))}
          placeholder="Nhập số điện thoại..."
          style={{
            width: '100%', padding: '11px 14px', boxSizing: 'border-box' as const,
            border: '1.5px solid #AED6F1', borderRadius: 10,
            fontSize: 14, color: '#1A252F', background: 'white',
            marginBottom: 12
          }}
        />
        <button
          onClick={() => { if (phone) { setDaNhapSDT(true); layLichHen(phone) } }}
          style={{
            width: '100%', padding: '11px',
            background: '#2980B9', color: 'white',
            border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: 500, cursor: 'pointer'
          }}>
          Xem lịch hẹn
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: '#1A5276', margin: 0 }}>
            📅 Lịch hẹn của tôi
          </h1>
          <p style={{ fontSize: 13, color: '#7F8C8D', margin: '4px 0 0' }}>
            SĐT: {phone} · {appointments.length} lịch hẹn
          </p>
        </div>
        <Link href="/" style={{
          fontSize: 13, color: '#2980B9', textDecoration: 'none',
          padding: '8px 16px', border: '1px solid #AED6F1',
          borderRadius: 8, background: '#EBF5FB'
        }}>
          + Đặt lịch mới
        </Link>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 20,
        background: '#EBF5FB', borderRadius: 10, padding: 4
      }}>
        {[
          { key: 'upcoming', label: '📅 Sắp tới' },
          { key: 'completed', label: '✅ Đã khám' },
          { key: 'cancelled', label: '❌ Đã hủy' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setTabChon(tab.key as any)}
            style={{
              flex: 1, padding: '8px 12px', border: 'none',
              borderRadius: 8, fontSize: 13, cursor: 'pointer',
              fontWeight: tabChon === tab.key ? 500 : 400,
              background: tabChon === tab.key ? 'white' : 'transparent',
              color: tabChon === tab.key ? '#1A5276' : '#7F8C8D',
              boxShadow: tabChon === tab.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
            }}>
            {tab.label}
            <span style={{
              marginLeft: 6, fontSize: 11, padding: '1px 7px',
              background: tabChon === tab.key ? '#EBF5FB' : '#D6EAF8',
              borderRadius: 20, color: '#2980B9'
            }}>
              {appointments.filter(a => {
                const qua = new Date(a.appointment_date) < new Date()
                if (tab.key === 'upcoming') return a.status === 'confirmed' && !qua
                if (tab.key === 'completed') return a.status === 'confirmed' && qua
                return a.status === 'cancelled'
              }).length}
            </span>
          </button>
        ))}
      </div>

      {/* Danh sách */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#7F8C8D' }}>
          Đang tải...
        </div>
      ) : locTheoTab.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          background: 'white', borderRadius: 16,
          border: '1px solid #D6EAF8'
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗓️</div>
          <p style={{ color: '#7F8C8D', fontSize: 14 }}>Chưa có lịch hẹn nào</p>
          <Link href="/" style={{
            display: 'inline-block', marginTop: 12,
            padding: '10px 20px', background: '#2980B9',
            color: 'white', borderRadius: 10, textDecoration: 'none', fontSize: 13
          }}>
            Đặt lịch ngay
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {locTheoTab.map(apt => {
            const trangThai = mauTrangThai(apt.status, apt.appointment_date)
            const coTheHuy = apt.status === 'confirmed' &&
              new Date(apt.appointment_date) > new Date()

            return (
              <div key={apt.id} style={{
                background: 'white', borderRadius: 14,
                border: '1px solid #D6EAF8',
                boxShadow: '0 2px 8px rgba(41,128,185,0.06)',
                overflow: 'hidden'
              }}>
                {/* Thanh màu top */}
                <div style={{
                  height: 4,
                  background: apt.status === 'cancelled'
                    ? '#E74C3C'
                    : new Date(apt.appointment_date) < new Date()
                      ? '#27AE60' : '#2980B9'
                }} />

                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>

                    {/* Thông tin chính */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{
                          fontSize: 11, padding: '3px 10px', borderRadius: 20,
                          background: trangThai.bg, color: trangThai.color,
                          fontWeight: 500
                        }}>
                          {trangThai.label}
                        </span>
                        <span style={{ fontSize: 11, color: '#AEB6BF' }}>
                          #{apt.id.slice(-6).toUpperCase()}
                        </span>
                      </div>

                      <h3 style={{ fontSize: 15, fontWeight: 500, color: '#1A5276', margin: '0 0 6px' }}>
                        👨‍⚕️ {apt.doctors?.name || 'Bác sĩ'}
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 13, color: '#5D6D7E', display: 'flex', alignItems: 'center', gap: 5 }}>
                          🔬 Chuyên khoa: <strong>{apt.doctors?.specialty}</strong>
                        </span>
                        <span style={{ fontSize: 13, color: '#5D6D7E', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Calendar size={13} color="#2980B9" />
                          {new Date(apt.appointment_date).toLocaleDateString('vi-VN', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </span>
                        <span style={{ fontSize: 13, color: '#5D6D7E', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Clock size={13} color="#2980B9" />
                          {apt.appointment_time?.slice(0, 5)}
                        </span>
                        {apt.clinics && (
                          <span style={{ fontSize: 13, color: '#5D6D7E', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <MapPin size={13} color="#2980B9" />
                            {apt.clinics.name} — {apt.clinics.address}
                          </span>
                        )}
                        {apt.symptoms && (
                          <span style={{ fontSize: 13, color: '#5D6D7E' }}>
                            📋 Lý do: {apt.symptoms}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Thông tin phụ + nút */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
                      {apt.doctors?.fee && (
                        <div style={{
                          padding: '8px 12px', background: '#E9F7EF',
                          borderRadius: 8, border: '1px solid #A9DFBF',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: 11, color: '#1E8449' }}>Chi phí dự kiến</div>
                          <div style={{ fontSize: 15, fontWeight: 500, color: '#1A5276' }}>
                            {apt.doctors.fee.toLocaleString()}đ
                          </div>
                        </div>
                      )}

                      {apt.clinics?.phone && (
                        <a href={`tel:${apt.clinics.phone}`} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          fontSize: 13, color: '#1E8449', textDecoration: 'none',
                          padding: '7px 12px', background: '#E9F7EF',
                          borderRadius: 8, border: '1px solid #A9DFBF'
                        }}>
                          <Phone size={13} /> {apt.clinics.phone}
                        </a>
                      )}

                      {coTheHuy && (
                        <>
                          {xacNhanHuy === apt.id ? (
                            <div style={{
                              background: '#FDEDEC', border: '1px solid #F1948A',
                              borderRadius: 8, padding: '10px', textAlign: 'center'
                            }}>
                              <p style={{ fontSize: 12, color: '#C0392B', margin: '0 0 8px' }}>
                                Xác nhận hủy lịch này?
                              </p>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  onClick={() => huyLich(apt.id)}
                                  disabled={dangHuy === apt.id}
                                  style={{
                                    flex: 1, padding: '6px', background: '#E74C3C',
                                    color: 'white', border: 'none', borderRadius: 6,
                                    fontSize: 12, cursor: 'pointer'
                                  }}>
                                  {dangHuy === apt.id ? '...' : 'Hủy lịch'}
                                </button>
                                <button
                                  onClick={() => setXacNhanHuy(null)}
                                  style={{
                                    flex: 1, padding: '6px', background: 'white',
                                    color: '#5D6D7E', border: '1px solid #D6EAF8',
                                    borderRadius: 6, fontSize: 12, cursor: 'pointer'
                                  }}>
                                  Giữ lại
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setXacNhanHuy(apt.id)}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                padding: '8px 12px', background: 'white',
                                color: '#C0392B', border: '1px solid #F1948A',
                                borderRadius: 8, fontSize: 13, cursor: 'pointer'
                              }}>
                              <X size={13} /> Hủy lịch hẹn
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}