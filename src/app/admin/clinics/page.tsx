'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Doctor = {
  id: string; name: string; specialty: string
  clinic_id: string; experience_years: number
  rating: number; fee: number; bio: string
  available_days: string; start_time: string; end_time: string
}

export default function AdminDoctorsPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [clinics, setClinics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [moForm, setMoForm] = useState(false)
  const [dangSua, setDangSua] = useState<Doctor | null>(null)
  const [saving, setSaving] = useState(false)
  const [xacNhanXoa, setXacNhanXoa] = useState<string | null>(null)

  const formRong = {
    id: '', name: '', specialty: '', clinic_id: '',
    experience_years: 0, rating: 5, fee: 200000,
    bio: '', available_days: 'Thứ 2-6',
    start_time: '08:00', end_time: '17:00'
  }
  const [form, setForm] = useState(formRong)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      if (profile?.role !== 'admin') { router.push('/'); return }
      loadData()
    })
  }, [])

  const loadData = async () => {
    setLoading(true)
    const supabase = createClient()
    const [{ data: docs }, { data: clin }] = await Promise.all([
      supabase.from('doctors').select('*').order('name'),
      supabase.from('clinics').select('id, name').order('name')
    ])
    setDoctors(docs || [])
    setClinics(clin || [])
    setLoading(false)
  }

  const moThemMoi = () => { setForm(formRong); setDangSua(null); setMoForm(true) }

  const moChinhSua = (doc: Doctor) => {
    setForm({ ...doc }); setDangSua(doc); setMoForm(true)
  }

  const luu = async () => {
    if (!form.name || !form.specialty || !form.clinic_id) return alert('Vui lòng điền đủ thông tin bắt buộc!')
    setSaving(true)
    const supabase = createClient()

    if (dangSua) {
      await supabase.from('doctors').update({
        name: form.name, specialty: form.specialty,
        clinic_id: form.clinic_id,
        experience_years: Number(form.experience_years),
        rating: Number(form.rating), fee: Number(form.fee),
        bio: form.bio, available_days: form.available_days,
        start_time: form.start_time, end_time: form.end_time
      }).eq('id', dangSua.id)
    } else {
      const newId = 'D' + Date.now()
      await supabase.from('doctors').insert({
        id: newId, name: form.name, specialty: form.specialty,
        clinic_id: form.clinic_id,
        experience_years: Number(form.experience_years),
        rating: Number(form.rating), fee: Number(form.fee),
        bio: form.bio, available_days: form.available_days,
        start_time: form.start_time, end_time: form.end_time
      })
    }
    setSaving(false); setMoForm(false); loadData()
  }

  const xoa = async (id: string) => {
    const supabase = createClient()
    await supabase.from('doctors').delete().eq('id', id)
    setXacNhanXoa(null); loadData()
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', boxSizing: 'border-box' as const,
    border: '1.5px solid #AED6F1', borderRadius: 8,
    fontSize: 13, color: '#1A252F', background: 'white'
  }

  const labelStyle = { fontSize: 12, color: '#1A5276', display: 'block', marginBottom: 4, fontWeight: 500 as const }

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#7F8C8D' }}>Đang tải...</div>

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 13, color: '#7F8C8D', marginBottom: 6, display: 'flex', gap: 6 }}>
            <Link href="/admin" style={{ color: '#2980B9', textDecoration: 'none' }}>⚙️ Admin</Link>
            <span>›</span><span>Quản lý bác sĩ</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: '#1A5276', margin: 0 }}>
            👨‍⚕️ Quản lý bác sĩ
          </h1>
          <p style={{ fontSize: 13, color: '#7F8C8D', margin: '4px 0 0' }}>
            {doctors.length} bác sĩ trong hệ thống
          </p>
        </div>
        <button onClick={moThemMoi} style={{
          padding: '10px 20px', background: '#2980B9', color: 'white',
          border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer'
        }}>
          + Thêm bác sĩ mới
        </button>
      </div>

      {/* Bảng danh sách */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #D6EAF8', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#EBF5FB', borderBottom: '1px solid #D6EAF8' }}>
                {['Tên bác sĩ', 'Chuyên khoa', 'Phòng khám', 'Kinh nghiệm', 'Phí khám', 'Giờ làm', 'Đánh giá', 'Thao tác'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: '#1A5276', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc, i) => (
                <tr key={doc.id} style={{ borderBottom: '1px solid #F4F9FD', background: i % 2 === 0 ? 'white' : '#FAFCFF' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 500, color: '#1A5276' }}>{doc.name}</div>
                    {doc.bio && <div style={{ fontSize: 12, color: '#7F8C8D', marginTop: 2 }}>{doc.bio.slice(0, 40)}...</div>}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 12, padding: '3px 10px', background: '#EBF5FB', color: '#2980B9', borderRadius: 20, border: '1px solid #AED6F1' }}>
                      {doc.specialty}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#5D6D7E', fontSize: 12 }}>
                    {clinics.find(c => c.id === doc.clinic_id)?.name || '—'}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#5D6D7E' }}>{doc.experience_years} năm</td>
                  <td style={{ padding: '12px 14px', color: '#1E8449', fontWeight: 500 }}>
                    {Number(doc.fee).toLocaleString()}đ
                  </td>
                  <td style={{ padding: '12px 14px', color: '#5D6D7E', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {doc.available_days}<br />
                    {doc.start_time?.slice(0,5)} – {doc.end_time?.slice(0,5)}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ color: '#F39C12', fontSize: 13 }}>⭐ {doc.rating}</span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => moChinhSua(doc)} style={{
                        padding: '5px 12px', background: '#EBF5FB', color: '#2980B9',
                        border: '1px solid #AED6F1', borderRadius: 6, fontSize: 12, cursor: 'pointer'
                      }}>✏️ Sửa</button>
                      <button onClick={() => setXacNhanXoa(doc.id)} style={{
                        padding: '5px 12px', background: '#FDEDEC', color: '#C0392B',
                        border: '1px solid #F1948A', borderRadius: 6, fontSize: 12, cursor: 'pointer'
                      }}>🗑️ Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal xác nhận xóa */}
      {xacNhanXoa && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, maxWidth: 380, width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: 17, fontWeight: 500, color: '#1A5276', margin: '0 0 8px' }}>Xác nhận xóa?</h3>
            <p style={{ fontSize: 13, color: '#7F8C8D', margin: '0 0 20px' }}>Hành động này không thể hoàn tác!</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setXacNhanXoa(null)} style={{
                flex: 1, padding: '10px', background: '#EBF5FB', color: '#2980B9',
                border: '1px solid #AED6F1', borderRadius: 8, fontSize: 13, cursor: 'pointer'
              }}>Hủy bỏ</button>
              <button onClick={() => xoa(xacNhanXoa)} style={{
                flex: 1, padding: '10px', background: '#E74C3C', color: 'white',
                border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500
              }}>Xóa luôn</button>
            </div>
          </div>
        </div>
      )}

      {/* Form thêm/sửa */}
      {moForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16
        }}>
          <div style={{
            background: 'white', borderRadius: 16, padding: 28,
            maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: 17, fontWeight: 500, color: '#1A5276', margin: '0 0 20px' }}>
              {dangSua ? '✏️ Chỉnh sửa bác sĩ' : '+ Thêm bác sĩ mới'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Họ và tên bác sĩ *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="BS. Nguyễn Văn A" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Chuyên khoa *</label>
                <select value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} style={inputStyle}>
                  <option value="">-- Chọn chuyên khoa --</option>
                  {['Tim mạch', 'Nội tổng quát', 'Nhi khoa', 'Da liễu', 'Xương khớp', 'Thần kinh', 'Mắt', 'Tai mũi họng'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Phòng khám *</label>
                <select value={form.clinic_id} onChange={e => setForm({ ...form, clinic_id: e.target.value })} style={inputStyle}>
                  <option value="">-- Chọn phòng khám --</option>
                  {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Kinh nghiệm (năm)</label>
                <input type="number" value={form.experience_years} onChange={e => setForm({ ...form, experience_years: Number(e.target.value) })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phí khám (đồng)</label>
                <input type="number" value={form.fee} onChange={e => setForm({ ...form, fee: Number(e.target.value) })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Đánh giá (1-5)</label>
                <input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Ngày làm việc</label>
                <input value={form.available_days} onChange={e => setForm({ ...form, available_days: e.target.value })} placeholder="Thứ 2-6" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Giờ bắt đầu</label>
                <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Giờ kết thúc</label>
                <input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Giới thiệu</label>
                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Mô tả ngắn về bác sĩ..." style={{ ...inputStyle, height: 80, resize: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setMoForm(false)} style={{
                flex: 1, padding: '11px', background: '#EBF5FB', color: '#2980B9',
                border: '1px solid #AED6F1', borderRadius: 10, fontSize: 13, cursor: 'pointer'
              }}>Hủy</button>
              <button onClick={luu} disabled={saving} style={{
                flex: 2, padding: '11px', background: saving ? '#AED6F1' : '#2980B9',
                color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer'
              }}>
                {saving ? 'Đang lưu...' : dangSua ? '💾 Cập nhật' : '+ Thêm bác sĩ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}