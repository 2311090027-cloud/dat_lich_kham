'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Calendar, Clock, Phone, MapPin, X, User, Stethoscope, FileText, DollarSign } from 'lucide-react'

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
  const [tabChon, setTabChon] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
  const [dangHuy, setDangHuy] = useState<string | null>(null)
  const [xacNhanHuy, setXacNhanHuy] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [daNhapSDT, setDaNhapSDT] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)

  // Tự động lấy thông tin user nếu đã đăng nhập
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserInfo(user)

      // Lấy SĐT từ profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone, full_name')
        .eq('id', user.id)
        .single()

      const sdt = profile?.phone || user.user_metadata?.phone || ''
      if (sdt) {
        setPhone(sdt)
        setDaNhapSDT(true)
        layLichHen(sdt)
      } else {
        setLoading(false)
      }
    })
  }, [])

  const layLichHen = async (sdt: string) => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('appointments')
      .select(`*, doctors(name, specialty, fee), clinics(name, address, phone)`)
      .eq('patient_phone', sdt)
      .order('appointment_date', { ascending: false })

    setAppointments(data || [])
    setLoading(false)
  }

  const huyLich = async (id: string) => {
    setDangHuy(id)
    const supabase = createClient()
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id)
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a))
    setDangHuy(null)
    setXacNhanHuy(null)
  }

  const now = new Date()
  const locTheoTab = appointments.filter(a => {
    const ngayKham = new Date(a.appointment_date)
    if (tabChon === 'upcoming') return (a.status === 'pending' || a.status === 'confirmed') && ngayKham >= now
    if (tabChon === 'past') return (a.status === 'confirmed' || a.status === 'done') && ngayKham < now
    return a.status === 'cancelled'
  })

  const badgeTrangThai = (apt: Appointment) => {
    const qua = new Date(apt.appointment_date) < now
    if (apt.status === 'cancelled') return { bg: '#FDEDEC', color: '#C0392B', border: '#F1948A', label: 'Đã hủy' }
    if (apt.status === 'done' || qua) return { bg: '#E9F7EF', color: '#1E8449', border: '#A9DFBF', label: 'Đã khám' }
    if (apt.status === 'confirmed') return { bg: '#EBF5FB', color: '#2980B9', border: '#AED6F1', label: 'Đã xác nhận' }
    return { bg: '#FEF9E7', color: '#9A7D0A', border: '#F9E79F', label: 'Chờ xác nhận' }
  }

  // Màn hình nhập SĐT nếu chưa đăng nhập
  if (!daNhapSDT) return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{
        background: 'white', borderRadius: 20,
        border: '1px solid #D6EAF8', padding: '40px 32px',
        width: '100%', maxWidth: 420,
        boxShadow: '0 4px 24px rgba(26,82,118,0.1)',
        textAlign: 'center'
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #EBF5FB, #D6EAF8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', fontSize: 32
        }}>📅</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A5276', margin: '0 0 8px' }}>
          Lịch hẹn của tôi
        </h1>
        <p style={{ fontSize: 13, color: '#7F8C8D', marginBottom: 24, lineHeight: 1.6 }}>
          Nhập số điện thoại đã dùng khi đặt lịch để xem thông tin lịch hẹn
        </p>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            fontSize: 16
          }}>📱</span>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && phone && (setDaNhapSDT(true), layLichHen(phone))}
            placeholder="Nhập số điện thoại..."
            style={{
              width: '100%', padding: '12px 14px 12px 42px',
              boxSizing: 'border-box',
              border: '1.5px solid #AED6F1', borderRadius: 12,
              fontSize: 14, color: '#1A252F', background: 'white',
              outline: 'none'
            }}
          />
        </div>
        <button
          onClick={() => { if (phone) { setDaNhapSDT(true); layLichHen(phone) } }}
          style={{
            width: '100%', padding: '12px',
            background: 'linear-gradient(135deg, #2980B9, #1A5276)',
            color: 'white', border: 'none', borderRadius: 12,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            marginBottom: 16
          }}>
          Xem lịch hẹn →
        </button>
        <p style={{ fontSize: 12, color: '#AEB6BF' }}>
          Chưa có tài khoản?{' '}
          <Link href="/auth/register" style={{ color: '#2980B9', textDecoration: 'none', fontWeight: 500 }}>
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '32px 16px' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1A5276, #2980B9)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24,
        color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>
            📅 Lịch hẹn của tôi
          </h1>
          <p style={{ fontSize: 13, opacity: 0.85, margin: 0 }}>
            {userInfo?.user_metadata?.full_name || 'Bệnh nhân'} · SĐT: {phone} · {appointments.length} lịch hẹn
          </p>
        </div>
        <Link href="/" style={{
          fontSize: 13, color: 'white', textDecoration: 'none',
          padding: '10px 20px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 10, fontWeight: 500,
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          + Đặt lịch mới
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          {
            label: 'Sắp tới', count: appointments.filter(a =>
              (a.status === 'pending' || a.status === 'confirmed') && new Date(a.appointment_date) >= now
            ).length, color: '#2980B9', bg: '#EBF5FB', icon: '📅'
          },
          {
            label: 'Đã khám', count: appointments.filter(a =>
              (a.status === 'done' || a.status === 'confirmed') && new Date(a.appointment_date) < now
            ).length, color: '#1E8449', bg: '#E9F7EF', icon: '✅'
          },
          {
            label: 'Đã hủy', count: appointments.filter(a => a.status === 'cancelled').length,
            color: '#C0392B', bg: '#FDEDEC', icon: '❌'
          },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, borderRadius: 12,
            padding: '16px', textAlign: 'center',
            border: `1px solid ${s.color}30`
          }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 12, color: '#7F8C8D' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 20,
        background: 'white', borderRadius: 12, padding: 4,
        border: '1px solid #D6EAF8',
        boxShadow: '0 2px 8px rgba(26,82,118,0.06)'
      }}>
        {[
          { key: 'upcoming', label: 'Sắp tới', icon: '📅' },
          { key: 'past', label: 'Đã khám', icon: '✅' },
          { key: 'cancelled', label: 'Đã hủy', icon: '❌' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setTabChon(tab.key as any)} style={{
            flex: 1, padding: '10px 12px', border: 'none',
            borderRadius: 8, fontSize: 13, cursor: 'pointer',
            fontWeight: tabChon === tab.key ? 600 : 400,
            background: tabChon === tab.key
              ? 'linear-gradient(135deg, #2980B9, #1A5276)'
              : 'transparent',
            color: tabChon === tab.key ? 'white' : '#7F8C8D',
            transition: 'all 0.2s'
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Danh sách */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#7F8C8D' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          <p>Đang tải lịch hẹn...</p>
        </div>
      ) : locTheoTab.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          background: 'white', borderRadius: 16,
          border: '1px solid #D6EAF8'
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗓️</div>
          <h3 style={{ color: '#1A5276', margin: '0 0 8px' }}>Chưa có lịch hẹn</h3>
          <p style={{ color: '#7F8C8D', fontSize: 13, marginBottom: 20 }}>
            Bạn chưa có lịch hẹn nào trong mục này
          </p>
          <Link href="/" style={{
            display: 'inline-block', padding: '11px 24px',
            background: 'linear-gradient(135deg, #2980B9, #1A5276)',
            color: 'white', borderRadius: 10, textDecoration: 'none',
            fontSize: 13, fontWeight: 500
          }}>
            Đặt lịch ngay →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {locTheoTab.map(apt => {
            const badge = badgeTrangThai(apt)
            const coTheHuy = (apt.status === 'pending' || apt.status === 'confirmed') &&
              new Date(apt.appointment_date) > now

            return (
              <div key={apt.id} style={{
                background: 'white', borderRadius: 16,
                border: '1px solid #D6EAF8',
                boxShadow: '0 2px 12px rgba(26,82,118,0.06)',
                overflow: 'hidden'
              }}>
                {/* Top bar màu */}
                <div style={{
                  height: 5,
                  background: apt.status === 'cancelled'
                    ? 'linear-gradient(90deg, #E74C3C, #C0392B)'
                    : new Date(apt.appointment_date) < now
                      ? 'linear-gradient(90deg, #27AE60, #1E8449)'
                      : 'linear-gradient(90deg, #2980B9, #1A5276)'
                }} />

                <div style={{ padding: '20px 24px' }}>
                  {/* Row 1: Badge + Mã + Ngày tạo */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 12, padding: '4px 12px', borderRadius: 20,
                        background: badge.bg, color: badge.color,
                        border: `1px solid ${badge.border}`,
                        fontWeight: 600
                      }}>
                        {badge.label}
                      </span>
                      <span style={{ fontSize: 11, color: '#AEB6BF', fontFamily: 'monospace' }}>
                        #{apt.id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: '#AEB6BF' }}>
                      Đặt lúc: {new Date(apt.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20 }}>
                    {/* Thông tin chính */}
                    <div>
                      {/* Bác sĩ */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
                        padding: '10px 14px', background: '#F4F9FD',
                        borderRadius: 10, border: '1px solid #D6EAF8'
                      }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #2980B9, #1A5276)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: 20, flexShrink: 0
                        }}>
                          👨‍⚕️
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#1A5276' }}>
                            {apt.doctors?.name || 'Bác sĩ'}
                          </div>
                          <div style={{ fontSize: 12, color: '#2980B9', marginTop: 2 }}>
                            🔬 {apt.doctors?.specialty || 'Chuyên khoa tổng quát'}
                          </div>
                        </div>
                      </div>

                      {/* Chi tiết lịch */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 12px', background: '#EBF5FB',
                          borderRadius: 8, border: '1px solid #AED6F1'
                        }}>
                          <Calendar size={14} color="#2980B9" />
                          <div>
                            <div style={{ fontSize: 10, color: '#7F8C8D' }}>Ngày khám</div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: '#1A5276' }}>
                              {new Date(apt.appointment_date).toLocaleDateString('vi-VN', {
                                weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 12px', background: '#EBF5FB',
                          borderRadius: 8, border: '1px solid #AED6F1'
                        }}>
                          <Clock size={14} color="#2980B9" />
                          <div>
                            <div style={{ fontSize: 10, color: '#7F8C8D' }}>Giờ khám</div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: '#1A5276' }}>
                              {apt.appointment_time?.slice(0, 5)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cơ sở */}
                      {apt.clinics && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 12px', background: '#F4F9FD',
                          borderRadius: 8, border: '1px solid #D6EAF8',
                          marginBottom: 10, fontSize: 13
                        }}>
                          <MapPin size={14} color="#7F8C8D" />
                          <span style={{ color: '#5D6D7E' }}>
                            <strong>{apt.clinics.name}</strong> — {apt.clinics.address}
                          </span>
                        </div>
                      )}

                      {/* Triệu chứng */}
                      {apt.symptoms && (
                        <div style={{
                          display: 'flex', alignItems: 'flex-start', gap: 8,
                          padding: '8px 12px', background: '#FFF8E4',
                          borderRadius: 8, border: '1px solid #F9E79F',
                          fontSize: 13
                        }}>
                          <FileText size={14} color="#9A7D0A" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span style={{ color: '#7D6608' }}>
                            <strong>Triệu chứng:</strong> {apt.symptoms}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Cột phải */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
                      {/* Chi phí */}
                      {apt.doctors?.fee && (
                        <div style={{
                          padding: '12px', background: '#E9F7EF',
                          borderRadius: 10, border: '1px solid #A9DFBF',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: 11, color: '#1E8449', marginBottom: 2 }}>💰 Chi phí dự kiến</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: '#1A5276' }}>
                            {apt.doctors.fee.toLocaleString()}đ
                          </div>
                        </div>
                      )}

                      {/* SĐT phòng khám */}
                      {apt.clinics?.phone && (
                        <a href={`tel:${apt.clinics.phone}`} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          fontSize: 13, color: '#1E8449', textDecoration: 'none',
                          padding: '9px 12px', background: '#E9F7EF',
                          borderRadius: 10, border: '1px solid #A9DFBF',
                          fontWeight: 500
                        }}>
                          <Phone size={13} /> {apt.clinics.phone}
                        </a>
                      )}

                      {/* Nút hủy */}
                      {coTheHuy && (
                        xacNhanHuy === apt.id ? (
                          <div style={{
                            background: '#FDEDEC', border: '1px solid #F1948A',
                            borderRadius: 10, padding: '12px', textAlign: 'center'
                          }}>
                            <p style={{ fontSize: 12, color: '#C0392B', margin: '0 0 8px', fontWeight: 500 }}>
                              Xác nhận hủy lịch?
                            </p>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => huyLich(apt.id)} disabled={dangHuy === apt.id} style={{
                                flex: 1, padding: '7px',
                                background: '#E74C3C', color: 'white',
                                border: 'none', borderRadius: 7,
                                fontSize: 12, cursor: 'pointer', fontWeight: 500
                              }}>
                                {dangHuy === apt.id ? '...' : 'Xác nhận'}
                              </button>
                              <button onClick={() => setXacNhanHuy(null)} style={{
                                flex: 1, padding: '7px', background: 'white',
                                color: '#5D6D7E', border: '1px solid #D6EAF8',
                                borderRadius: 7, fontSize: 12, cursor: 'pointer'
                              }}>
                                Giữ lại
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setXacNhanHuy(apt.id)} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '9px 12px', background: 'white',
                            color: '#C0392B', border: '1px solid #F1948A',
                            borderRadius: 10, fontSize: 13, cursor: 'pointer', fontWeight: 500
                          }}>
                            <X size={13} /> Hủy lịch hẹn
                          </button>
                        )
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