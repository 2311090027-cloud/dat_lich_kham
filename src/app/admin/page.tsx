'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ADMIN_EMAIL = 'isunn@gmail.com' 

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loi, setLoi] = useState('')
  const [dangGui, setDangGui] = useState(false)

  const dangNhap = async () => {
    if (!email || !password) return setLoi('Vui lòng nhập đầy đủ thông tin')
    setDangGui(true)
    setLoi('')

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.user) {
      setDangGui(false)
      return setLoi('Email hoặc mật khẩu không đúng')
    }

    // Chỉ cho phép email admin
    if (data.user.email !== ADMIN_EMAIL) {
      await supabase.auth.signOut()
      setDangGui(false)
      return setLoi('Tài khoản này không có quyền admin')
    }

    router.push('/admin/appointments')
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#F0F4F8',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }}>
      <div style={{
        background: 'white', borderRadius: 16,
        border: '1px solid #D6EAF8', padding: '40px 32px',
        width: '100%', maxWidth: 400,
        boxShadow: '0 4px 20px rgba(41,128,185,0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏥</div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1A5276', margin: '0 0 4px' }}>
            Trang quản trị
          </h1>
          <p style={{ fontSize: 13, color: '#7F8C8D', margin: 0 }}>
            Chỉ dành cho quản trị viên
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#1A5276', display: 'block', marginBottom: 5 }}>
              Email admin
            </label>
            <input
              type="email"
              placeholder="admin@datlichkham.vn"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && dangNhap()}
              style={{
                width: '100%', padding: '10px 14px', boxSizing: 'border-box',
                border: '1.5px solid #AED6F1', borderRadius: 10,
                fontSize: 14, outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#1A5276', display: 'block', marginBottom: 5 }}>
              Mật khẩu
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && dangNhap()}
              style={{
                width: '100%', padding: '10px 14px', boxSizing: 'border-box',
                border: '1.5px solid #AED6F1', borderRadius: 10,
                fontSize: 14, outline: 'none'
              }}
            />
          </div>

          {loi && (
            <div style={{
              padding: '10px 14px', background: '#FDEDEC',
              border: '1px solid #F1948A', borderRadius: 8,
              fontSize: 13, color: '#C0392B'
            }}>
              ⚠️ {loi}
            </div>
          )}

          <button
            onClick={dangNhap}
            disabled={dangGui}
            style={{
              padding: '12px', background: dangGui ? '#AED6F1' : '#1A5276',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 14, fontWeight: 500,
              cursor: dangGui ? 'not-allowed' : 'pointer', marginTop: 4
            }}
          >
            {dangGui ? '⏳ Đang xử lý...' : '🔐 Đăng nhập'}
          </button>
        </div>

        <p style={{ fontSize: 12, color: '#AEB6BF', textAlign: 'center', marginTop: 20 }}>
          Không phải admin?{' '}
          <a href="/" style={{ color: '#2980B9', textDecoration: 'none' }}>
            Về trang chủ
          </a>
        </p>
      </div>
    </div>
  )
}