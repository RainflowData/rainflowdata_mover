'use client'

import { useMemo } from 'react'
import type { FormData, CityKey, FamilyStatus } from '@/lib/types'
import { calculateBudget } from '@/lib/calculations'

interface BudgetStepProps {
  formData: FormData
  updateField: (field: keyof FormData, value: string) => void
}

export function BudgetStep({ formData, updateField }: BudgetStepProps) {
  const budget = useMemo(() => {
    if (!formData.city || !formData.familyStatus) return null
    return calculateBudget(
      formData.city as CityKey,
      formData.familyStatus as FamilyStatus
    )
  }, [formData.city, formData.familyStatus])

  const fmt = (n: number) => `$${n.toLocaleString()}`
  const fmtTHB = (n: number, rate: number) =>
    `฿${Math.round(n * rate).toLocaleString()}`

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="info-box info">
        <p className="text-sm">
          💡 ค่าใช้จ่ายคำนวณจากข้อมูล <strong>Numbeo Feb 2026</strong> สำหรับแต่ละเมือง
          รวมค่าเช่า อาหาร ขนส่ง สาธารณูปโภค
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* City */}
        <div>
          <label className="form-label" htmlFor="city">
            🏙️ เมืองที่ต้องการอยู่
          </label>
          <select
            id="city"
            className="form-select"
            value={formData.city}
            onChange={(e) => updateField('city', e.target.value)}
          >
            <option value="">— เลือกเมือง —</option>
            <option value="sydney">Sydney 🏖️ (แพงสุด แต่โอกาสงานมากสุด)</option>
            <option value="melbourne">Melbourne ☕ (สมดุลงาน-ค่าครองชีพ)</option>
            <option value="brisbane">Brisbane 🌞 (ถูกกว่า กำลังโต)</option>
          </select>
        </div>

        {/* Family Status */}
        <div>
          <label className="form-label" htmlFor="family">
            👨‍👩‍👧 สถานะครอบครัว
          </label>
          <select
            id="family"
            className="form-select"
            value={formData.familyStatus}
            onChange={(e) => updateField('familyStatus', e.target.value)}
          >
            <option value="">— เลือกสถานะ —</option>
            <option value="single">คนเดียว 🧑</option>
            <option value="couple">คู่ ไม่มีลูก 👫</option>
            <option value="family">ครอบครัว มีลูก 👨‍👩‍👧</option>
          </select>
        </div>
      </div>

      {/* Budget Results */}
      {budget && (
        <div className="animate-fade-in space-y-6">
          {/* Monthly Costs */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4">
              📊 ค่าใช้จ่ายรายเดือน (AUD)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl">🏠</div>
                <div className="text-xs text-gray-500">ค่าเช่า</div>
                <div className="text-xl font-bold text-blue-600">
                  {fmt(budget.monthlyRent)}
                </div>
                <div className="text-xs text-gray-400">/เดือน</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl">🛒</div>
                <div className="text-xs text-gray-500">ค่าครองชีพ</div>
                <div className="text-xl font-bold text-green-600">
                  {fmt(budget.monthlyLiving)}
                </div>
                <div className="text-xs text-gray-400">/เดือน</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border-2 border-indigo-200">
                <div className="text-2xl">💰</div>
                <div className="text-xs text-gray-500">รวมทั้งหมด</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {fmt(budget.monthlyTotal)}
                </div>
                <div className="text-xs text-gray-400">/เดือน</div>
              </div>
            </div>
          </div>

          {/* Initial Costs */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4">
              💼 ค่าใช้จ่ายเริ่มต้น (ก่อนเดินทาง)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: '✈️ ตั๋วเครื่องบิน', value: budget.initialCosts.flight },
                { label: '📋 ค่าวีซ่า', value: budget.initialCosts.visa },
                { label: '🏠 ค่ามัดจำ', value: budget.initialCosts.bond },
                { label: '🛋️ เฟอร์นิเจอร์', value: budget.initialCosts.furniture },
                { label: '📄 เอกสาร', value: budget.initialCosts.documents },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <div className="text-xs text-gray-500">{item.label}</div>
                  <div className="text-lg font-bold text-amber-600">{fmt(item.value)}</div>
                </div>
              ))}
              <div className="bg-white rounded-xl p-3 text-center shadow-sm border-2 border-amber-300">
                <div className="text-xs text-gray-500">💰 รวมเริ่มต้น</div>
                <div className="text-xl font-bold text-amber-700">{fmt(budget.totalInitial)}</div>
              </div>
            </div>
          </div>

          {/* Savings Required */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4">
              🎯 เงินเก็บที่ควรมี
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-5 text-center shadow-sm border border-yellow-200">
                <div className="text-xs text-gray-500 mb-1">💡 ขั้นต่ำ (Tight)</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {fmt(budget.minimum)}
                </div>
                <div className="text-xs text-gray-400">
                  เริ่มต้น + 2 เดือนแรก
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 text-center shadow-sm border-2 border-green-300">
                <div className="text-xs text-gray-500 mb-1">
                  ✅ แนะนำ (Comfortable)
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {fmt(budget.comfortable)}
                </div>
                <div className="text-xs text-gray-400">
                  เริ่มต้น + 4 เดือน + สำรอง
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
