'use client'

import { useMemo } from 'react'
import type { FormData } from '@/lib/types'
import { calculateParity } from '@/lib/calculations'

interface LifestyleStepProps {
  formData: FormData
  updateField: (field: keyof FormData, value: string) => void
  exchangeRate: number
}

export function LifestyleStep({
  formData,
  updateField,
  exchangeRate,
}: LifestyleStepProps) {
  const parity = useMemo(() => {
    if (!formData.thaiSalary) return null
    return calculateParity(Number(formData.thaiSalary), exchangeRate)
  }, [formData.thaiSalary, exchangeRate])

  const fmt = (n: number) => `$${n.toLocaleString()}`
  const fmtTHB = (n: number) => `฿${n.toLocaleString()}`

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="info-box info">
        <p className="text-sm">
          💡 <strong>Purchasing Power Parity</strong> — เปรียบเทียบ &quot;กำลังซื้อ&quot;
          ระหว่างไทยกับออสเตรเลีย ไม่ใช่แค่แปลงค่าเงิน
        </p>
      </div>

      {/* Thai Salary Input */}
      <div>
        <label className="form-label" htmlFor="thaiSalary">
          💰 เงินเดือนปัจจุบันในไทย (บาท/เดือน)
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
            ฿
          </span>
          <input
            id="thaiSalary"
            type="number"
            className="form-input pl-8"
            placeholder="เช่น 50000"
            value={formData.thaiSalary}
            onChange={(e) => updateField('thaiSalary', e.target.value)}
            min="0"
            step="1000"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          💱 อัตราแลกเปลี่ยน: 1 AUD = {exchangeRate.toFixed(2)} THB (real-time)
        </p>
      </div>

      {/* Parity Results */}
      {parity && (
        <div className="space-y-6 animate-fade-in">
          {/* Your Current Income */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-3">
              📊 รายได้ปัจจุบันของคุณ
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="text-xs text-gray-500">เงินเดือน (บาท)</div>
                <div className="text-xl font-bold text-purple-600">
                  {fmtTHB(Number(formData.thaiSalary))}
                </div>
                <div className="text-xs text-gray-400">/เดือน</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="text-xs text-gray-500">รายได้ต่อปี (THB)</div>
                <div className="text-xl font-bold text-purple-600">
                  {fmtTHB(parity.thaiSalaryAnnual)}
                </div>
                <div className="text-xs text-gray-400">/ปี</div>
              </div>
            </div>
          </div>

          {/* Required Salary in AU */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-3">
              🎯 เงินเดือนที่ต้องได้ในออสเตรเลีย
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              เพื่อมีคุณภาพชีวิตเทียบเท่ากับที่ได้รับในไทย (ปรับตาม PPP)
            </p>
            <div className="text-center bg-white rounded-xl p-6 shadow-sm border-2 border-blue-200">
              <div className="text-xs text-gray-500 mb-1">
                💰 เงินเดือนขั้นต่ำที่ต้องได้ (AUD/ปี)
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {fmt(parity.requiredAusAnnual)}
              </div>
              <div className="text-sm text-gray-400">
                ≈ {fmt(Math.round(parity.requiredAusAnnual / 12))}/เดือน
              </div>
            </div>
          </div>

          {/* Salary Zones */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-3">
              🚦 โซนเงินเดือน (AUD/ปี)
            </h3>
            <div className="space-y-3">
              {[
                {
                  label: '🔴 ตึง (Tight)',
                  value: parity.zones.tight,
                  desc: 'ค่าครองชีพแพงกว่า ชีวิตลำบาก',
                  color: 'border-red-200 bg-red-50',
                  textColor: 'text-red-600',
                },
                {
                  label: '🟡 พอไปได้ (Okay)',
                  value: parity.zones.okay,
                  desc: 'ชีวิตเทียบเท่าที่ไทย',
                  color: 'border-yellow-200 bg-yellow-50',
                  textColor: 'text-yellow-600',
                },
                {
                  label: '🟢 สบาย (Comfortable)',
                  value: parity.zones.comfortable,
                  desc: 'ดีกว่าในไทย มีเงินเก็บ',
                  color: 'border-green-200 bg-green-50',
                  textColor: 'text-green-600',
                },
                {
                  label: '🌟 เหลือเฟือ (Spacious)',
                  value: parity.zones.spacious,
                  desc: 'ชีวิตดีมาก เหลือเก็บเยอะ',
                  color: 'border-emerald-300 bg-emerald-50',
                  textColor: 'text-emerald-600',
                },
              ].map((zone) => (
                <div
                  key={zone.label}
                  className={`rounded-xl p-4 border-2 ${zone.color} flex justify-between items-center`}
                >
                  <div>
                    <div className="font-semibold text-gray-800">{zone.label}</div>
                    <div className="text-xs text-gray-500">{zone.desc}</div>
                  </div>
                  <div className={`text-xl font-bold ${zone.textColor}`}>
                    {fmt(zone.value)}+
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
