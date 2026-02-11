'use client'

import Image from 'next/image'

export function Header() {
  return (
    <header className="mb-4 animate-fade-in">
      <div
        className="rounded-2xl p-4 flex items-center gap-4"
        style={{
          background: 'linear-gradient(135deg, #8BB8E8 0%, #6FA8DD 50%, #5599CC 100%)',
          boxShadow: '0 8px 30px rgba(85, 153, 204, 0.3)',
          border: '2px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        <div
          className="rounded-full flex-shrink-0 overflow-hidden animate-logo-float"
          style={{ width: '56px', height: '56px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}
        >
          <Image
            src="/rainflow.png"
            alt="Rainflow Logo"
            width={56}
            height={56}
            style={{ objectFit: 'cover' }}
            unoptimized
          />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-white" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>
            🌏 Life After Migration
          </h1>
          <p className="text-sm text-white/90 truncate">
            จำลองชีวิตหลังย้ายประเทศ แบบบอกความจริง ไม่ขายฝัน
          </p>
        </div>
      </div>
    </header>
  )
}
