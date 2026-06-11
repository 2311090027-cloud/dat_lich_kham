import Link from 'next/link'
import { MapPin, Clock, Phone, Star } from 'lucide-react'

export default function ClinicCard({ clinic }: { clinic: any }) {
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: '16px 20px',
      background: 'white'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>{clinic.name}</h3>
        {clinic.distance < 999 && (
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            {clinic.distance.toFixed(1)} km
          </span>
        )}
      </div>

      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={13} /> {clinic.address}, {clinic.district}
        </span>
        <span style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Star size={13} /> {clinic.rating} · Phí từ {clinic.base_fee?.toLocaleString()}đ
        </span>
        <span style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Phone size={13} /> {clinic.phone}
        </span>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {clinic.doctors?.slice(0, 3).map((d: any) => (
          <Link key={d.id} href={`/booking/${d.id}`}
            style={{
              fontSize: 12, padding: '4px 10px',
              border: '1px solid #dbeafe',
              background: '#eff6ff', color: '#1d4ed8',
              borderRadius: 6, textDecoration: 'none'
            }}>
            {d.name}
          </Link>
        ))}
      </div>
    </div>
  )
}