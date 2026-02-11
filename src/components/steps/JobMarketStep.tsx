'use client'

import type { FormData } from '@/lib/types'
import { JobSearch } from '@/components/JobSearch'

interface JobMarketStepProps {
  formData: FormData
  updateField: (field: keyof FormData, value: string) => void
}

export function JobMarketStep({ formData, updateField }: JobMarketStepProps) {
  const handleSelect = (key: string, specialization: string) => {
    updateField('occupation', key)
    updateField('specialization', specialization)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="info-box info">
        <p className="text-sm">
          💡 ค้นหาอาชีพของคุณ เพื่อดูข้อมูลเงินเดือน ดีมานด์ และเส้นทาง PR
          ข้อมูลจาก <strong>Home Affairs, SEEK, PayScale Feb 2026</strong>
        </p>
      </div>

      <JobSearch
        value={formData.occupation}
        specialization={formData.specialization}
        onSelect={handleSelect}
      />

      {/* Tips */}
      {!formData.occupation && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mt-4">
          <h4 className="font-bold text-indigo-800 mb-2">💡 เคล็ดลับหางานในออสเตรเลีย</h4>
          <ul className="text-sm text-indigo-700 space-y-1 list-disc list-inside">
            <li>
              <strong>SEEK.com.au</strong> — เว็บหางานอันดับ 1 ของออสเตรเลีย
            </li>
            <li>
              <strong>LinkedIn</strong> — สำคัญมากสำหรับ professional jobs
            </li>
            <li>
              <strong>Indeed AU</strong> — ตัวเลือกเสริม มีหลาย sector
            </li>
            <li>
              อาชีพใน <strong>PMSOL</strong> (Priority List) จะได้รับเชิญง่ายที่สุด
            </li>
            <li>
              อาชีพ <strong>Trades</strong> (ช่าง) มักใช้คะแนนต่ำกว่า ICT
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
