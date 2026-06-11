'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  pending:   { label: 'Chờ xác nhận', bg: '#FEF9E7', color: '#9A7D0A' },
  confirmed: { label: 'Đã xác nhận',  bg: '#E9F7EF', color: '#1E8449' },
  cancelled: { label: 'Đã hủy',       bg: '#FDEDEC', color: '#C0392B' },
  done:      { label: 'Hoàn thành',   bg: '#EBF5FB', color: '#1A5276' },
}

export default function AdminAppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    // Kiểm tra đăng nhập
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/admin')
    })
    fetchAppointments()
  }, [filterStatus])

  const fetchAppointments = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterStatus) params.set('status', filterStatus)
    const res = await fetch(`/api/appointments?${params}`)
    const data = await res.json()
    setAppointments(data)
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/appointments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    fetchAppointments()
  }

  const dangXuat = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0F4F8' }}>
      {/* Header */}
      <div style={{
        background: 'white', borderBottom: '1px solid #D6EAF8',
        padding: '14px 24px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#1A5276', margin: 0 }}>
            🏥 Quản trị hệ thống
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'Lịch hẹn', href: '/admin/appointments' },
              { label: 'Bác sĩ', href: '/admin/doctors' },
              { label: 'Phòng khám', href: '/admin/clinics' },
            ].map(item => (
              <a key={item.href} href={item.href} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 13,
                textDecoration: 'none',
                background: item.href.includes('appointments') ? '#EBF5FB' : 'transparent',
                color: item.href.includes('appointments') ? '#2980B9' : '#7F8C8D',
                fontWeight: item.href.includes('appointments') ? 500 : 400,
              }}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <button onClick={dangXuat} style={{
          padding: '7px 16px', background: '#FDEDEC',
          color: '#C0392B', border: '1px solid #F1948A',
          borderRadius: 8, fontSize: 13, cursor: 'pointer'
        }}>
          Đăng xuất
        </button>
      </div>

      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { value: '', label: 'Tất cả' },
            { value: 'pending', label: 'Chờ xác nhận' },
            { value: 'confirmed', label: 'Đã xác nhận' },
            { value: 'cancelled', label: 'Đã hủy' },
            { value: 'done', label: 'Hoàn thành' },
          ].map(f => (
            <button key={f.value} onClick={() => setFilterStatus(f.value)} style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 13,
              cursor: 'pointer', border: '1px solid #D6EAF8',
              background: filterStatus === f.value ? '#2980B9' : 'white',
              color: filterStatus === f.value ? 'white' : '#5D6D7E',
              fontWeight: filterStatus === f.value ? 500 : 400,
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{
          background: 'white', borderRadius: 14,
          border: '1px solid #D6EAF8', overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#7F8C8D' }}>
              Đang tải...
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#AEB6BF' }}>
              Không có lịch hẹn nào
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F4F9FD', borderBottom: '1px solid #D6EAF8' }}>
                  {['Bệnh nhân', 'SĐT', 'Bác sĩ', 'Ngày khám', 'Giờ', 'Trạng thái', 'Thao tác'].map(h => (
                    <th key={h} style={{
                      padding: '12px 14px', textAlign: 'left',
                      color: '#5D6D7E', fontWeight: 500
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.map((a, i) => {
                  const s = STATUS_MAP[a.status] || STATUS_MAP.pending
                  return (
                    <tr key={a.id} style={{
                      borderBottom: '1px solid #F4F9FD',
                      background: i % 2 === 0 ? 'white' : '#FAFCFF'
                    }}>
                      <td style={{ padding: '12px 14px', color: '#1A5276', fontWeight: 500 }}>
                        {a.patient_name}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#5D6D7E' }}>
                        {a.patient_phone}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#5D6D7E' }}>
                        {a.doctors?.name || '—'}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#5D6D7E' }}>
                        {a.appointment_date}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#5D6D7E' }}>
                        {a.appointment_time?.slice(0, 5)}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: 20,
                          fontSize: 12, fontWeight: 500,
                          background: s.bg, color: s.color
                        }}>
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {a.status === 'pending' && (
                            <>
                              <button onClick={() => updateStatus(a.id, 'confirmed')} style={{
                                padding: '5px 10px', background: '#E9F7EF',
                                color: '#1E8449', border: '1px solid #A9DFBF',
                                borderRadius: 6, fontSize: 12, cursor: 'pointer'
                              }}>
                                Xác nhận
                              </button>
                              <button onClick={() => updateStatus(a.id, 'cancelled')} style={{
                                padding: '5px 10px', background: '#FDEDEC',
                                color: '#C0392B', border: '1px solid #F1948A',
                                borderRadius: 6, fontSize: 12, cursor: 'pointer'
                              }}>
                                Hủy
                              </button>
                            </>
                          )}
                          {a.status === 'confirmed' && (
                            <button onClick={() => updateStatus(a.id, 'done')} style={{
                              padding: '5px 10px', background: '#EBF5FB',
                              color: '#2980B9', border: '1px solid #AED6F1',
                              borderRadius: 6, fontSize: 12, cursor: 'pointer'
                            }}>
                              Hoàn thành
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}