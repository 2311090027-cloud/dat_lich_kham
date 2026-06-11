import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

// Đọc env thủ công
const envFile = fs.readFileSync('.env.local', 'utf-8')
const env = {}
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=')
  if (key && val) env[key.trim()] = val.join('=').trim()
})

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

function docCSV(tenFile) {
  const filePath = path.join('data', tenFile)
  const content = fs.readFileSync(filePath, 'utf-8')
  return parse(content, { columns: true, skip_empty_lines: true, relax_quotes: true, relax_column_count: true })
}

async function importAll() {
  console.log('Bắt đầu import...\n')

  // 1. Specialties
  const specialties = docCSV('specialties.csv')
  for (let i = 0; i < specialties.length; i++) {
    const row = specialties[i]
    const { error } = await supabase.from('specialties').upsert({
      id: `S00${i+1}`,
      name: row.specialty,
      keywords: row.keywords,
      description: row.description
    })
    if (error) console.log(` Specialty lỗi: ${error.message}`)
    else console.log(` Specialty: ${row.specialty}`)
  }

  // 2. Clinics
  const clinics = docCSV('clinics.csv')
  for (const row of clinics) {
    const { error } = await supabase.from('clinics').upsert({
      id: row.clinic_id,
      name: row.name,
      address: row.address,
      district: row.district,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
      phone: row.phone,
      rating: parseFloat(row.rating),
      base_fee: parseInt(row.base_fee)
    })
    if (error) console.log(` Clinic lỗi: ${error.message}`)
    else console.log(` Clinic: ${row.name}`)
  }

  // 3. Patients
  const patients = docCSV('patients.csv')
  for (const row of patients) {
    const { error } = await supabase.from('patients').upsert({
      id: row.patient_id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      district: row.district,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
      dob: row.dob,
      gender: row.gender
    })
    if (error) console.log(` Patient lỗi: ${error.message}`)
    else console.log(` Patient: ${row.name}`)
  }

  // 4. Doctors
  const doctors = docCSV('doctors.csv')
  for (const row of doctors) {
    const { error } = await supabase.from('doctors').upsert({
      id: row.doctor_id,
      name: row.name,
      specialty: row.specialty,
      clinic_id: row.clinic_id,
      experience_years: parseInt(row.experience_years),
      rating: parseFloat(row.rating),
      available_days: row.available_days,
      start_time: row.start_time,
      end_time: row.end_time,
      fee: parseInt(row.fee)
    })
    if (error) console.log(` Doctor lỗi: ${error.message}`)
    else console.log(` Doctor: ${row.name}`)
  }

  // 5. Appointments
  const appointments = docCSV('appointments.csv')
  for (const row of appointments) {
    const { error } = await supabase.from('appointments').upsert({
      id: row.appointment_id,
      patient_id: row.patient_id,
      doctor_id: row.doctor_id,
      clinic_id: row.clinic_id,
      appointment_date: row.date,
      appointment_time: row.time,
      status: row.status,
      symptoms: row.symptoms,
      notes: row.notes
    })
    if (error) console.log(` Appointment lỗi: ${error.message}`)
    else console.log(`✅ Appointment: ${row.appointment_id}`)
  }

  console.log('\n Import xong tất cả!')
}

importAll()