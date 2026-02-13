'use client'

import { useState } from 'react'
import type { FormData } from '@/lib/types'

interface ProfileStepProps {
  formData: FormData
  updateField: (field: keyof FormData, value: string | boolean | string[]) => void
}

export function ProfileStep({ formData, updateField }: ProfileStepProps) {
  const [showBonus, setShowBonus] = useState(false)
  
  const togglePriority = (priority: string) => {
    const current = formData.priorities || []
    if (current.includes(priority)) {
      updateField('priorities', current.filter(p => p !== priority))
    } else {
      updateField('priorities', [...current, priority])
    }
  }
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* ===== Section 1: Motivation ===== */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-100">
        <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span>💭</span> เล่าให้ฟังหน่อย...
        </h3>
        <p className="text-sm text-gray-600 mb-5">
          ก่อนจะช่วยวางแผน อยากรู้ว่าทำไมถึงคิดจะย้ายประเทศ และกำลังมองหาอะไรอยู่
        </p>
        
        {/* Motivation */}
        <div className="mb-5">
          <label className="form-label" htmlFor="motivation">
            💬 ทำไมถึงอยากย้ายประเทศ?
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
          <div className="animate-fade-in space-y-5">
            {/* Priorities */}
            <div>
              <label className="form-label">
                🎯 อะไรสำคัญที่สุดสำหรับคุณ? (เลือกได้หลายอัน)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {[
                  { id: 'high-salary', label: '💵 เงินเดือนสูง', desc: 'ได้เงินเยอะ เก็บได้เยอะ' },
                  { id: 'low-cost', label: '💸 ค่าครองชีพต่ำ', desc: 'จ่ายน้อย เหลือเยอะ' },
                  { id: 'work-life', label: '⚖️ Work-life balance', desc: 'ทำงาน 40 ชม./สัปดาห์' },
                  { id: 'career', label: '📈 โอกาสเติบโต', desc: 'งานท้าทาย พัฒนาตัวเอง' },
                  { id: 'weather', label: '☀️ อากาศดี', desc: 'อากาศเย็น ไม่ร้อนจัด' },
                  { id: 'safety', label: '🛡️ ปลอดภัย', desc: 'ระบบดี กฎหมายชัดเจน' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePriority(p.id)}
                    className={`text-left p-3 rounded-lg border-2 transition-all ${
                      formData.priorities?.includes(p.id)
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="font-semibold text-sm text-gray-800">{p.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Lifestyle Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label text-sm" htmlFor="cooking">
                  🍳 ทำกินเองบ่อยแค่ไหน?
                </label>
                <select
                  id="cooking"
                  className="form-select text-sm"
                  value={formData.cookingHabit}
                  onChange={(e) => updateField('cookingHabit', e.target.value)}
                >
                  <option value="always">ทำเองทุกมื้อ (ประหยัดสุด)</option>
                  <option value="often">ทำเองบ้าง ซื้อบ้าง</option>
                  <option value="sometimes">ซื้อบ่อย ทำนานๆที</option>
                  <option value="rarely">ซื้อเกือบทุกมื้อ</option>
                </select>
              </div>

              <div>
                <label className="form-label text-sm" htmlFor="transport">
                  🚗 วางแผนเดินทางยังไง?
                </label>
                <select
                  id="transport"
                  className="form-select text-sm"
                  value={formData.transportPreference}
                  onChange={(e) => updateField('transportPreference', e.target.value)}
                >
                  <option value="public">🚇 รถไฟ/รถเมล์ (ประหยัด)</option>
                  <option value="mixed">🚗🚇 ผสมกัน</option>
                  <option value="car">🚗 ขับรถเอง (สะดวก)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== Section 2: Basic Profile ===== */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 ข้อมูลพื้นฐาน</h3>
        <div className="info-box info mb-4">
          <p className="text-sm">
            💡 <strong>คะแนนวีซ่า 189/190</strong> คำนวณจากอายุ ภาษาอังกฤษ ประสบการณ์
            และระดับการศึกษา + คะแนนโบนัส (ถ้ามี)
          </p>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Age */}
          <div>
            <label className="form-label" htmlFor="age">
              📅 อายุ
            </label>
            <select
              id="age"
              className="form-select"
              value={formData.age}
              onChange={(e) => updateField('age', e.target.value)}
            >
              <option value="">— เลือกช่วงอายุ —</option>
              <option value="18-24">18-24 ปี (25 คะแนน)</option>
              <option value="25-32">25-32 ปี (30 คะแนน) ⭐ สูงสุด</option>
              <option value="33-39">33-39 ปี (25 คะแนน)</option>
              <option value="40-44">40-44 ปี (15 คะแนน)</option>
              <option value="45+">45+ ปี (0 คะแนน)</option>
            </select>
          </div>

          {/* English */}
          <div>
            <label className="form-label" htmlFor="english">
              🗣️ ระดับภาษาอังกฤษ
            </label>
            <select
              id="english"
              className="form-select"
              value={formData.englishLevel}
              onChange={(e) => updateField('englishLevel', e.target.value)}
            >
              <option value="">— เลือกระดับ IELTS —</option>
              <option value="functional">Functional (IELTS 4.5-5.0) — 0 คะแนน</option>
              <option value="competent">Competent (IELTS 6.0-6.9) — 0 คะแนน (ขั้นต่ำ 189)</option>
              <option value="proficient">Proficient (IELTS 7.0-7.9) — 10 คะแนน</option>
              <option value="superior">Superior (IELTS 8.0+) — 20 คะแนน ⭐</option>
            </select>
            <p className="text-[10px] text-gray-400 mt-1">
              💡 ใช้คะแนนอื่นแทนได้: PTE Academic / TOEFL iBT / CAE — <a href="https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/english-language" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">ดูตารางเทียบที่ Home Affairs</a>
            </p>
          </div>

          {/* Overseas Experience */}
          <div>
            <label className="form-label" htmlFor="experience">
              💼 ประสบการณ์ทำงาน (นอก Australia)
            </label>
            <select
              id="experience"
              className="form-select"
              value={formData.experience}
              onChange={(e) => updateField('experience', e.target.value)}
            >
              <option value="">— เลือกจำนวนปี —</option>
              <option value="0-2">0-2 ปี (0 คะแนน)</option>
              <option value="3-4">3-4 ปี (5 คะแนน)</option>
              <option value="5-7">5-7 ปี (10 คะแนน)</option>
              <option value="8+">8+ ปี (15 คะแนน) ⭐</option>
            </select>
          </div>

          {/* Australian Experience */}
          <div>
            <label className="form-label" htmlFor="australianExperience">
              🇦🇺 ประสบการณ์ทำงานใน Australia
            </label>
            <select
              id="australianExperience"
              className="form-select"
              value={formData.australianExperience}
              onChange={(e) => updateField('australianExperience', e.target.value)}
            >
              <option value="0">ไม่มี (0 คะแนน)</option>
              <option value="1">1-2 ปี (5 คะแนน)</option>
              <option value="3">3-4 ปี (10 คะแนน)</option>
              <option value="5">5-7 ปี (15 คะแนน)</option>
              <option value="8">8+ ปี (20 คะแนน) ⭐ สูงสุด</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              * คะแนนงานรวม (AU + นอก AU) สูงสุด 20 คะแนน
            </p>
          </div>

          {/* Education */}
          <div className="md:col-span-2">
            <label className="form-label" htmlFor="education">
              🎓 ระดับการศึกษา
            </label>
            <select
              id="education"
              className="form-select"
              value={formData.education}
              onChange={(e) => updateField('education', e.target.value)}
            >
              <option value="">— เลือกวุฒิการศึกษา —</option>
              <option value="trade">Trade/Diploma — 10 คะแนน</option>
              <option value="bachelor">ปริญญาตรี — 15 คะแนน</option>
              <option value="masters">ปริญญาโท — 15 คะแนน</option>
              <option value="phd">ปริญญาเอก (PhD) — 20 คะแนน ⭐</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===== Bonus Points (Collapsible) ===== */}
      <div className="border-t-2 border-dashed border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => setShowBonus(!showBonus)}
          className="flex items-center justify-between w-full text-left font-semibold text-gray-800 hover:text-blue-600 transition-colors"
        >
          <span>🎁 คะแนนโบนัสเพิ่มเติม (Partner, เรียนใน AU, ฯลฯ)</span>
          <span className="text-2xl">{showBonus ? '−' : '+'}</span>
        </button>
        
        {showBonus && (
          <div className="mt-6 space-y-6 animate-fade-in">
            <div className="info-box warning">
              <p className="text-sm">
                ⚠️ ส่วนนี้สำหรับคนที่มีคะแนนพิเศษ เช่น เคยเรียนใน AU, มีคู่สมรส, มี NAATI ฯลฯ
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Partner Status */}
              <div className="md:col-span-2">
                <label className="form-label" htmlFor="partnerStatus">
                  💑 สถานะคู่สมรส/แฟน
                </label>
                <select
                  id="partnerStatus"
                  className="form-select"
                  value={formData.partnerStatus}
                  onChange={(e) => updateField('partnerStatus', e.target.value)}
                >
                  <option value="none">ไม่มี หรือ ไม่ได้สมัครร่วม (0 คะแนน)</option>
                  <option value="au-citizen-pr">โสด หรือ คู่สมรสเป็นชาว AU/PR (10 คะแนน) ⭐</option>
                  <option value="has-skills">คู่สมรสมี skills assessment + English (10 คะแนน) ⭐</option>
                  <option value="has-english">คู่สมรส มี Competent English (5 คะแนน)</option>
                </select>
              </div>

              {/* Checkboxes */}
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.australianStudy}
                    onChange={(e) => updateField('australianStudy', e.target.checked)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    🏫 เรียนใน Australia 2 ปีขึ้นไป (+5 คะแนน)
                  </span>
                </label>
                <p className="text-[10px] text-gray-400 ml-7 mt-0.5">จบหลักสูตร CRICOS 2 ปี+ (92 สัปดาห์) ในออสเตรเลีย</p>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.stemQualification}
                    onChange={(e) => updateField('stemQualification', e.target.checked)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    🔬 Masters/PhD STEM จาก AU (+10 คะแนน)
                  </span>
                </label>
                <p className="text-[10px] text-gray-400 ml-7 mt-0.5">ป.โท/เอก สาย Science, Tech, Engineering, Math, ICT จากมหาลัย AU</p>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.professionalYear}
                    onChange={(e) => updateField('professionalYear', e.target.checked)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    💼 Professional Year (ICT/Accounting/Engineering) (+5 คะแนน)
                  </span>
                </label>
                <p className="text-[10px] text-gray-400 ml-7 mt-0.5">โปรแกรม 12 เดือน รวมฝึกงาน — เฉพาะสาย ICT, บัญชี, วิศวะ</p>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.naatiCertified}
                    onChange={(e) => updateField('naatiCertified', e.target.checked)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    🗣️ NAATI Community Language (+5 คะแนน)
                  </span>
                </label>
                <p className="text-[10px] text-gray-400 ml-7 mt-0.5">สอบล่าม/นักแปลผ่าน NAATI — ภาษาไทยสอบได้</p>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.regionalStudy}
                    onChange={(e) => updateField('regionalStudy', e.target.checked)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    🏞️ เรียนใน Regional Australia (+5 คะแนน)
                  </span>
                </label>
                <p className="text-[10px] text-gray-400 ml-7 mt-0.5">เรียนนอกเมืองใหญ่ เช่น Adelaide, Gold Coast, Geelong</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Completion indicator */}
      {formData.age && formData.education && formData.motivation && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
          <p className="text-sm text-green-700">
            ✅ เข้าใจแล้ว! กด <strong>&quot;ถัดไป&quot;</strong> เพื่อดูผลวิเคราะห์ความเป็นไปได้
          </p>
        </div>
      )}
    </div>
  )
}