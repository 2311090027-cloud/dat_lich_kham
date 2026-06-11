'use client'
import { use, useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { useRouter } from 'next/navigation'

const GIO_SANG = ['07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00']
const GIO_CHIEU = ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']

export default function BookingPage({ params }: { params: Promise<{ doctorId: string }> }) {
  const { doctorId } = use(params)
  const router = useRouter()
  const [ngay, setNgay] = useState<Date>(new Date())
  const [slotChon, setSlotChon] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', symptoms: '' })
  const [dangGui, setDangGui] = useState(false)
  const [xongRoi, setXongRoi] = useState(false)
  const [loi, setLoi] = useState('')
  const [maLich, setMaLich] = useState('')
  const [goiY, setGoiY] = useState<string[]>([])

  const inputStyle = {
    width: '100%', padding: '10px 14px', boxSizing: 'border-box' as const,
    border: '1.5px solid #AED6F1', borderRadius: 10,
    fontSize: 14, color: '#1A252F', background: 'white', outline: 'none'
  }

  const datLich = async () => {
    if (!slotChon) return setLoi('Vui lòng chọn giờ khám')
    if (!form.name || !form.phone) return setLoi('Vui lòng điền họ tên và số điện thoại')

    setDangGui(true)
    setLoi('')
    setGoiY([])

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctor_id: doctorId,
        appointment_date: format(ngay, 'yyyy-MM-dd'),
        appointment_time: slotChon,
        patient_name: form.name,
        patient_phone: form.phone,
        patient_email: form.email,
        symptoms: form.symptoms,
      }),
    })

    const data = await res.json()
    setDangGui(false)

    if (data.conflict) {
      setLoi(`Khung giờ ${slotChon} ngày ${format(ngay, 'dd/MM/yyyy')} đã có người đặt.`)
      setGoiY(data.goiY || [])
      return
    }

    if (data.error) return setLoi(data.error)
    setMaLich(data.appointment?.id?.slice(-6).toUpperCase() || 'XXXXXX')
    setXongRoi(true)
  }

  if (xongRoi) return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
      <div style={{
        background: 'white', borderRadius: 20,
        border: '1px solid #A9DFBF', padding: '40px 28px',
        boxShadow: '0 4px 20px rgba(39,174,96,0.1)'
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: '#E9F7EF', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', fontSize: 36
        }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 500, color: '#1A5276', margin: '0 0 8px' }}>
          Đặt lịch thành công!
        </h2>
        <p style={{ fontSize: 14, color: '#5D6D7E', margin: '0 0 20px' }}>
          Mã lịch hẹn của bạn
        </p>
        <div style={{
          background: '#EBF5FB', border: '2px dashed #AED6F1',
          borderRadius: 12, padding: '14px 20px', marginBottom: 20
        }}>
          <span style={{ fontSize: 24, fontWeight: 600, color: '#1A5276', letterSpacing: 4 }}>
            #{maLich}
          </span>
        </div>
        <div style={{
          background: '#F4F9FD', borderRadius: 12,
          padding: '14px 16px', marginBottom: 24, textAlign: 'left'
        }}>
          {[
            { icon: '📅', label: 'Ngày khám', value: format(ngay, 'dd/MM/yyyy') },
            { icon: '⏰', label: 'Giờ khám', value: slotChon },
            { icon: '👤', label: 'Bệnh nhân', value: form.name },
            { icon: '📞', label: 'Điện thoại', value: form.phone },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 13, padding: '5px 0',
              borderBottom: i < 3 ? '1px solid #EBF5FB' : 'none'
            }}>
              <span style={{ color: '#7F8C8D' }}>{item.icon} {item.label}</span>
              <span style={{ color: '#1A5276', fontWeight: 500 }}>{item.value}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#7F8C8D', marginBottom: 20 }}>
          Vui lòng đến trước <strong>15 phút</strong> và mang theo CMND/CCCD
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => router.push('/my-appointments')} style={{
            flex: 1, padding: '11px', background: '#EBF5FB',
            color: '#2980B9', border: '1px solid #AED6F1',
            borderRadius: 10, fontSize: 13, cursor: 'pointer', fontWeight: 500
          }}>
            📅 Xem lịch hẹn
          </button>
          <button onClick={() => router.push('/')} style={{
            flex: 1, padding: '11px', background: '#2980B9',
            color: 'white', border: 'none',
            borderRadius: 10, fontSize: 13, cursor: 'pointer', fontWeight: 500
          }}>
            🏠 Về trang chủ
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 13, color: '#7F8C8D' }}>
        <a href="/" style={{ color: '#2980B9', textDecoration: 'none' }}>🏠 Trang chủ</a>
        <span>›</span>
        <span style={{ color: '#1A5276' }}>Đặt lịch khám</span>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 500, color: '#1A5276', margin: '0 0 6px' }}>
        📋 Đặt lịch khám
      </h1>
      <p style={{ fontSize: 13, color: '#7F8C8D', margin: '0 0 24px' }}>
        Chọn ngày, giờ và điền thông tin để hoàn tất đặt lịch
      </p>

      <div style={{ display: 'flex', gap: 0, marginBottom: 28 }}>
        {['Chọn ngày & giờ', 'Điền thông tin', 'Xác nhận'].map((step, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: i === 0 ? '#2980B9' : i === 1 && slotChon ? '#2980B9' : '#D6EAF8',
                color: i === 0 ? 'white' : '#7F8C8D',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 500, flexShrink: 0
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 12, color: i === 0 ? '#1A5276' : '#7F8C8D', fontWeight: i === 0 ? 500 : 400 }}>
                {step}
              </span>
            </div>
            {i < 2 && <div style={{ width: 30, height: 1, background: '#8ec4ea', flexShrink: 0 }} />}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <div style={{
            background: 'white', borderRadius: 14,
            border: '1px solid #a0cdee', padding: '20px',
            boxShadow: '0 2px 8px rgba(41,128,185,0.06)'
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: '#1A5276', margin: '0 0 14px' }}>
              📅 Chọn ngày khám
            </h3>
            <style>{`
              .react-calendar { width: 100% !important; border: none !important; font-family: sans-serif !important; background: transparent !important; }
              .react-calendar__navigation { margin-bottom: 8px !important; }
              .react-calendar__navigation button { min-width: 36px !important; background: none !important; font-size: 14px !important; color: #1A5276 !important; border-radius: 8px !important; padding: 6px !important; }
              .react-calendar__navigation button:hover { background: #EBF5FB !important; }
              .react-calendar__navigation button:disabled { opacity: 0.3 !important; }
              .react-calendar__month-view__weekdays { text-align: center !important; font-size: 12px !important; color: #7F8C8D !important; font-weight: 500 !important; text-decoration: none !important; margin-bottom: 4px !important; }
              .react-calendar__month-view__weekdays abbr { text-decoration: none !important; }
              .react-calendar__tile { padding: 10px 4px !important; font-size: 13px !important; border-radius: 8px !important; color: #1A5276 !important; background: none !important; border: none !important; }
              .react-calendar__tile:hover { background: #EBF5FB !important; }
              .react-calendar__tile--now { background: #EBF5FB !important; color: #2980B9 !important; font-weight: 500 !important; }
              .react-calendar__tile--active, .react-calendar__tile--active:hover { background: #2980B9 !important; color: white !important; font-weight: 500 !important; }
              .react-calendar__tile:disabled { color: #AEB6BF !important; }
              .react-calendar__month-view__days__day--weekend { color: #E74C3C !important; }
              .react-calendar__tile--active.react-calendar__month-view__days__day--weekend { color: white !important; }
            `}</style>
            <Calendar
              onChange={(d) => { setNgay(d as Date); setSlotChon(null); setGoiY([]); setLoi('') }}
              value={ngay}
              minDate={new Date()}
              locale="vi-VN"
            />
          </div>

          <div style={{
            background: 'white', borderRadius: 14,
            border: '1px solid #D6EAF8', padding: '20px', marginTop: 14,
            boxShadow: '0 2px 8px rgba(41,128,185,0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 500, color: '#1A5276', margin: 0 }}>
                ⏰ Chọn giờ khám
              </h3>
              <span style={{
                fontSize: 12, padding: '3px 10px',
                background: '#EBF5FB', color: '#2980B9',
                borderRadius: 20, border: '1px solid #AED6F1'
              }}>
                {format(ngay, 'dd/MM/yyyy')}
              </span>
            </div>

            <p style={{ fontSize: 12, color: '#7F8C8D', margin: '0 0 10px' }}>🌅 Buổi sáng</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
              {GIO_SANG.map(gio => (
                <button key={gio} onClick={() => { setSlotChon(gio); setLoi(''); setGoiY([]) }} style={{
                  padding: '9px 4px', borderRadius: 8, fontSize: 13,
                  cursor: 'pointer', fontWeight: slotChon === gio ? 500 : 400,
                  border: slotChon === gio ? '2px solid #2980B9' : '1.5px solid #D6EAF8',
                  background: slotChon === gio ? '#2980B9' : 'white',
                  color: slotChon === gio ? 'white' : '#1A5276',
                  transition: 'all 0.15s'
                }}>
                  {gio}
                </button>
              ))}
            </div>

            <p style={{ fontSize: 12, color: '#7F8C8D', margin: '0 0 10px' }}>🌇 Buổi chiều</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {GIO_CHIEU.map(gio => (
                <button key={gio} onClick={() => { setSlotChon(gio); setLoi(''); setGoiY([]) }} style={{
                  padding: '9px 4px', borderRadius: 8, fontSize: 13,
                  cursor: 'pointer', fontWeight: slotChon === gio ? 500 : 400,
                  border: slotChon === gio ? '2px solid #F39C12' : '1.5px solid #D6EAF8',
                  background: slotChon === gio ? '#F39C12' : 'white',
                  color: slotChon === gio ? 'white' : '#1A5276',
                  transition: 'all 0.15s'
                }}>
                  {gio}
                </button>
              ))}
            </div>

            {slotChon && (
              <div style={{
                marginTop: 14, padding: '10px 14px',
                background: '#E9F7EF', border: '1px solid #A9DFBF',
                borderRadius: 8, fontSize: 13, color: '#1E8449',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                Đã chọn: <strong>{format(ngay, 'dd/MM/yyyy')} lúc {slotChon}</strong>
              </div>
            )}
          </div>
        </div>

        <div style={{
          background: 'white', borderRadius: 14,
          border: '1px solid #D6EAF8', padding: '20px',
          boxShadow: '0 2px 8px rgba(41,128,185,0.06)',
          display: 'flex', flexDirection: 'column', gap: 14
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: '#1A5276', margin: 0 }}>
            👤 Thông tin bệnh nhân
          </h3>

          {[
            { field: 'name', label: 'Họ và tên *', placeholder: 'Nguyễn Văn A', type: 'text' },
            { field: 'phone', label: 'Số điện thoại *', placeholder: '0912345678', type: 'tel' },
            { field: 'email', label: 'Email (nhận xác nhận lịch)', placeholder: 'email@gmail.com', type: 'email' },
          ].map(item => (
            <div key={item.field}>
              <label style={{ fontSize: 13, color: '#1A5276', display: 'block', marginBottom: 5, fontWeight: 500 }}>
                {item.label}
              </label>
              <input
                type={item.type}
                placeholder={item.placeholder}
                value={(form as any)[item.field]}
                onChange={e => setForm({ ...form, [item.field]: e.target.value })}
                style={inputStyle}
              />
            </div>
          ))}

          <div>
            <label style={{ fontSize: 13, color: '#1A5276', display: 'block', marginBottom: 5, fontWeight: 500 }}>
              Triệu chứng / lý do khám
            </label>
            <textarea
              placeholder="Mô tả triệu chứng hoặc lý do khám để bác sĩ chuẩn bị tốt hơn..."
              value={form.symptoms}
              onChange={e => setForm({ ...form, symptoms: e.target.value })}
              style={{ ...inputStyle, height: 100, resize: 'none' }}
            />
          </div>

          {slotChon && (
            <div style={{
              background: '#F4F9FD', borderRadius: 10,
              border: '1px solid #D6EAF8', padding: '12px 14px'
            }}>
              <p style={{ fontSize: 12, color: '#7F8C8D', margin: '0 0 8px', fontWeight: 500 }}>
                📋 Tóm tắt lịch hẹn
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: '#7F8C8D' }}>Ngày khám</span>
                <span style={{ color: '#1A5276', fontWeight: 500 }}>
                  {format(ngay, 'EEEE, dd/MM/yyyy', { locale: vi })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#7F8C8D' }}>Giờ khám</span>
                <span style={{
                  color: 'white', fontWeight: 500,
                  background: GIO_SANG.includes(slotChon) ? '#2980B9' : '#F39C12',
                  padding: '2px 10px', borderRadius: 20, fontSize: 12
                }}>
                  {slotChon} — {GIO_SANG.includes(slotChon) ? 'Buổi sáng' : 'Buổi chiều'}
                </span>
              </div>
            </div>
          )}

          {loi && (
            <div style={{
              padding: '10px 14px', background: '#FDEDEC',
              border: '1px solid #F1948A', borderRadius: 8,
              fontSize: 13, color: '#C0392B'
            }}>
              ⚠️ {loi}
            </div>
          )}

          {goiY.length > 0 && (
            <div style={{
              padding: '12px 14px', background: '#FFF8E4',
              border: '1px solid #F9E79F', borderRadius: 8
            }}>
              <p style={{ margin: '0 0 10px', color: '#9A7D0A', fontWeight: 500, fontSize: 13 }}>
                💡 Các khung giờ còn trống trong ngày này:
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {goiY.map(slot => (
                  <button
                    key={slot}
                    onClick={() => { setSlotChon(slot); setLoi(''); setGoiY([]) }}
                    style={{
                      padding: '8px 18px', borderRadius: 8,
                      background: '#2980B9', color: 'white',
                      border: 'none', fontSize: 13,
                      cursor: 'pointer', fontWeight: 500
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 12, color: '#7F8C8D' }}>
                Nhấn vào giờ để chọn ngay
              </p>
            </div>
          )}

          {goiY.length === 0 && loi.includes('đã có người đặt') && (
            <div style={{
              padding: '10px 14px', background: '#F0F9FF',
              border: '1px solid #AED6F1', borderRadius: 8,
              fontSize: 13, color: '#1A5276'
            }}>
              📅 Hết giờ trống trong ngày này. Vui lòng chọn ngày khác.
            </div>
          )}

          <button onClick={datLich} disabled={dangGui} style={{
            padding: '13px', marginTop: 4,
            background: dangGui ? '#AED6F1' : '#2980B9',
            color: 'white', border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: 500,
            cursor: dangGui ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            {dangGui ? '⏳ Đang xử lý...' : '✅ Xác nhận đặt lịch'}
          </button>

          <p style={{ fontSize: 12, color: '#AEB6BF', textAlign: 'center', margin: 0 }}>
            🔒 Thông tin của bạn được bảo mật hoàn toàn
          </p>
        </div>
      </div>
    </div>
  )
}