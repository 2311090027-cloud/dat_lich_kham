
import { createServerClient } from '@/lib/supabase/server';
import { sendReminderEmail } from '@/lib/send-reminder-email';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createServerClient();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, profiles(full_name, email), doctors(full_name), clinics(name)')
    .eq('appointment_date', tomorrowStr)
    .eq('status', 'confirmed');

  if (!appointments || appointments.length === 0) {
    return NextResponse.json({ message: 'No appointments tomorrow' });
  }

  for (const apt of appointments) {
    await sendReminderEmail(
      apt.profiles.email,
      apt.profiles.full_name,
      apt.doctors.full_name,
      apt.clinics.name,
      apt.appointment_date,
      apt.appointment_time
    );
  }

  return NextResponse.json({ message: `Sent ${appointments.length} reminders` });
}