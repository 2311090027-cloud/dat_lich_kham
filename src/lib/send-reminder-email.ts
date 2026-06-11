import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReminderEmail(
  toEmail: string,
  patientName: string,
  doctorName: string,
  clinicName: string,
  appointmentDate: string,
  appointmentTime: string
) {
  await resend.emails.send({
    from: 'ĐặtLịchKhám <onboarding@resend.dev>',
    to: toEmail,
    subject: '🏥 Nhắc lịch khám ngày mai',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
        <h2 style="color: #1a5fb4;">Nhắc lịch khám sức khỏe</h2>
        <p>Xin chào <strong>${patientName}</strong>,</p>
        <p>Bạn có lịch khám vào <strong>ngày mai</strong>:</p>
        <div style="background: #f0f7ff; padding: 16px; border-radius: 8px;">
          <p>👨‍⚕️ Bác sĩ: <strong>${doctorName}</strong></p>
          <p>🏥 Phòng khám: <strong>${clinicName}</strong></p>
          <p>📅 Ngày: <strong>${appointmentDate}</strong></p>
          <p>⏰ Giờ: <strong>${appointmentTime}</strong></p>
        </div>
        <p>Vui lòng đến đúng giờ. Chúc bạn sức khỏe!</p>
      </div>
    `,
  });
}