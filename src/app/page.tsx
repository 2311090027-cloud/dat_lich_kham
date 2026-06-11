'use client'
import { useState, useEffect } from 'react'
import { MapPin, Search, Phone, MessageCircle, Globe, Star, Navigation } from 'lucide-react'


function boDau(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
}

const CHUYEN_KHOA = [
  { name: 'Tim mạch', icon: '❤️', color: '#FFE4E4', border: '#FFB3B3', text: '#C0392B' },
  { name: 'Nội tổng quát', icon: '🩺', color: '#E4F0FF', border: '#B3D4FF', text: '#1A5276' },
  { name: 'Nhi khoa', icon: '👶', color: '#E4FFE9', border: '#B3F0BC', text: '#1E8449' },
  { name: 'Da liễu', icon: '✨', color: '#FFF8E4', border: '#FFE8B3', text: '#9A7D0A' },
  { name: 'Xương khớp', icon: '🦴', color: '#F0E4FF', border: '#D4B3FF', text: '#6C3483' },
  { name: 'Thần kinh', icon: '🧠', color: '#E4FAFF', border: '#B3EEFF', text: '#117A8B' },
  { name: 'Mắt', icon: '👁️', color: '#E8FFE4', border: '#B3F5B3', text: '#196F3D' },
  { name: 'Tai mũi họng', icon: '👂', color: '#FFE4F5', border: '#FFB3E6', text: '#922B6F' },
]


export default function HomePage() {
  const [clinics, setClinics] = useState<any[]>([])
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [chuyenKhoaChon, setChuyenKhoaChon] = useState('')
  const [diaChi, setDiaChi] = useState('')

  const search = async (ck = chuyenKhoaChon) => {
    setLoading(true)
    const params = new URLSearchParams({
      keyword: boDau(keyword),
      lat: String(location?.lat || 0),
      lng: String(location?.lng || 0),
      specialty: ck,
    })
    const res = await fetch(`/api/clinics?${params}`)
    const data = await res.json()
    setClinics(data)
    setLoading(false)
  }

  const layViTri = () => {
    navigator.geolocation.getCurrentPosition(pos => {
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      setDiaChi('Vị trí hiện tại của tôi')
    })
  }

  const moGoogleMap = (clinic: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lng}`
    window.open(url, '_blank')
  }

  const moZalo = (zalo: string) => {
    window.open(`https://zalo.me/${zalo}`, '_blank')
  }

  useEffect(() => { search() }, [location, chuyenKhoaChon])

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>

      {/* HERO */}
      <div style={{
        background: 'linear-gradient(135deg, #E8F4FD 0%, #EBF5FB 50%, #E8F8F5 100%)',
        borderRadius: 16, padding: '32px 24px', textAlign: 'center', marginBottom: 24,
        border: '1px solid #D6EAF8'
      }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: '#1A5276', marginBottom: 8 }}>
          🏥 Đặt lịch khám sức khỏe
        </h1>
        <p style={{ color: '#5D6D7E', fontSize: 14, marginBottom: 24 }}>
          Tìm bác sĩ phù hợp · Đặt lịch nhanh · Nhắc lịch tự động
        </p>

        {/* Thanh tìm kiếm */}
        <div style={{ display: 'flex', gap: 8, maxWidth: 620, margin: '0 auto', flexWrap: 'wrap' }}>
          <button onClick={layViTri} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 14px', background: 'white',
            border: '1.5px solid #2980B9', color: '#2980B9',
            borderRadius: 10, fontSize: 13, cursor: 'pointer', fontWeight: 500
          }}>
            <Navigation size={15} /> Vị trí của tôi
          </button>
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Tìm phòng khám, bác sĩ, chuyên khoa..."
            style={{
              flex: 1, minWidth: 180, padding: '10px 14px',
              border: '1.5px solid #AED6F1', borderRadius: 10,
              fontSize: 13, background: 'white', color: '#1A252F'
            }}
          />
          <button onClick={() => search()} style={{
            padding: '10px 20px', background: '#2980B9',
            color: 'white', border: 'none', borderRadius: 10,
            fontSize: 13, cursor: 'pointer', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Search size={15} /> Tìm kiếm
          </button>
        </div>

        {diaChi && (
          <p style={{ fontSize: 12, color: '#2980B9', marginTop: 8 }}>
            📍 {diaChi}
          </p>
        )}
      </div>

      {/* THỐNG KÊ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { num: '15+', label: 'Bác sĩ chuyên khoa', color: '#2980B9', bg: '#EBF5FB' },
          { num: '4', label: 'Cơ sở y tế', color: '#1E8449', bg: '#E9F7EF' },
          { num: '8', label: 'Chuyên khoa', color: '#7D3C98', bg: '#F5EEF8' },
        ].map((s, i) => (
          <div key={i} style={{
            background: s.bg, borderRadius: 12, padding: '14px',
            textAlign: 'center', border: `1px solid ${s.color}30`
          }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: s.color }}>{s.num}</div>
            <div style={{ fontSize: 12, color: '#5D6D7E', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* CHUYÊN KHOA */}
      <p style={{ fontSize: 13, fontWeight: 500, color: '#5D6D7E', marginBottom: 10 }}>
        Tìm theo chuyên khoa
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <button
          onClick={() => { setChuyenKhoaChon(''); search('') }}
          style={{
            padding: '7px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
            background: chuyenKhoaChon === '' ? '#2980B9' : 'white',
            color: chuyenKhoaChon === '' ? 'white' : '#5D6D7E',
            border: `1px solid ${chuyenKhoaChon === '' ? '#2980B9' : '#AED6F1'}`,
            fontWeight: 500
          }}>
          Tất cả
        </button>
        {CHUYEN_KHOA.map(ck => (
          <button key={ck.name}
            onClick={() => setChuyenKhoaChon(ck.name)}
            style={{
              padding: '7px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
              background: chuyenKhoaChon === ck.name ? ck.color : 'white',
              color: chuyenKhoaChon === ck.name ? ck.text : '#5D6D7E',
              border: `1px solid ${chuyenKhoaChon === ck.name ? ck.border : '#AED6F1'}`,
              fontWeight: chuyenKhoaChon === ck.name ? 500 : 400
            }}>
            {ck.icon} {ck.name}
          </button>
        ))}
      </div>

      {/* DANH SÁCH PHÒNG KHÁM */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#5D6D7E' }}>
          🔍 Đang tìm kiếm...
        </div>
      ) : clinics.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#AEB6BF' }}>
          Không tìm thấy kết quả phù hợp
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {clinics.map((c: any) => (
            <div key={c.id} style={{
              background: 'white', borderRadius: 14,
              border: '1px solid #D6EAF8', overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(41,128,185,0.06)'
            }}>
              {/* Thanh màu đầu card */}
              <div style={{ height: 5, background: 'linear-gradient(90deg, #2980B9, #7FB3D3)' }} />

              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  {/* Thông tin chính */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A5276', margin: '0 0 6px' }}>
                      {c.name}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 13, color: '#5D6D7E', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <MapPin size={13} color="#2980B9" /> {c.address}, {c.district}
                      </span>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: 12, padding: '3px 10px', borderRadius: 20,
                          background: '#FEF9E7', color: '#9A7D0A',
                          border: '1px solid #F9E79F', display: 'flex', alignItems: 'center', gap: 3
                        }}>
                          <Star size={11} /> {c.rating} sao
                        </span>
                        {c.distance < 999 && (
                          <span style={{
                            fontSize: 12, padding: '3px 10px', borderRadius: 20,
                            background: '#EBF5FB', color: '#2980B9', border: '1px solid #AED6F1'
                          }}>
                            📍 {c.distance.toFixed(1)} km
                          </span>
                        )}
                        {c.insurance_accepted && (
                          <span style={{
                            fontSize: 12, padding: '3px 10px', borderRadius: 20,
                            background: '#E9F7EF', color: '#1E8449', border: '1px solid #A9DFBF'
                          }}>
                            ✅ Bảo hiểm
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Liên hệ */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 160 }}>
                    <a href={`tel:${c.phone}`} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 13, color: '#1E8449', textDecoration: 'none',
                      padding: '6px 12px', background: '#E9F7EF',
                      borderRadius: 8, border: '1px solid #A9DFBF'
                    }}>
                      <Phone size={13} /> {c.phone}
                    </a>
                    {c.zalo && (
                      <button onClick={() => moZalo(c.zalo)} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 13, color: '#0068FF', cursor: 'pointer',
                        padding: '6px 12px', background: '#E8F0FF',
                        borderRadius: 8, border: '1px solid #B3C6FF',
                        width: '100%'
                      }}>
                        💬 Zalo tư vấn
                      </button>
                    )}
                    <button onClick={() => moGoogleMap(c)} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 13, color: '#C0392B', cursor: 'pointer',
                      padding: '6px 12px', background: '#FDEDEC',
                      borderRadius: 8, border: '1px solid #F1948A',
                      width: '100%'
                    }}>
                      <Navigation size={13} /> Chỉ đường
                    </button>
                  </div>
                </div>

                {/* Chi phí */}
                {c.fee_note && (
                  <div style={{
                    marginTop: 12, padding: '10px 14px',
                    background: '#F0F9FF', borderRadius: 8,
                    border: '1px solid #D6EAF8', fontSize: 12, color: '#1A5276'
                  }}>
                    💰 <strong>Chi phí tham khảo:</strong> {c.fee_note}
                  </div>
                )}

                {/* Bác sĩ theo chuyên khoa */}
                {c.doctors && c.doctors.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 12, color: '#5D6D7E', marginBottom: 6 }}>
                      👨‍⚕️ Bác sĩ đang làm việc:
                    </p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {c.doctors.map((d: any) => (
                        <a key={d.id} href={`/booking/${d.id}`} style={{
                          textDecoration: 'none',
                          display: 'flex', flexDirection: 'column',
                          padding: '8px 12px',
                          background: '#EBF5FB', border: '1px solid #AED6F1',
                          borderRadius: 8, cursor: 'pointer', minWidth: 150
                        }}>
                          <span style={{ fontSize: 12, fontWeight: 500, color: '#1A5276' }}>
                            {d.name}
                          </span>
                          <span style={{ fontSize: 11, color: '#2980B9', marginTop: 2 }}>
                            🔬 {d.specialty}
                          </span>
                          <span style={{ fontSize: 11, color: '#1E8449', marginTop: 2 }}>
                            💵 {d.fee?.toLocaleString()}đ/lần
                          </span>
                          <span style={{ fontSize: 11, color: '#F39C12', marginTop: 2 }}>
                            ⭐ {d.rating} · {d.experience_years} năm KN
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}