'use client'

import type { FormData } from '@/lib/types'

interface MotivationStepProps {
  formData: FormData
  updateField: (field: keyof FormData, value: string | string[]) => void
}

export function MotivationStep({ formData, updateField }: MotivationStepProps) {
  const togglePriority = (priority: string) => {
    const current = formData.priorities || []
    if (current.includes(priority)) {
      updateField('priorities', current.filter(p => p !== priority))
    } else {
      updateField('priorities', [...current, priority])
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-xl font-bold text-gray-800 mb-2">💭 เล่าให้ฟังหน่อย...</h3>
        <p className="text-sm text-gray-600">
          ก่อนจะช่วยวางแผน อยากรู้ว่าทำไมถึงคิดจะย้ายประเทศ และกำลังมองหาอะไรอยู่
        </p>
      </div>

      {/* Motivation */}
      <div>
        <label className="form-label" htmlFor="motivation">
          💬 ทำไมถึงอยากย้ายประเทศ? (แบบไหนที่ใกล้เ

คียงที่สุด)
        </label>
        <select
          id="motivation"
          className="form-select"
          value={formData.motivation}
          onChange={(e) => updateField('motivation', e.target.value)}
        >
          <option value="">— เลือก —</option>
          <option value="career">💼 อยากพัฒนาอาชีพ หาโอกาสใหม่</option>
          <option value="salary">💰 อยากได้เงินเดือนสูงกว่า เก็บเงินได้เยอะกว่า</option>
          <option value="lifestyle">🌟 อยากได้คุณภาพชีวิตที่ดีกว่า work-life balance</option>
          <option value="political">🏛️ เบื่อการเมือง ไม่เห็นอนาคตในประเทศ</option>
          <option value="environment">🌳 อยากอยู่ที่อากาศดี สิ่งแวดล้อมดี</option>
          <option value="education">🎓 อยากให้ลูกได้เรียนที่ดีกว่า</option>
          <option value="adventure">✈️ อยากลองใช้ชีวิตแบบใหม่ ผจญภัย</option>
          <option value="stability">🛡️ อยากได้ความมั่นคง ระบบที่ดีกว่า</option>
        </select>
      </div>

      {formData.motivation && (
        <>
          {/* Priorities */}
          <div className="animate-fade-in">
            <label className="form-label">
              🎯 อะไรสำคัญที่สุดสำหรับคุณ? (เลือกได้หลายอัน)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {[
                { id: 'high-salary', label: '💵 เงินเดือนสูง', desc: 'ได้เงินเยอะ เก็บได้เยอะ' },
                { id: 'low-cost', label: '💸 ค่าครองชีพต่ำ', desc: 'จ่ายน้อย เหลือเยอะ' },
                { id: 'work-life', label: '⚖️ Work-life balance', desc: 'ทำงาน 40 ชม./สัปดาห์ มีเวลาส่วนตัว' },
                { id: 'career', label: '📈 โอกาสเติบโต', desc: 'งานท้าทาย พัฒนาตัวเอง' },
                { id: 'weather', label: '☀️ อากาศดี', desc: 'อากาศเย็น ไม่ร้อนจัด' },
                { id: 'safety', label: '🛡️ ปลอดภัย', desc: 'ระบบดี กฎหมายชัดเจน' },
                { id: 'diversity', label: '🌏 ความหลากหลาย', desc: 'คนหลายเชื้อชาติ เปิดกว้าง' },
                { id: 'thai-community', label: '🇹🇭 มีคนไทย', desc: 'มี community ไทยเยอะ' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePriority(p.id)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    formData.priorities?.includes(p.id)
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-800">{p.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Lifestyle Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Cooking Habit */}
            <div>
              <label className="form-label" htmlFor="cooking">
                🍳 ทำกินเองบ่อยแค่ไหน?
              </label>
              <select
                id="cooking"
                className="form-select"
                value={formData.cookingHabit}
                onChange={(e) => updateField('cookingHabit', e.target.value)}
              >
                <option value="always">ทำเองทุกมื้อ (ประหยัดสุด)</option>
                <option value="often">ทำเองบ้าง ซื้อกินบ้าง</option>
                <option value="sometimes">ซื้อกินบ่อย ทำเองนานๆ ที</option>
                <option value="rarely">ซื้อกินเกือบทุกมื้อ (สะดวกสบาย)</option>
              </select>
            </div>

            {/* Transport */}
            <div>
              <label className="form-label" htmlFor="transport">
                🚗 วางแผนเดินทางยังไง?
              </label>
              <select
                id="transport"
                className="form-select"
                value={formData.transportPreference}
                onChange={(e) => updateField('transportPreference', e.target.value)}
              >
                <option value="public">🚇 รถไฟ/รถเมล์ (ประหยัดสุด)</option>
                <option value="mixed">🚗🚇 ผสม: ขับรถ + รถไฟ</option>
                <option value="car">🚗 ขับรถเอง (สะดวกสบาย)</option>
              </select>
            </div>

            {/* Savings */}
            <div className="md:col-span-2">
              <label className="form-label" htmlFor="savings">
                💰 มีเงินสำรองเท่าไหร่? (USD หรือ บาท ÷ 35)
              </label>
              <input
                type="number"
                id="savings"
                className="form-input"
                placeholder="เช่น 10000 (USD)"
                value={formData.savingsUSD}
                onChange={(e) => updateField('savingsUSD', e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                * ใช้คำนวณว่าพอกับค่าใช้จ่ายช่วงแรกหรือเปล่า (ค่าวีซ่า, เครื่องบิน, มัดจำ, เฟอร์นิเจอร์)
              </p>
            </div>
          </div>
        </>
      )}

      {formData.motivation && formData.priorities.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
          <p className="text-sm text-green-700">
            ✅ เข้าใจแล้ว! ตอนนี้ให้กรอกข้อมูลพื้นฐาน (อายุ, ประสบการณ์, การศึกษา) ในขั้นถัดไปเลย
          </p>
        </div>
      )}
    </div>
  )
}
