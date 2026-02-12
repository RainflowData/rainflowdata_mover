'use client'

export function Footer() {
  return (
    <footer className="text-center mt-8 mb-4 animate-fade-in">
      <div className="rounded-2xl p-6" style={{ background: 'white', border: '3px solid #D4E8FF', boxShadow: '0 8px 30px rgba(107, 143, 216, 0.12)' }}>
        <p className="text-sm text-gray-500 mb-3">
          📊 แหล่งข้อมูล:&nbsp;
          <a href="https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Home Affairs</a>&nbsp;|&nbsp;
          <a href="https://www.ato.gov.au/tax-rates-and-codes/tax-rates-resident" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">ATO FY25-26</a>&nbsp;|&nbsp;
          <a href="https://www.numbeo.com/cost-of-living/country_result.jsp?country=Australia" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Numbeo</a>&nbsp;|&nbsp;
          <a href="https://www.fairwork.gov.au/pay-and-wages/minimum-wages" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Fair Work</a>&nbsp;|&nbsp;
          <a href="https://www.seek.com.au/career-advice/role" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">SEEK</a>&nbsp;|&nbsp;
          <a href="https://www.xe.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">XE Rate</a>
        </p>
        <p className="text-xs text-gray-400 mb-3">
          ⚠️ ข้อมูลนี้เป็นการประมาณการเท่านั้น ไม่ใช่คำแนะนำอย่างเป็นทางการ
          ผลลัพธ์จริงอาจแตกต่าง กรุณาตรวจสอบข้อมูลล่าสุดจากเว็บไซต์ทางการก่อนตัดสินใจ
          อัตราแลกเปลี่ยนผันผวนได้ ควรเช็คจาก XE.com ก่อนใช้จริง
          ปรึกษา Migration Agent ที่ได้รับอนุญาตก่อนยื่นวีซ่าจริง
        </p>
        <p className="text-xs text-gray-400">
          Built with ❤️ using Next.js + Tailwind CSS + TypeScript | Last updated: Feb 2026
        </p>
      </div>
    </footer>
  )
}
