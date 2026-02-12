'use client'

import { usePathname } from 'next/navigation'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export function Header() {
  const pathname = usePathname()
  const isTools = pathname?.includes('/tools')

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${basePath}/rainflow.png`}
            alt="Rainflow Logo"
            width={56}
            height={56}
            style={{ objectFit: 'cover', width: '56px', height: '56px' }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-2xl font-bold text-white" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>
            🌏 Life After Migration
          </h1>
          <p className="text-sm text-white/90 truncate">
            จำลองชีวิตหลังย้ายประเทศ แบบบอกความจริง ไม่ขายฝัน
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mt-3">
        <a
          href={`${basePath}/`}
          className={`flex-1 text-center py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
            !isTools
              ? 'bg-white text-blue-700 shadow-md border-2 border-blue-200'
              : 'bg-white/50 text-gray-500 hover:bg-white/70 hover:text-blue-600 border-2 border-transparent'
          }`}
        >
          💬 Smart Country Matcher
        </a>
        <a
          href={`${basePath}/tools`}
          className={`flex-1 text-center py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
            isTools
              ? 'bg-white text-blue-700 shadow-md border-2 border-blue-200'
              : 'bg-white/50 text-gray-500 hover:bg-white/70 hover:text-blue-600 border-2 border-transparent'
          }`}
        >
          🇦🇺 คำนวณวีซ่า & งบ
        </a>
      </div>
    </header>
  )
}
