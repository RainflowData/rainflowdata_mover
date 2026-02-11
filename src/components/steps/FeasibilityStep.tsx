'use client'

import { useMemo } from 'react'
import type { FormData } from '@/lib/types'
import { calculateFeasibility } from '@/lib/calculations'

interface FeasibilityStepProps {
  formData: FormData
}

export function FeasibilityStep({ formData }: FeasibilityStepProps) {
  const result = useMemo(
    () =>
      calculateFeasibility(
        formData.age,
        formData.englishLevel,
        formData.experience,
        formData.australianExperience,
        formData.education,
        formData.partnerStatus,
        formData.australianStudy,
        formData.stemQualification,
        formData.professionalYear,
        formData.naatiCertified,
        formData.regionalStudy
      ),
    [
      formData.age,
      formData.englishLevel,
      formData.experience,
      formData.australianExperience,
      formData.education,
      formData.partnerStatus,
      formData.australianStudy,
      formData.stemQualification,
      formData.professionalYear,
      formData.naatiCertified,
      formData.regionalStudy,
    ]
  )

  // If fields are not filled
  if (!formData.age || !formData.englishLevel || !formData.experience || !formData.education) {
    return (
      <div className="info-box warning animate-fade-in">
        <p className="font-semibold">⚠️ กรุณากรอกข้อมูลในขั้นที่ 1 ให้ครบก่อน</p>
        <p className="text-sm mt-1">ต้องระบุ อายุ, ภาษาอังกฤษ, ประสบการณ์ และการศึกษา เพื่อคำนวณคะแนน</p>
      </div>
    )
  }

  const scoreColor =
    result.score >= 85
      ? 'text-green-600'
      : result.score >= 75
      ? 'text-blue-600'
      : result.score >= 65
      ? 'text-yellow-600'
      : 'text-red-600'

  const scoreEmoji =
    result.score >= 85 ? '🟢' : result.score >= 75 ? '🔵' : result.score >= 65 ? '🟡' : '🔴'

  const getDifficultyBadge = (d: string) => {
    switch (d) {
      case 'easy':
        return <span className="badge-easy">✅ ง่าย</span>
      case 'medium':
        return <span className="badge-medium">⚡ ปานกลาง</span>
      case 'hard':
        return <span className="badge-hard">🔶 ยาก</span>
      case 'very-hard':
        return <span className="badge-very-hard">🔴 ยากมาก</span>
      default:
        return null
    }
  }

  const breakdown = result.pointsBreakdown

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Score Display */}
      <div className="text-center bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-2xl p-8">
        <div className="text-5xl font-bold mb-2">
          <span className={scoreColor}>{result.score}</span>
          <span className="text-gray-300 text-3xl"> / 130</span>
        </div>
        <p className="text-lg font-semibold text-gray-600">คะแนน Skilled Migration</p>
        <p className="text-2xl mt-2">{scoreEmoji}</p>
      </div>

      {/* Score Breakdown - แสดงทุก category */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">📊 รายละเอียดคะแนน</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: 'อายุ', emoji: '📅', pts: breakdown.age },
            { label: 'ภาษาอังกฤษ', emoji: '🗣️', pts: breakdown.english },
            { label: 'ประสบการณ์ นอก AU', emoji: '💼', pts: breakdown.overseasExperience },
            { label: 'ประสบการณ์ ใน AU', emoji: '🇦🇺', pts: breakdown.australianExperience },
            { label: 'การศึกษา', emoji: '🎓', pts: breakdown.education },
            { label: 'คู่สมรส/Partner', emoji: '💑', pts: breakdown.partner },
            { label: 'เรียนใน AU', emoji: '🏫', pts: breakdown.australianStudy },
            { label: 'STEM Qualification', emoji: '🔬', pts: breakdown.stemQualification },
            { label: 'Professional Year', emoji: '💼', pts: breakdown.professionalYear },
            { label: 'NAATI', emoji: '🗣️', pts: breakdown.naati },
            { label: 'Regional Study', emoji: '🏞️', pts: breakdown.regionalStudy },
          ].map((item) => (
            <div
              key={item.label}
              className={`bg-white rounded-xl p-3 text-center shadow-sm border ${
                item.pts > 0 ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'
              }`}
            >
              <div className="text-lg">{item.emoji}</div>
              <div className="text-xs text-gray-500 leading-tight">{item.label}</div>
              <div className={`text-lg font-bold ${item.pts > 0 ? 'text-blue-600' : 'text-gray-300'}`}>
                {item.pts} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="info-box warning">
          <p className="font-semibold mb-2">⚠️ ข้อควรระวัง:</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Visa Options */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          🎫 ตัวเลือกวีซ่าที่เป็นไปได้
        </h3>
        <div className="space-y-3">
          {result.visaOptions.map((visa, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs text-gray-400">{visa.type}</span>
                  <h4 className="font-bold text-gray-800">{visa.name}</h4>
                </div>
                {getDifficultyBadge(visa.difficulty)}
              </div>
              <p className="text-sm text-gray-600 mb-2">{visa.description}</p>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                <span>🏠 PR: {visa.pathToPR}</span>
                <span>⏱️ {visa.timeline}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overall Assessment */}
      <div
        className={`info-box ${
          result.feasible ? 'success' : 'danger'
        }`}
      >
        <p className="font-bold text-lg mb-1">
          {result.feasible
            ? '✅ มีโอกาสย้ายได้! คะแนนถึงเกณฑ์ขั้นต่ำ'
            : '❌ คะแนนอาจไม่ถึง — แต่มีตัวเลือกอื่น'}
        </p>
        <p className="text-sm">
          {result.feasible
            ? 'คุณมีคะแนนเพียงพอที่จะยื่นวีซ่า Skilled Migration ลองดูงบประมาณและตลาดงานในขั้นถัดไป'
            : 'ลองเพิ่มคะแนน IELTS, สะสมประสบการณ์เพิ่ม หรือพิจารณาวีซ่า Employer Sponsored (482) ที่ไม่ต้องใช้คะแนน'}
        </p>
      </div>
    </div>
  )
}
