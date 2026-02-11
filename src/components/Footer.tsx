'use client'

export function Footer() {
  return (
    <footer className="text-center mt-8 mb-4 animate-fade-in">
      <div className="rounded-2xl p-6" style={{ background: 'white', border: '3px solid #D4E8FF', boxShadow: '0 8px 30px rgba(107, 143, 216, 0.12)' }}>
        <p className="text-sm text-gray-500 mb-3">
          📊 ข้อมูลจาก Home Affairs SkillSelect Nov 2025 | PayScale AU Feb 2026 | Numbeo Feb 2026 |
          SEEK AU | Exchange Rate API
        </p>
        <p className="text-xs text-gray-400 mb-3">
          ⚠️ ข้อมูลนี้เป็นการประมาณการเท่านั้น ผลลัพธ์จริงอาจแตกต่าง
          กรุณาตรวจสอบข้อมูลล่าสุดจากเว็บไซต์ทางการก่อนตัดสินใจ
        </p>
        <p className="text-xs text-gray-400">
          Built with ❤️ using Next.js + Tailwind CSS + TypeScript | Last updated: Feb 2026
        </p>
      </div>
    </footer>
  )
}
