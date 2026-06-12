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

  const isAdmin = pathname.startsWith('/admin')
  if (isAdmin) return null

  return (
    <header style={{
      background: 'white',
      borderBottom: '2px solid #E8F4FD',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 12px rgba(26,82,118,0.08)'
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '0 24px',
        display: 'flex', alignItems: 'center',
        height: 64, gap: 32
      }}>
        {/* Logo */}
        <Link href="/" style={{
          textDecoration: 'none', flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #1A5276, #2980B9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18
          }}>🏥</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1A5276', lineHeight: 1.2 }}>
              Đặt Lịch Khám
            </div>
            <div style={{ fontSize: 10, color: '#7F8C8D', letterSpacing: 0.5 }}>
              HỆ THỐNG Y TẾ
            </div>
          </div>
        </Link>

        {/* Divider */}
        <div style={{ width: 1, height: 32, background: '#E8F4FD' }} />

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 2, flex: 1 }}>
          {[
            { href: '/', label: 'Trang chủ', icon: '🏠' },
            { href: '/my-appointments', label: 'Lịch hẹn', icon: '📅' },
          ].map(link => (
            <Link key={link.href} href={link.href} style={{
              fontSize: 13, textDecoration: 'none',
              padding: '8px 16px', borderRadius: 8,
              display: 'flex', alignItems: 'center', gap: 6,
              color: pathname === link.href ? '#1A5276' : '#5D6D7E',
              background: pathname === link.href ? '#EBF5FB' : 'transparent',
              fontWeight: pathname === link.href ? 600 : 400,
              borderBottom: pathname === link.href ? '2px solid #2980B9' : '2px solid transparent',
              transition: 'all 0.15s'
            }}>
              <span>{link.icon}</span> {link.label}
            </Link>
          ))}
        </nav>


        {/* User */}
        {user ? (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuMo(!menuMo)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 12px 6px 6px',
              border: '1.5px solid #AED6F1', borderRadius: 24,
              background: 'white', cursor: 'pointer',
              transition: 'all 0.15s'
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #2980B9, #1A5276)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 13, fontWeight: 600
              }}>
                {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 13, color: '#1A5276', fontWeight: 500, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </span>
              <span style={{ fontSize: 10, color: '#7F8C8D' }}>▼</span>
            </button>

            {menuMo && (
              <>
                <div onClick={() => setMenuMo(false)} style={{
                  position: 'fixed', inset: 0, zIndex: 150
                }} />
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'white', border: '1px solid #D6EAF8',
                  borderRadius: 16, boxShadow: '0 8px 32px rgba(26,82,118,0.15)',
                  minWidth: 220, overflow: 'hidden', zIndex: 200
                }}>
                  <div style={{
                    padding: '16px', background: 'linear-gradient(135deg, #EBF5FB, #E8F8F5)',
                    borderBottom: '1px solid #D6EAF8'
                  }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2980B9, #1A5276)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: 20, fontWeight: 600,
                      margin: '0 auto 10px'
                    }}>
                      {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <p style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#1A5276', margin: 0 }}>
                      {user.user_metadata?.full_name || 'Người dùng'}
                    </p>
                    <p style={{ textAlign: 'center', fontSize: 12, color: '#7F8C8D', margin: '4px 0 0' }}>
                      {user.email}
                    </p>
                  </div>

                  {[
                    { href: '/my-appointments', icon: '📅', label: 'Lịch hẹn của tôi' },
                    { href: '/profile', icon: '👤', label: 'Hồ sơ cá nhân' },
                  ].map(item => (
                    <Link key={item.href} href={item.href}
                      onClick={() => setMenuMo(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 16px', fontSize: 13, color: '#1A5276',
                        textDecoration: 'none', borderBottom: '1px solid #F4F9FD',
                        transition: 'background 0.1s'
                      }}>
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}

                  <button onClick={dangXuat} style={{
                    width: '100%', padding: '12px 16px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'none', border: 'none',
                    fontSize: 13, color: '#E74C3C', cursor: 'pointer',
                    textAlign: 'left'
                  }}>
                    <span style={{ fontSize: 16 }}>🚪</span>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/auth/login" style={{
              fontSize: 13, color: '#2980B9', textDecoration: 'none',
              padding: '8px 18px', border: '1.5px solid #AED6F1',
              borderRadius: 20, fontWeight: 500, transition: 'all 0.15s'
            }}>
              Đăng nhập
            </Link>
            <Link href="/auth/register" style={{
              fontSize: 13, color: 'white', textDecoration: 'none',
              padding: '8px 18px',
              background: 'linear-gradient(135deg, #2980B9, #1A5276)',
              borderRadius: 20, fontWeight: 500
            }}>
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer style={{
      background: '#1A5276', color: 'white',
      padding: '40px 24px 24px', marginTop: 60
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
              }}>🏥</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>ĐặtLịchKhám</div>
                <div style={{ fontSize: 10, opacity: 0.7 }}>HỆ THỐNG Y TẾ</div>
              </div>
            </div>
            <p style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.7 }}>
              Nền tảng đặt lịch khám bệnh trực tuyến uy tín, kết nối bệnh nhân với các bác sĩ chuyên khoa hàng đầu.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, opacity: 0.9 }}>LIÊN KẾT NHANH</h4>
            {['Trang chủ', 'Đặt lịch khám', 'Lịch hẹn của tôi', 'Hồ sơ cá nhân'].map(item => (
              <div key={item} style={{ fontSize: 12, opacity: 0.7, marginBottom: 8, cursor: 'pointer' }}>
                → {item}
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, opacity: 0.9 }}>LIÊN HỆ</h4>
            <div style={{ fontSize: 12, opacity: 0.7, lineHeight: 2 }}>
              <div>📞 Hotline: 1800 599 920</div>
              <div>✉️ support@datlichkham.vn</div>
              <div>⏰ 7:00 - 22:00 hàng ngày</div>
              <div>📍 Hà Nội, Việt Nam</div>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, opacity: 0.9 }}>CAM KẾT</h4>
            {['🔒 Bảo mật thông tin bệnh nhân', '✅ Đội ngũ bác sĩ chuyên nghiệp', '⚡ Đặt lịch nhanh chóng', '💊 Đa khoa '].map(item => (
              <div key={item} style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>{item}</div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, textAlign: 'center', fontSize: 12, opacity: 0.5 }}>
          © 2026 Đặt Lịch Khám. Được thiết kế và phát triển bởi plynh#2203 .
        </div>
      </div>
    </footer>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <title>ĐặtLịchKhám — Đặt lịch khám bệnh trực tuyến</title>
        <meta name="description" content="Nền tảng đặt lịch khám bệnh trực tuyến uy tín tại Việt Nam" />
      </head>
      <body style={{
        margin: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: '#F7FAFC',
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column'
      }}>
        <Header />
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  )
}