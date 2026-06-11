'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

type Msg = { role: 'user' | 'assistant'; content: string }

export default function ChatWidget() {
  const [mo, setMo] = useState(false)
  const [userName, setUserName] = useState('')
  const [inputName, setInputName] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const batDau = () => {
    if (!inputName.trim()) return
    setUserName(inputName.trim())
    setMessages([{
      role: 'assistant',
      content: `Xin chào ${inputName.trim()}! 👋 Tôi là trợ lý tư vấn sức khỏe. Tôi có thể giúp bạn:\n\n• Tìm chuyên khoa phù hợp\n• Hướng dẫn đặt lịch khám\n• Thông tin chi phí & liên hệ\n\nBạn đang gặp vấn đề gì ạ?`
    }])
  }

  const gui = async () => {
    if (!input.trim() || loading) return
    const newMsgs: Msg[] = [...messages, { role: 'user', content: input }]
    setMessages(newMsgs)
    setInput('')
    setLoading(true)

    const res = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMsgs, userName })
    })
    const data = await res.json()
    setMessages([...newMsgs, { role: 'assistant', content: data.reply }])
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => setMo(!mo)} style={{
        position: 'fixed', bottom: 24, right: 24,
        width: 54, height: 54, borderRadius: '50%',
        background: 'linear-gradient(135deg, #2980B9, #1A5276)',
        color: 'white', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(41,128,185,0.4)', zIndex: 999
      }}>
        {mo ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {mo && (
        <div style={{
          position: 'fixed', bottom: 90, right: 24,
          width: 340, borderRadius: 16,
          background: 'white', border: '1px solid #D6EAF8',
          boxShadow: '0 8px 32px rgba(41,128,185,0.15)',
          display: 'flex', flexDirection: 'column', zIndex: 998,
          maxHeight: 480
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #2980B9, #1A5276)',
            color: 'white', padding: '12px 16px',
            borderRadius: '16px 16px 0 0',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#A9DFBF'
            }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>🩺 Trợ lý tư vấn sức khỏe</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>Trả lời trong vài giây</div>
            </div>
          </div>

          {/* Nhập tên */}
          {!userName ? (
            <div style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>👋</div>
              <p style={{ fontSize: 14, color: '#1A5276', fontWeight: 500, marginBottom: 6 }}>
                Xin chào! Cho tôi biết tên bạn nhé
              </p>
              <p style={{ fontSize: 12, color: '#7F8C8D', marginBottom: 14 }}>
                Để tôi có thể tư vấn tốt hơn cho bạn
              </p>
              <input
                value={inputName}
                onChange={e => setInputName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && batDau()}
                placeholder="Nhập tên của bạn..."
                style={{
                  width: '100%', padding: '10px 14px',
                  border: '1.5px solid #AED6F1', borderRadius: 10,
                  fontSize: 13, marginBottom: 10,
                  boxSizing: 'border-box', color: '#1A252F'
                }}
              />
              <button onClick={batDau} style={{
                width: '100%', padding: '10px',
                background: 'linear-gradient(135deg, #2980B9, #1A5276)',
                color: 'white', border: 'none', borderRadius: 10,
                fontSize: 13, fontWeight: 500, cursor: 'pointer'
              }}>
                Bắt đầu tư vấn →
              </button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div style={{
                flex: 1, overflowY: 'auto', padding: 12,
                display: 'flex', flexDirection: 'column', gap: 8,
                maxHeight: 320
              }}>
                {messages.map((m, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start'
                  }}>
                    <div style={{
                      maxWidth: '85%', padding: '9px 13px',
                      borderRadius: m.role === 'user' ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
                      fontSize: 13, lineHeight: 1.6,
                      background: m.role === 'user'
                        ? 'linear-gradient(135deg, #2980B9, #1A5276)'
                        : '#EBF5FB',
                      color: m.role === 'user' ? 'white' : '#1A252F',
                      border: m.role === 'assistant' ? '1px solid #D6EAF8' : 'none',
                      whiteSpace: 'pre-line'
                    }}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{
                      background: '#EBF5FB', padding: '10px 16px',
                      borderRadius: '2px 12px 12px 12px',
                      border: '1px solid #D6EAF8', color: '#2980B9', fontSize: 16
                    }}>
                      ●●●
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: 10, borderTop: '1px solid #D6EAF8',
                display: 'flex', gap: 8
              }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && gui()}
                  placeholder="Mô tả triệu chứng..."
                  style={{
                    flex: 1, padding: '8px 12px',
                    border: '1.5px solid #AED6F1', borderRadius: 10,
                    fontSize: 13, color: '#1A252F', background: 'white'
                  }}
                />
                <button onClick={gui} disabled={loading} style={{
                  padding: '8px 12px',
                  background: loading ? '#AED6F1' : '#2980B9',
                  color: 'white', border: 'none',
                  borderRadius: 10, cursor: 'pointer'
                }}>
                  <Send size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}