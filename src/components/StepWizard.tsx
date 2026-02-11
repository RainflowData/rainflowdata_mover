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

export function StepWizard() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [mounted, setMounted] = useState(false)
  const { rate, lastUpdate } = useExchangeRate()

  // Hydration guard + load from localStorage
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

  // Save to localStorage on every change
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
      case 1:
        return <ProfileStep {...props} />
      case 2:
        return <FeasibilityStep formData={formData} />
      case 3:
        return <BudgetStep {...props} />
      case 4:
        return <LifestyleStep {...props} exchangeRate={rate} />
      case 5:
        return <JobMarketStep {...props} />
      case 6:
        return (
          <SummaryStep
            formData={formData}
            exchangeRate={rate}
            lastUpdate={lastUpdate}
            goToStep={goToStep}
          />
        )
      default:
        return null
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
    <div className="card mb-6">
      {/* Exchange Rate Badge */}
      <div className="flex justify-end mb-2">
        <span className="text-xs text-gray-400">
          💱 1 AUD = {rate.toFixed(2)} THB
          {lastUpdate && ` (${lastUpdate})`}
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
              {/* Connector line */}
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
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
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
  )
}
