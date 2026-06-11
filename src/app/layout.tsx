'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import './globals.css'
import ChatWidget from '@/components/ChatWidget'

function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [menuMo, setMenuMo] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    supabase.auth.onAuthStateChange((_, session) => setUser(session?.user || null))
  }, [])

  const dangXuat = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/', label: '🏠 Trang chủ' },
    { href: '/my-appointments', label: '📅 Lịch hẹn' },
  ]

  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid #D6EAF8',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 8px rgba(41,128,185,0.06)'
    }}>
      <div style={{
        maxWidth: 960, margin: '0 auto',
        padding: '0 20px',
        display: 'flex', alignItems: 'center',
        height: 60, gap: 24
      }}>
        {/* Logo */}
        <Link href="/" style={{
          fontSize: 17, fontWeight: 600,
          color: '#1A5276', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 8,
          flexShrink: 0
        }}>
          🏥 ĐặtLịchKhám
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} style={{
              fontSize: 13, textDecoration: 'none',
              padding: '6px 14px', borderRadius: 8,
              color: pathname === link.href ? '#1A5276' : '#5D6D7E',
              background: pathname === link.href ? '#EBF5FB' : 'transparent',
              fontWeight: pathname === link.href ? 500 : 400,
              borderBottom: pathname === link.href ? '2px solid #2980B9' : '2px solid transparent'
            }}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User area */}
        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuMo(!menuMo)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 12px', border: '1px solid #AED6F1',
                borderRadius: 10, background: '#EBF5FB',
                cursor: 'pointer', fontSize: 13, color: '#1A5276'
              }}>
              {/* Avatar */}
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #2980B9, #1A5276)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 12, fontWeight: 500, flexShrink: 0
              }}>
                {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
              </div>
              <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.user_metadata?.full_name || user.email}
              </span>
              <span style={{ fontSize: 10 }}>▼</span>
            </button>

            {/* Dropdown menu */}
            {menuMo && (
              <div style={{
                position: 'absolute', top: '110%', right: 0,
                background: 'white', border: '1px solid #D6EAF8',
                borderRadius: 12, boxShadow: '0 4px 20px rgba(41,128,185,0.15)',
                minWidth: 200, overflow: 'hidden', zIndex: 200
              }}>
                {/* User info */}
                <div style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #EBF5FB',
                  background: '#F4F9FD'
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2980B9, #1A5276)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 18, fontWeight: 500,
                    margin: '0 auto 8px'
                  }}>
                    {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <p style={{ textAlign: 'center', fontSize: 14, fontWeight: 500, color: '#1A5276', margin: 0 }}>
                    {user.user_metadata?.full_name || 'Người dùng'}
                  </p>
                  <p style={{ textAlign: 'center', fontSize: 12, color: '#7F8C8D', margin: '2px 0 0' }}>
                    {user.email}
                  </p>
                </div>

                {/* Menu items */}
                {[
                  { href: '/', icon: '🏠', label: 'Trang chủ' },
                  { href: '/my-appointments', icon: '📅', label: 'Lịch hẹn của tôi' },
                  { href: '/profile', icon: '👤', label: 'Hồ sơ cá nhân' },
                ].map(item => (
                  <Link key={item.href} href={item.href}
                    onClick={() => setMenuMo(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '11px 16px', fontSize: 13, color: '#1A5276',
                      textDecoration: 'none', borderBottom: '1px solid #F4F9FD'
                    }}>
                    <span>{item.icon}</span> {item.label}
                  </Link>
                ))}

                <button onClick={dangXuat} style={{
                  width: '100%', padding: '11px 16px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'none', border: 'none',
                  fontSize: 13, color: '#C0392B', cursor: 'pointer',
                  textAlign: 'left'
                }}>
                  🚪 Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/auth/login" style={{
              fontSize: 13, color: '#2980B9', textDecoration: 'none',
              padding: '7px 16px', border: '1px solid #AED6F1', borderRadius: 8
            }}>
              Đăng nhập
            </Link>
            <Link href="/auth/register" style={{
              fontSize: 13, color: 'white', textDecoration: 'none',
              padding: '7px 16px', background: '#2980B9', borderRadius: 8
            }}>
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#F4F9FD', minHeight: '100vh' }}>
        <Header />
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}