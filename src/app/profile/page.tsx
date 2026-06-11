'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    full_name: '', phone: '', address: '',
    district: '', dob: '', gender: '',
    bhyt: '', emergency_contact: '',
    blood_type: '', allergies: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      setUser(data.user)

      // Lấy profile từ bảng profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profile) {
        setForm({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          address: profile.address || '',
          district: profile.district || '',
          dob: profile.dob || '',
          gender: profile.gender || '',
          bhyt: profile.bhyt || '',
          emergency_contact: profile.emergency_contact || '',
          blood_type: profile.blood_type || '',
          allergies: profile.allergies || '',
        })
        setAvatarUrl(profile.avatar_url || '')
      } else {
        // Chưa có profile → lấy từ metadata
        setForm(prev => ({
          ...prev,
          full_name: data.user.user_metadata?.full_name || '',
          phone: data.user.user_metadata?.phone || '',
        }))
      }
      setLoading(false)
    })
  }, [])

  const luuHoSo = async () => {
    setSaving(true)
    setError('')
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...form,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })

    setSaving(false)
    if (error) return setError(error.message)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const chonAnh = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return setError('Ảnh phải nhỏ hơn 2MB')
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    boxSizing: 'border-box' as const,
    border: '1.5px solid #AED6F1', borderRadius: 10,
    fontSize: 14, color: '#1A252F',
    background: 'white', outline: 'none'
  }

  const labelStyle = {
    fontSize: 13, color: '#1A5276',
    display: 'block', marginBottom: 5, fontWeight: 500 as const
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: '#7F8C8D' }}>
      Đang tải hồ sơ...
    </div>
  )

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px' }}>

      <div style={{ fontSize: 13, color: '#7F8C8D', marginBottom: 20, display: 'flex', gap: 6 }}>
        <Link href="/" style={{ color: '#2980B9', textDecoration: 'none' }}>🏠 Trang chủ</Link>
        <span>›</span>
        <span>Hồ sơ cá nhân</span>
      </div>

      {/* Header avatar */}
      <div style={{
        background: 'linear-gradient(135deg, #EBF5FB 0%, #E8F8F5 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 20,
        border: '1px solid #D6EAF8',
        display: 'flex', alignItems: 'center', gap: 20
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div onClick={() => fileRef.current?.click()} style={{
            width: 88, height: 88, borderRadius: '50%',
            background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #2980B9, #1A5276)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, color: 'white', cursor: 'pointer',
            border: '3px solid white',
            boxShadow: '0 4px 12px rgba(41,128,185,0.2)',
            overflow: 'hidden'
          }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (form.full_name || 'U')[0].toUpperCase()
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={chonAnh} style={{ display: 'none' }} />
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, color: '#1A5276', margin: '0 0 4px' }}>
            {form.full_name || 'Chưa cập nhật tên'}
          </h1>
          <p style={{ fontSize: 13, color: '#5D6D7E', margin: '0 0 8px' }}>
            📧 {user?.email}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {form.blood_type && (
              <span style={{ fontSize: 12, padding: '3px 10px', background: '#FDEDEC', color: '#C0392B', border: '1px solid #F1948A', borderRadius: 20 }}>
                🩸 Nhóm máu: {form.blood_type}
              </span>
            )}
            {form.bhyt && (
              <span style={{ fontSize: 12, padding: '3px 10px', background: '#E9F7EF', color: '#1E8449', border: '1px solid #A9DFBF', borderRadius: 20 }}>
                ✅ Có BHYT
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: '#AEB6BF', margin: '8px 0 0' }}>
            📷 Nhấn vào ảnh để đổi ảnh đại diện
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Thông tin cá nhân */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #D6EAF8', padding: '20px', boxShadow: '0 2px 8px rgba(41,128,185,0.06)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 500, color: '#1A5276', margin: '0 0 16px' }}>
            👤 Thông tin cá nhân
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Họ và tên</label>
              <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Nguyễn Văn A" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Số điện thoại</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0912345678" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Ngày sinh</label>
              <input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Giới tính</label>
              <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} style={inputStyle}>
                <option value="">-- Chọn --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Địa chỉ</label>
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Số nhà, tên đường" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Quận / Huyện</label>
              <input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} placeholder="Quận 1..." style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Thông tin y tế */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #D6EAF8', padding: '20px', boxShadow: '0 2px 8px rgba(41,128,185,0.06)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 500, color: '#1A5276', margin: '0 0 16px' }}>
            🏥 Thông tin y tế
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Số thẻ BHYT</label>
              <input value={form.bhyt} onChange={e => setForm({ ...form, bhyt: e.target.value })} placeholder="HS4-201234567890" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nhóm máu</label>
              <select value={form.blood_type} onChange={e => setForm({ ...form, blood_type: e.target.value })} style={inputStyle}>
                <option value="">-- Chọn --</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Liên hệ khẩn cấp</label>
              <input value={form.emergency_contact} onChange={e => setForm({ ...form, emergency_contact: e.target.value })} placeholder="Họ tên - SĐT" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Dị ứng / Tiền sử bệnh</label>
              <textarea value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} placeholder="VD: Dị ứng penicillin..." style={{ ...inputStyle, height: 90, resize: 'none' }} />
            </div>
            <div style={{ padding: '12px 14px', background: '#F4F9FD', borderRadius: 10, border: '1px solid #D6EAF8' }}>
              <p style={{ fontSize: 12, color: '#7F8C8D', margin: '0 0 4px', fontWeight: 500 }}>🔐 Tài khoản</p>
              <p style={{ fontSize: 13, color: '#1A5276', margin: 0 }}>📧 {user?.email}</p>
              <p style={{ fontSize: 12, color: '#AEB6BF', margin: '4px 0 0' }}>
                Tham gia: {new Date(user?.created_at).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nút lưu */}
      <div style={{ marginTop: 20, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'flex-end' }}>
        {error && (
          <div style={{ flex: 1, padding: '10px 14px', background: '#FDEDEC', border: '1px solid #F1948A', borderRadius: 8, fontSize: 13, color: '#C0392B' }}>
            ⚠️ {error}
          </div>
        )}
        {saved && (
          <div style={{ flex: 1, padding: '10px 14px', background: '#E9F7EF', border: '1px solid #A9DFBF', borderRadius: 8, fontSize: 13, color: '#1E8449' }}>
            ✅ Đã lưu hồ sơ thành công!
          </div>
        )}
        <Link href="/my-appointments" style={{
          padding: '11px 20px', background: '#EBF5FB', color: '#2980B9',
          border: '1px solid #AED6F1', borderRadius: 10,
          fontSize: 13, textDecoration: 'none', fontWeight: 500
        }}>
          📅 Lịch hẹn
        </Link>
        <button onClick={luuHoSo} disabled={saving} style={{
          padding: '11px 28px', background: saving ? '#AED6F1' : '#2980B9',
          color: 'white', border: 'none', borderRadius: 10,
          fontSize: 14, fontWeight: 500, cursor: 'pointer'
        }}>
          {saving ? '⏳ Đang lưu...' : '💾 Lưu hồ sơ'}
        </button>
      </div>
    </div>
  )
}