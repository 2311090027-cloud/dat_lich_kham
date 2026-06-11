import { NextRequest, NextResponse } from 'next/server'

function boDau(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
}

const cauTraLoi: { keywords: string[]; reply: (name: string) => string }[] = [
  {
    keywords: ['tim', 'mach', 'dau nguc', 'kho tho', 'huyet ap', 'hoi hop'],
    reply: (name) => `Chào ${name}! Dựa trên triệu chứng bạn mô tả, tôi khuyên bạn nên đến khám tại chuyên khoa **Tim mạch**.\n\n👨‍⚕️ Bác sĩ gợi ý:\n• BS. Nguyễn Văn An — 15 năm KN, ⭐ 4.8 (Phòng khám Đa khoa Hà Nội)\n• BS. Trần Thị Bình — 10 năm KN, ⭐ 4.6 (BV Thu Cúc)\n\n📞 Để đặt lịch, bạn bấm vào tên bác sĩ trên trang chủ hoặc gọi hotline phòng khám nhé!`
  },
  {
    keywords: ['dau bung', 'buon non', 'tieu chay', 'da day', 'sot', 'met', 'non'],
    reply: (name) => `Chào ${name}! Triệu chứng của bạn có thể liên quan đến **Nội tổng quát**.\n\n👨‍⚕️ Bác sĩ gợi ý:\n• BS. Lê Minh Cường — 8 năm KN, ⭐ 4.5 (Phòng khám Đa khoa Hà Nội)\n• BS. Phạm Thị Dung — 12 năm KN, ⭐ 4.7 (Phòng khám Quốc tế Việt Pháp)\n\n💡 Lưu ý: Nếu triệu chứng kéo dài hơn 3 ngày hoặc có dấu hiệu nặng hơn, hãy đến khám sớm!`
  },
  {
    keywords: ['tre em', 'tre', 'be', 'con', 'nhi', 'tre sot', 'tre ho'],
    reply: (name) => `Chào ${name}! Với trẻ em, bạn nên đưa bé đến khám tại chuyên khoa **Nhi khoa**.\n\n👨‍⚕️ Bác sĩ gợi ý:\n• BS. Hoàng Văn Em — 20 năm KN, ⭐ 4.9 (BV Thu Cúc) — Chuyên gia hàng đầu!\n• BS. Nguyễn Thị Phương — 7 năm KN, ⭐ 4.4 (Phòng khám Đa khoa Medlatec)\n\n⚠️ Nếu trẻ sốt cao trên 39°C hoặc khó thở, hãy đến viện ngay!`
  },
  {
    keywords: ['da', 'man', 'ngua', 'mun', 'di ung', 'me day'],
    reply: (name) => `Chào ${name}! Vấn đề về da nên được khám tại chuyên khoa **Da liễu**.\n\n👨‍⚕️ Bác sĩ gợi ý:\n• BS. Đỗ Quốc Hùng — 11 năm KN, ⭐ 4.7 (Phòng khám Đa khoa Hà Nội)\n• BS. Vũ Thị Lan — 9 năm KN, ⭐ 4.5 (Phòng khám Quốc tế Việt Pháp)\n\n💰 Chi phí khám Da liễu: 200k–400k/lần`
  },
  {
    keywords: ['xuong', 'khop', 'dau lung', 'dau vai', 'thoai hoa', 'dau dau goi'],
    reply: (name) => `Chào ${name}! Đau xương khớp nên khám tại chuyên khoa **Xương khớp**.\n\n👨‍⚕️ Bác sĩ gợi ý:\n• BS. Trương Thị Oanh — 16 năm KN, ⭐ 4.8 (Phòng khám Đa khoa Medlatec)\n• BS. Bùi Văn Nam — 14 năm KN, ⭐ 4.6 (BV Thu Cúc)\n\n💡 Lời khuyên: Không nên tự ý mua thuốc giảm đau khi chưa được chẩn đoán!`
  },
  {
    keywords: ['dau dau', 'chong mat', 'mat ngu', 'than kinh', 'te bi', 'nhuc dau'],
    reply: (name) => `Chào ${name}! Triệu chứng đau đầu, chóng mặt liên quan đến **Thần kinh**.\n\n👨‍⚕️ Bác sĩ gợi ý:\n• BS. Lý Thanh Phong — 18 năm KN, ⭐ 4.9 (Phòng khám Đa khoa Hà Nội) — Chuyên gia hàng đầu!\n• BS. Ngô Thị Quỳnh — 13 năm KN, ⭐ 4.7 (Phòng khám Quốc tế Việt Pháp)\n\n⚠️ Nếu đột ngột đau đầu dữ dội hoặc liệt mặt, hãy gọi cấp cứu ngay!`
  },
  {
    keywords: ['mat', 'mo mat', 'dau mat', 'mat do', 'nhuc mat', 'can thi'],
    reply: (name) => `Chào ${name}! Vấn đề về mắt nên được khám tại chuyên khoa **Mắt**.\n\n👨‍⚕️ Bác sĩ gợi ý:\n• BS. Phan Văn Rạng — 10 năm KN, ⭐ 4.6 (Phòng khám Đa khoa Medlatec)\n• BS. Đinh Thị Sen — 8 năm KN, ⭐ 4.5 (BV Thu Cúc)\n\n💰 Chi phí khám Mắt: 230k–400k/lần`
  },
  {
    keywords: ['ho', 'dau hong', 'nghet mui', 'viem hong', 'tai', 'viem xoang', 'amidan'],
    reply: (name) => `Chào ${name}! Nên khám tại chuyên khoa **Tai Mũi Họng (TMH)**.\n\n👨‍⚕️ Bác sĩ gợi ý:\n• BS. Cao Minh Tuấn — 12 năm KN, ⭐ 4.8 (Phòng khám Quốc tế Việt Pháp)\n\n💰 Chi phí khám TMH: 270k–450k/lần\n📞 Đặt lịch hoặc tư vấn qua Zalo tại trang chủ!`
  },
  {
    keywords: ['dat lich', 'dat', 'lich', 'hen', 'kham', 'book'],
    reply: (name) => `Chào ${name}! Để đặt lịch khám, bạn làm theo các bước sau:\n\n1️⃣ Vào trang chủ → chọn chuyên khoa\n2️⃣ Chọn phòng khám phù hợp\n3️⃣ Bấm vào tên bác sĩ muốn khám\n4️⃣ Chọn ngày và giờ còn trống\n5️⃣ Điền thông tin → bấm Xác nhận\n\nRất đơn giản! Bạn cần hỗ trợ gì thêm không?`
  },
  {
    keywords: ['phi', 'gia', 'chi phi', 'bao nhieu', 'tien'],
    reply: (name) => `Chào ${name}! Chi phí khám tham khảo tại các cơ sở:\n\n🏥 Phòng khám Đa khoa Hà Nội:\n• Tổng quát: 150k–300k · Tim mạch: 300k–500k\n\n🏥 Bệnh viện Thu Cúc:\n• Tổng quát: 200k–400k · Nhi khoa: 280k–450k\n\n🏥 Phòng khám Việt Pháp:\n• Tổng quát: 180k–350k · Thần kinh: 380k–600k\n\n🏥 Medlatec:\n• Tổng quát: 160k–320k · Mắt: 250k–400k\n\n💡 Chi phí thực tế có thể thay đổi tùy trường hợp bệnh!`
  },
  {
    keywords: ['zalo', 'lien he', 'tu van', 'hotline', 'dien thoai', 'goi'],
    reply: (name) => `Chào ${name}! Thông tin liên hệ các phòng khám:\n\n📞 Phòng khám Đa khoa Hà Nội: 024-3825-1234\n💬 Zalo: 0241234567\n\n📞 Bệnh viện Thu Cúc: 024-3538-5555\n💬 Zalo: 0243538555\n\n📞 Phòng khám Việt Pháp: 024-3577-1100\n💬 Zalo: 0243577110\n\n📞 Phòng khám Medlatec: 1900-3366\n💬 Zalo: 0219003366\n\nBạn có thể bấm nút Zalo tư vấn trực tiếp trên trang chủ!`
  },
  {
    keywords: ['bao hiem', 'bhyt'],
    reply: (name) => `Chào ${name}! Các cơ sở hỗ trợ bảo hiểm y tế:\n\n✅ Phòng khám Đa khoa Hà Nội — Có hỗ trợ BHYT\n✅ Bệnh viện Thu Cúc — Có hỗ trợ BHYT\n\nVui lòng mang theo thẻ BHYT khi đến khám. Nếu cần xác nhận, hãy gọi trực tiếp cho phòng khám trước nhé!`
  },
]

export async function POST(req: NextRequest) {
  const { messages, userName } = await req.json()
  const lastMsg = boDau(messages[messages.length - 1]?.content || '')
  const name = userName || 'bạn'

  for (const item of cauTraLoi) {
    if (item.keywords.some(k => lastMsg.includes(k))) {
      return NextResponse.json({ reply: item.reply(name) })
    }
  }

  return NextResponse.json({
    reply: `Chào ${name}! Tôi chưa hiểu rõ vấn đề của bạn. Bạn có thể mô tả chi tiết hơn không?\n\nTôi có thể giúp về:\n• 🔍 Tìm chuyên khoa phù hợp\n• 📅 Hướng dẫn đặt lịch\n• 💰 Thông tin chi phí\n• 📞 Liên hệ tư vấn Zalo\n• 🗺️ Chỉ đường đến phòng khám`
  })
}