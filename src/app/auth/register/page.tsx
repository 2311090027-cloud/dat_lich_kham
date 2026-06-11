'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inputStyle = {
    width: '100%', padding: '10px 14px', boxSizing: 'border-box' as const,
    border: '1.5px solid #AED6F1', borderRadius: 10, fontSize: 14,
    color: '#1A252F', background: 'white', outline: 'none'
  }

  const labelStyle = {
    fontSize: 13, color: '#1A5276', display: 'block',
    marginBottom: 5, fontWeight: 500
  }

  const dangKy = async () => {
    setError('')
    if (!form.fullName || !form.email || !form.password)
      return setError('Vui lòng điền đầy đủ thông tin')
    if (form.password.length < 6)
      return setError('Mật khẩu phải có ít nhất 6 ký tự')
    if (form.password !== form.confirmPassword)
      return setError('Mật khẩu xác nhận không khớp')

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          phone: form.phone
        }
      }
    })

    setLoading(false)
    if (error) return setError(error.message)

    // Đăng ký thành công → đăng nhập luôn
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password
    })

    if (!loginError) {
      router.push('/')
      router.refresh()
    } else {
      router.push('/auth/login')
    }
  }

  return (
    <div style={{ maxWidth: 460, margin: '40px auto', padding: '0 16px' }}>
      <div style={{
        background: 'white', borderRadius: 16,
        border: '1px solid #D6EAF8', padding: '32px 28px',
        boxShadow: '0 2px 12px rgba(41,128,185,0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏥</div>
          <h1 style={{ fontSize: 20, fontWeight: 500, color: '#1A5276', margin: 0 }}>
            Tạo tài khoản
          </h1>
          <p style={{ fontSize: 13, color: '#7F8C8D', marginTop: 6 }}>
            Đăng ký để đặt lịch khám nhanh hơn
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Họ và tên *</label>
            <input
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
              placeholder="Nguyễn Văn A"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="email@gmail.com"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Số điện thoại</label>
            <input
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="0912345678"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Mật khẩu *</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Ít nhất 6 ký tự"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Xác nhận mật khẩu *</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && dangKy()}
              placeholder="Nhập lại mật khẩu"
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', background: '#FDEDEC',
              border: '1px solid #F1948A', borderRadius: 8,
              fontSize: 13, color: '#C0392B'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button onClick={dangKy} disabled={loading} style={{
            padding: '12px', marginTop: 4,
            background: loading ? '#AED6F1' : '#2980B9',
            color: 'white', border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: 500, cursor: 'pointer'
          }}>
            {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#7F8C8D', marginTop: 20 }}>
          Đã có tài khoản?{' '}
          <Link href="/auth/login" style={{ color: '#2980B9', textDecoration: 'none', fontWeight: 500 }}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}