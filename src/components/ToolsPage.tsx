'use client'

import { useState, useEffect, useCallback } from 'react'
import { ProfileStep } from './steps/ProfileStep'
import { FeasibilityStep } from './steps/FeasibilityStep'
import { BudgetStep } from './steps/BudgetStep'
import { LifestyleStep } from './steps/LifestyleStep'
import { JobMarketStep } from './steps/JobMarketStep'
import { SummaryStep } from './steps/SummaryStep'
import { useExchangeRate } from '@/hooks/useExchangeRate'
import type { FormData } from '@/lib/types'
import { INITIAL_FORM_DATA, STEP_LABELS } from '@/lib/types'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export function ToolsPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [mounted, setMounted] = useState(false)
  const { rate, lastUpdate } = useExchangeRate()

  useEffect(() => {
    try {
      const saved = localStorage.getItem('migrationPlannerData')
      if (saved) {
        const parsed = JSON.parse(saved)
        setFormData((prev) => ({ ...prev, ...parsed }))
      }
    } catch {
      // ignore
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('migrationPlannerData', JSON.stringify(formData))
    }
  }, [formData, mounted])

  const updateField = useCallback(
    (field: keyof FormData, value: string | boolean | string[]) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const nextStep = () => setStep((s) => Math.min(s + 1, 6))
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))
  const goToStep = (n: number) => setStep(n)

  const resetAll = () => {
    setFormData(INITIAL_FORM_DATA)
    setStep(1)
    localStorage.removeItem('migrationPlannerData')
  }

  const renderStep = () => {
    const props = { formData, updateField }
    switch (step) {
      case 1: return <ProfileStep {...props} />
      case 2: return <FeasibilityStep formData={formData} />
      case 3: return <BudgetStep {...props} />
      case 4: return <LifestyleStep {...props} exchangeRate={rate} />
      case 5: return <JobMarketStep {...props} />
      case 6: return (
        <SummaryStep
          formData={formData}
          exchangeRate={rate}
          lastUpdate={lastUpdate}
          goToStep={goToStep}
        />
      )
      default: return null
    }
  }

  const progress = (step / 6) * 100

  if (!mounted) {
    return (
      <div className="card mb-6 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400 text-lg">⏳ กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Back to Chat + Page Title */}
      <div className="flex items-center gap-3 mb-2">
        <a
          href={`${basePath}/`}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors bg-white/70 rounded-full px-4 py-2 shadow-sm border border-blue-100 hover:border-blue-200"
        >
          ← กลับหน้า Smart Country Matcher
        </a>
      </div>

      {/* Intro Card */}
      <div className="card mb-4">
        <div className="text-center mb-2">
          <h2 className="text-2xl font-bold text-gray-800">🇦🇺 เครื่องคำนวณวีซ่า & งบประมาณ</h2>
          <p className="text-sm text-gray-500 mt-1">
            คำนวณคะแนน Skilled Migration Visa (189/190) ตามเกณฑ์ Home Affairs จริง
          </p>
        </div>

        {/* Data Source Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-3">
          <p className="text-xs text-blue-700 font-medium mb-2">📊 แหล่งข้อมูลที่ใช้คำนวณ:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-blue-600">
            <a href="https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect" target="_blank" rel="noopener noreferrer" className="hover:underline">
              🔗 Home Affairs — SkillSelect Points Table
            </a>
            <a href="https://www.ato.gov.au/tax-rates-and-codes/tax-rates-resident" target="_blank" rel="noopener noreferrer" className="hover:underline">
              🔗 ATO — Tax Rates FY 2025-26
            </a>
            <a href="https://www.numbeo.com/cost-of-living/country_result.jsp?country=Australia" target="_blank" rel="noopener noreferrer" className="hover:underline">
              🔗 Numbeo — AU Cost of Living
            </a>
            <a href="https://www.fairwork.gov.au/pay-and-wages/minimum-wages" target="_blank" rel="noopener noreferrer" className="hover:underline">
              🔗 Fair Work — Minimum Wage $24.10/hr
            </a>
            <a href="https://www.seek.com.au/career-advice/role" target="_blank" rel="noopener noreferrer" className="hover:underline">
              🔗 SEEK — Salary Guide 2025
            </a>
            <a href="https://www.xe.com/currencyconverter/convert/?Amount=1&From=AUD&To=THB" target="_blank" rel="noopener noreferrer" className="hover:underline">
              🔗 XE — Exchange Rate AUD/THB
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
          <p className="text-xs text-amber-700">
            ⚠️ <strong>ข้อจำกัดความรับผิดชอบ:</strong> ข้อมูลนี้เป็นการประมาณการจากแหล่งที่น่าเชื่อถือ
            แต่ <strong>ไม่ใช่คำแนะนำอย่างเป็นทางการ</strong> ค่าใช้จ่ายและเกณฑ์วีซ่าอาจเปลี่ยนแปลงได้ 
            กรุณาตรวจสอบข้อมูลล่าสุดจาก <a href="https://immi.homeaffairs.gov.au" target="_blank" rel="noopener noreferrer" className="underline font-medium">Home Affairs</a> และ 
            <a href="https://www.ato.gov.au" target="_blank" rel="noopener noreferrer" className="underline font-medium"> ATO</a> ก่อนตัดสินใจจริง
            อัตราแลกเปลี่ยนอาจผันผวน ควรเช็คจาก XE.com ก่อนใช้
          </p>
        </div>
      </div>

      {/* The Wizard */}
      <div className="card mb-6">
        {/* Exchange Rate Badge */}
        <div className="flex justify-end mb-2">
          <span className="text-xs text-gray-400">
            💱 1 AUD = {rate.toFixed(2)} THB
            {lastUpdate && ` (${lastUpdate})`}
            <span className="text-amber-500 ml-1">⚠️ ตรวจสอบจาก XE.com ก่อนใช้จริง</span>
          </span>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-4 px-1">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1
            const isActive = step === n
            const isCompleted = step > n
            return (
              <div key={n} className="flex flex-col items-center flex-1 relative">
                {i > 0 && (
                  <div
                    className={`absolute top-5 -left-1/2 w-full h-0.5 ${
                      step > i ? 'bg-green-400' : 'bg-gray-200'
                    }`}
                    style={{ zIndex: 0 }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => goToStep(n)}
                  className={`step-indicator relative z-10 ${
                    isActive ? 'active' : isCompleted ? 'completed' : 'pending'
                  }`}
                >
                  {isCompleted ? '✓' : n}
                </button>
                <span
                  className={`text-[10px] mt-1 text-center hidden sm:block leading-tight ${
                    isActive ? 'text-primary font-bold' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="progress-bar mb-6">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Step Title */}
        <h2 className="text-xl font-bold text-gray-800 mb-1">
          ขั้นที่ {step}: {STEP_LABELS[step - 1]}
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          {step === 1 && 'กรอกข้อมูลพื้นฐานของคุณเพื่อเริ่มวิเคราะห์'}
          {step === 2 && 'ดูคะแนนและตัวเลือกวีซ่าที่เป็นไปได้'}
          {step === 3 && 'เลือกเมืองและสถานะครอบครัวเพื่อคำนวณค่าใช้จ่าย'}
          {step === 4 && 'เปรียบเทียบรายได้กับค่าครองชีพ'}
          {step === 5 && 'ค้นหาอาชีพที่ตรงกับคุณในออสเตรเลีย'}
          {step === 6 && 'สรุปผลการวิเคราะห์ทั้งหมด'}
        </p>

        {/* Step Content */}
        <div className="min-h-[300px] animate-slide-in" key={step}>
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
          <div>
            {step > 1 && (
              <button type="button" onClick={prevStep} className="btn-secondary">
                ← ย้อนกลับ
              </button>
            )}
          </div>
          <div className="flex gap-3 items-center">
            <button
              type="button"
              onClick={resetAll}
              className="btn text-gray-400 hover:text-red-500 text-sm"
            >
              🗑️ เริ่มใหม่
            </button>
            {step < 6 && (
              <button type="button" onClick={nextStep} className="btn-primary">
                ถัดไป →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
