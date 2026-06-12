import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendReminderEmail(
  toEmail: string,
  patientName: string,
  doctorName: string,
  clinicName: string,
  appointmentDate: string,
  appointmentTime: string
) {
  await transporter.sendMail({
    from: `ĐặtLịchKhám <${process.env.GMAIL_USER}>`,
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
        <p>Vui lòng đến đúng giờ. Chúc bạn có thật nhiều sức khỏe! 💙</p>
      </div>
    `,
  });
}