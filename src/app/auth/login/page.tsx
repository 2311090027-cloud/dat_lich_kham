'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [roleChon, setRoleChon] = useState<'user' | 'admin'>('user')
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inputStyle = {
    width: '100%', padding: '10px 14px', boxSizing: 'border-box' as const,
    border: '1.5px solid #AED6F1', borderRadius: 10,
    fontSize: 14, color: '#1A252F', background: 'white', outline: 'none'
  }

  const dangNhap = async () => {
    setError('')
    if (!form.email || !form.password) return setError('Vui lòng điền đủ thông tin')
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email, password: form.password
    })

    if (error) { setLoading(false); return setError('Email hoặc mật khẩu không đúng') }

    // Kiểm tra role trong database
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', data.user.id).single()

    const role = profile?.role || 'user'

    if (roleChon === 'admin' && role !== 'admin') {
      await supabase.auth.signOut()
      setLoading(false)
      return setError('Tài khoản này không có quyền Admin')
    }

    if (roleChon === 'user' && role === 'admin') {
      setLoading(false)
      return setError('Đây là tài khoản Admin. Vui lòng chọn "Đăng nhập Admin"')
    }

    setLoading(false)
    router.push(role === 'admin' ? '/admin' : '/')
    router.refresh()
  }

  return (
    <div style={{ maxWidth: 460, margin: '40px auto', padding: '0 16px' }}>
      <div style={{
        background: 'white', borderRadius: 16,
        border: '1px solid #D6EAF8', padding: '32px 28px',
        boxShadow: '0 2px 12px rgba(41,128,185,0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>
            {roleChon === 'admin' ? '⚙️' : '👋'}
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 500, color: '#1A5276', margin: 0 }}>
            Đăng nhập
          </h1>
          <p style={{ fontSize: 13, color: '#7F8C8D', marginTop: 4 }}>
            Chào mừng bạn quay lại!
          </p>
        </div>

        {/* Chọn loại tài khoản */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          <button onClick={() => setRoleChon('user')} style={{
            padding: '12px', borderRadius: 10, cursor: 'pointer',
            border: roleChon === 'user' ? '2px solid #2980B9' : '1.5px solid #D6EAF8',
            background: roleChon === 'user' ? '#EBF5FB' : 'white',
            transition: 'all 0.15s'
          }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>👤</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: roleChon === 'user' ? '#1A5276' : '#5D6D7E' }}>
              Người dùng
            </div>
            <div style={{ fontSize: 11, color: '#7F8C8D', marginTop: 2 }}>
              Đặt lịch khám
            </div>
          </button>
          <button onClick={() => setRoleChon('admin')} style={{
            padding: '12px', borderRadius: 10, cursor: 'pointer',
            border: roleChon === 'admin' ? '2px solid #7D3C98' : '1.5px solid #D6EAF8',
            background: roleChon === 'admin' ? '#F5EEF8' : 'white',
            transition: 'all 0.15s'
          }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>⚙️</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: roleChon === 'admin' ? '#7D3C98' : '#5D6D7E' }}>
              Quản trị viên
            </div>
            <div style={{ fontSize: 11, color: '#7F8C8D', marginTop: 2 }}>
              Quản lý hệ thống
            </div>
          </button>
        </div>

        {/* Banner role */}
        <div style={{
          padding: '10px 14px', marginBottom: 16, borderRadius: 8, fontSize: 13,
          background: roleChon === 'admin' ? '#F5EEF8' : '#EBF5FB',
          border: `1px solid ${roleChon === 'admin' ? '#D7BDE2' : '#AED6F1'}`,
          color: roleChon === 'admin' ? '#7D3C98' : '#2980B9',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          {roleChon === 'admin' ? '⚙️ Đăng nhập với quyền Quản trị viên' : '👤 Đăng nhập với quyền Người dùng'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, color: '#1A5276', display: 'block', marginBottom: 5, fontWeight: 500 }}>Email</label>
            <input type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="email@gmail.com" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#1A5276', display: 'block', marginBottom: 5, fontWeight: 500 }}>Mật khẩu</label>
            <input type="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && dangNhap()}
              placeholder="Nhập mật khẩu" style={inputStyle} />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: '#FDEDEC', border: '1px solid #F1948A', borderRadius: 8, fontSize: 13, color: '#C0392B' }}>
              ⚠️ {error}
            </div>
          )}

          <button onClick={dangNhap} disabled={loading} style={{
            padding: '12px', marginTop: 4,
            background: loading ? '#AED6F1' : roleChon === 'admin' ? '#7D3C98' : '#2980B9',
            color: 'white', border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: 500, cursor: 'pointer'
          }}>
            {loading ? 'Đang xử lý...' : roleChon === 'admin' ? '⚙️ Đăng nhập Admin' : '👤 Đăng nhập'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#7F8C8D', marginTop: 20 }}>
          Chưa có tài khoản?{' '}
          <Link href="/auth/register" style={{ color: '#2980B9', textDecoration: 'none', fontWeight: 500 }}>
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  )
}