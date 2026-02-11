'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import {
  AUD_TO_THB,
  calculateAusTax,
  calculateThaiTax,
  AU_SALARIES,
  AU_UNSKILLED_SALARY,
  TH_TOTAL_LIVING,
  AU_CITIES,
  FOOD_COSTS,
  TRANSPORT_COSTS,
  calculateSimpleVisaScore,
  recommendCountry,
  MOTIVATION_RESPONSES,
} from '@/data/simulator-data'

// ===== TYPES =====
type Phase = 'chat' | 'profile' | 'sim' | 'result'

interface Profile {
  occupation: string
  age: string
  english: string
  experience: string
  education: string
  thaiSalary: string
  family: string
  city: string
}

// ===== CONSTANTS =====
const MOTIVATION_OPTIONS = [
  { id: 'politics', label: '😤 เบื่อการเมือง ไม่เห็นทางเจริญ' },
  { id: 'money', label: '💸 เงินน้อย ทำงานหนักแต่เก็บไม่อยู่' },
  { id: 'work-life', label: '😩 Work-life balance แย่มาก' },
  { id: 'education', label: '🎓 อยากให้ลูกได้เรียนดีๆ' },
  { id: 'adventure', label: '🌏 อยากลองใช้ชีวิตใหม่' },
  { id: 'healthcare', label: '🏥 อยากได้ระบบดีๆ ปลอดภัย' },
]

const PRIORITY_OPTIONS = [
  { id: 'savings', label: '💰 เก็บเงินเยอะ' },
  { id: 'weather', label: '☀️ อากาศดี' },
  { id: 'work-life', label: '⚖️ Work-life balance' },
  { id: 'safety', label: '🛡️ ปลอดภัย' },
  { id: 'jobs', label: '🎯 หางานง่าย' },
  { id: 'healthcare', label: '🏥 สาธารณสุขดี' },
]

const fmt = (n: number) => Math.round(n).toLocaleString()
const fmtAud = (n: number) => `$${fmt(n)}`
const fmtThb = (n: number) => `฿${fmt(n)}`

// ===== STAGES =====
const STAGE_META = [
  { id: 'savings', title: '💰 ด่าน 1: เตรียมกระสุน', sub: 'มีเงินเก็บเท่าไหร่?' },
  { id: 'predeparture', title: '📋 ด่าน 2: ค่าใช้จ่ายก่อนบิน', sub: 'ก่อนไปต้องจ่ายค่าอะไรบ้าง?' },
  { id: 'job', title: '💼 ด่าน 3: ได้งานแล้ว!', sub: 'เงินเดือนเท่าไหร่?' },
  { id: 'flight', title: '✈️ ด่าน 4: ซื้อตั๋วบินกัน!', sub: 'Business หรือ Economy?' },
  { id: 'temp', title: '🛬 ด่าน 5: ถึงแล้ว! พักไหนก่อน?', sub: 'ที่พักชั่วคราวช่วง 2 สัปดาห์แรก' },
  { id: 'housing', title: '🏠 ด่าน 6: หาบ้านอยู่จริงๆ!', sub: 'แชร์ห้อง หรือ อยู่คนเดียว?' },
  { id: 'furnish', title: '🛋️ ด่าน 7: ซื้อของเข้าบ้าน', sub: 'ตกแต่งบ้านสไตล์ไหน?' },
  { id: 'commute', title: '🚗 ด่าน 8: ไปทำงานยังไง', sub: 'ขับรถ หรือ รถไฟ?' },
  { id: 'food', title: '🍳 ด่าน 9: กินข้าวยังไง', sub: 'ทำเอง หรือ ซื้อกิน?' },
  { id: 'insurance', title: '🏥 ด่าน 10: ประกันสุขภาพ', sub: 'จัดเอง หรือ Medicare ฟรี?' },
]

const TOTAL_STAGES = STAGE_META.length

// ===== MAIN COMPONENT =====
export function ChatSimulator() {
  const [phase, setPhase] = useState<Phase>('chat')

  // Chat
  const [chatStep, setChatStep] = useState(0)
  const [motivation, setMotivation] = useState('')
  const [priorities, setPriorities] = useState<string[]>([])
  const [recCountry, setRecCountry] = useState<ReturnType<typeof recommendCountry> | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  // Profile
  const [profile, setProfile] = useState<Profile>({
    occupation: '', age: '', english: '', experience: '', education: '',
    thaiSalary: '', family: 'single', city: 'melbourne',
  })

  // Simulation
  const [simStage, setSimStage] = useState(0)
  const [savingsInput, setSavingsInput] = useState('')
  const [isMotherLord, setIsMotherLord] = useState(false)
  const [initialAUD, setInitialAUD] = useState(0)
  const [choices, setChoices] = useState<Record<string, string>>({})

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 200)
  }, [chatStep, phase, simStage, analyzing])

  // ===== Derived =====
  const city = AU_CITIES[profile.city] || AU_CITIES['melbourne']
  const salaryData = AU_SALARIES[profile.occupation] || AU_SALARIES['other']

  // Pre-departure
  const preDepartureCosts = useMemo(() => {
    const visa = profile.family === 'family' ? 8200 : profile.family === 'couple' ? 6200 : 4640
    return [
      { label: '📋 Visa Application Fee', aud: visa },
      { label: '📝 Skills Assessment', aud: 1000 },
      { label: '📖 IELTS/PTE สอบภาษา', aud: 400 },
      { label: '🏥 ตรวจสุขภาพ Medical', aud: 400 },
      { label: '📄 เอกสาร+แปล+รับรอง', aud: 500 },
    ]
  }, [profile.family])
  const preDepartureTotal = preDepartureCosts.reduce((s, c) => s + c.aud, 0)

  // Costs helpers
  const grossAnnual = choices['job'] === 'top' ? salaryData.senior : choices['job'] === 'min' ? AU_UNSKILLED_SALARY : salaryData.mid
  const monthlyRent = choices['housing'] === 'share' ? city.rentShare : choices['housing'] === '2bed' ? (profile.family === 'family' ? city.rentFamily : city.rent2br) : city.rent1br
  const bond = monthlyRent
  const flightCost = choices['flight'] === 'business' ? (profile.family === 'single' ? 4500 : profile.family === 'couple' ? 9000 : 13500) : choices['flight'] === 'company' ? 0 : (profile.family === 'single' ? 1100 : profile.family === 'couple' ? 2200 : 3500)
  const tempCost = choices['temp'] === 'airbnb' ? 2100 : choices['temp'] === 'hostel' ? 700 : 0
  const furnishCost = choices['furnish'] === 'nice' ? 4000 : choices['furnish'] === 'ikea' ? 2000 : choices['furnish'] === 'second' ? 800 : 0

  // One-time total (cumulative by stage)
  const oneTimeCosts = useMemo(() => {
    let total = 0
    if (simStage > 1) total += preDepartureTotal
    if (simStage > 3) total += flightCost
    if (simStage > 4) total += tempCost
    if (simStage > 5) total += bond
    if (simStage > 6) total += furnishCost
    return total
  }, [simStage, preDepartureTotal, flightCost, tempCost, bond, furnishCost])

  const balanceAUD = isMotherLord ? Infinity : initialAUD - oneTimeCosts

  // Monthly
  const auTax = calculateAusTax(grossAnnual)
  const monthlyNet = auTax.netMonthly
  const monthlyFood = FOOD_COSTS[choices['food']]?.cost || 550
  const monthlyTransport = TRANSPORT_COSTS[choices['commute']]?.cost || 200
  const monthlyInsurance = choices['insurance'] === 'private' ? 150 : 0
  const monthlyUtils = city.utilities + city.internet
  const monthlyPhone = 50
  const monthlyMisc = 250
  const totalMonthlyExp = monthlyRent + monthlyUtils + monthlyFood + monthlyTransport + monthlyInsurance + monthlyPhone + monthlyMisc
  const monthlySavings = monthlyNet - totalMonthlyExp
  const monthlySavingsTHB = Math.round(monthlySavings * AUD_TO_THB)

  // Thai comparison
  const thaiSalary = parseInt(profile.thaiSalary) || 40000
  const thaiTax = calculateThaiTax(thaiSalary * 12)
  const thaiNetMonthly = thaiTax.netMonthly
  const thaiMonthlySavings = thaiNetMonthly - TH_TOTAL_LIVING

  // Visa
  const visa = calculateSimpleVisaScore(profile.age, profile.english, profile.experience, profile.education, choices['job'] === 'min' ? 'unskilled' : 'skilled')

  // Final one-time calculated with all choices (for result)
  const finalOneTime = preDepartureTotal + flightCost + tempCost + bond + furnishCost

  // ===== HANDLERS =====
  const pickMotivation = (id: string) => {
    setMotivation(id)
    setChatStep(1)
  }

  const togglePriority = (id: string) => {
    setPriorities(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev)
  }

  const confirmPriorities = () => {
    setAnalyzing(true)
    setTimeout(() => {
      setRecCountry(recommendCountry(priorities))
      setChatStep(2)
      setAnalyzing(false)
    }, 1500)
  }

  const up = (field: keyof Profile, val: string) => setProfile(p => ({ ...p, [field]: val }))

  const commitSavings = (motherLord: boolean) => {
    if (motherLord) {
      setIsMotherLord(true)
      setInitialAUD(9999999)
    } else {
      const thb = parseInt(savingsInput) || 0
      setInitialAUD(Math.round(thb / AUD_TO_THB))
    }
    setSimStage(1)
  }

  const advanceStage = () => setSimStage(s => s + 1)

  const pick = (stageId: string, optionId: string) => {
    setChoices(prev => ({ ...prev, [stageId]: optionId }))
    setSimStage(s => s + 1)
  }

  const restart = () => {
    setPhase('chat'); setChatStep(0); setMotivation(''); setPriorities([]); setRecCountry(null)
    setProfile({ occupation: '', age: '', english: '', experience: '', education: '', thaiSalary: '', family: 'single', city: 'melbourne' })
    setSimStage(0); setSavingsInput(''); setIsMotherLord(false); setInitialAUD(0); setChoices({})
  }

  const allFilled = profile.occupation && profile.age && profile.english && profile.experience && profile.education && profile.thaiSalary

  // ============================
  // ===== RENDER: CHAT =====
  // ============================
  if (phase === 'chat') {
    return (
      <div className="sim-container">
        <div className="sim-scroll">
          {/* Welcome */}
          <div className="chat-bubble bot animate-fade-in">
            <span className="bot-avatar">🤖</span>
            <div className="bubble-content">
              ว่าไง! 👋 เห็นกำลังคิดจะย้ายประเทศ<br />
              เล่าให้ฟังหน่อย <strong>ทำไมอยากย้าย?</strong>
            </div>
          </div>

          {chatStep === 0 && (
            <div className="options-grid animate-fade-in">
              {MOTIVATION_OPTIONS.map(o => (
                <button key={o.id} onClick={() => pickMotivation(o.id)} className="chat-option-btn">{o.label}</button>
              ))}
            </div>
          )}

          {chatStep >= 1 && (
            <>
              <div className="chat-bubble user animate-fade-in">
                <div className="bubble-content">{MOTIVATION_OPTIONS.find(o => o.id === motivation)?.label}</div>
              </div>
              {MOTIVATION_RESPONSES[motivation]?.map((r, i) => (
                <div key={i} className="chat-bubble bot animate-fade-in">
                  <span className="bot-avatar">🤖</span>
                  <div className="bubble-content">{r}</div>
                </div>
              ))}
              <div className="chat-bubble bot animate-fade-in">
                <span className="bot-avatar">🤖</span>
                <div className="bubble-content">
                  แล้ว<strong>อยากได้อะไรจากชีวิตใหม่?</strong> เลือก 2-3 อัน 🎯
                </div>
              </div>
            </>
          )}

          {chatStep === 1 && !analyzing && (
            <div className="animate-fade-in">
              <div className="options-grid">
                {PRIORITY_OPTIONS.map(o => (
                  <button
                    key={o.id}
                    onClick={() => togglePriority(o.id)}
                    className={`chat-option-btn ${priorities.includes(o.id) ? 'selected' : ''}`}
                  >{o.label}</button>
                ))}
              </div>
              {priorities.length >= 2 && (
                <button onClick={confirmPriorities} className="btn-primary w-full mt-3 justify-center rounded-xl py-3 text-sm">
                  ✅ พร้อม! ({priorities.length} อัน)
                </button>
              )}
            </div>
          )}

          {/* Analyzing animation */}
          {analyzing && (
            <div className="chat-bubble bot animate-fade-in">
              <span className="bot-avatar">🤖</span>
              <div className="bubble-content">
                <span className="typing-indicator">
                  <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                </span>
                &nbsp;กำลังวิเคราะห์...
              </div>
            </div>
          )}

          {/* Country rec */}
          {chatStep >= 2 && recCountry && (
            <div className="animate-fade-in">
              <div className="rec-card">
                <div className="text-center text-4xl mb-2">{recCountry.flag}</div>
                <div className="text-center text-xl font-bold text-gray-800 mb-3">
                  น่าจะเหมาะกับ {recCountry.name}!
                </div>
                {recCountry.reasons.map((r, i) => (
                  <div key={i} className="text-sm text-green-700 mb-1">✅ {r}</div>
                ))}
                {recCountry.caveat && (
                  <div className="text-sm text-orange-600 mt-2">⚠️ แต่ต้องรู้: {recCountry.caveat}</div>
                )}
                {recCountry.id !== 'australia' && (
                  <div className="text-xs text-gray-500 mt-3 p-2 bg-gray-50 rounded-lg">ℹ️ ตอนนี้ระบบมีข้อมูลละเอียดของ Australia เป็นหลัก เดี๋ยวจำลองชีวิตที่ AU ให้ดูก่อนนะ!</div>
                )}
                <button onClick={() => setPhase('profile')} className="btn-primary w-full mt-4 justify-center rounded-xl py-4 text-lg">
                  🚀 มาจำลองชีวิตกันเลย!
                </button>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    )
  }

  // ===============================
  // ===== RENDER: PROFILE =====
  // ===============================
  if (phase === 'profile') {
    return (
      <div className="sim-container">
        <div className="sim-scroll">
          <div className="text-center mb-5 animate-fade-in">
            <div className="text-xl font-bold text-gray-800">📋 กรอกข้อมูลสั้นๆ</div>
            <div className="text-sm text-gray-500 mt-1">ไว้คำนวณชีวิตจริงหลังย้ายไป</div>
          </div>

          <div className="space-y-3 animate-fade-in">
            <div>
              <label className="form-label">💼 อาชีพ</label>
              <select className="form-select" value={profile.occupation} onChange={e => up('occupation', e.target.value)}>
                <option value="">— เลือก —</option>
                <option value="software">💻 IT / Software</option>
                <option value="data-ai">📊 Data / AI / ML</option>
                <option value="accounting">💰 บัญชี / การเงิน</option>
                <option value="engineering">⚙️ วิศวกร</option>
                <option value="healthcare">👨‍⚕️ แพทย์ / พยาบาล</option>
                <option value="chef">👨‍🍳 เชฟ / Hospitality</option>
                <option value="trades">🔧 ช่าง / Trades</option>
                <option value="other">📋 อื่นๆ</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">📅 อายุ</label>
                <select className="form-select" value={profile.age} onChange={e => up('age', e.target.value)}>
                  <option value="">— เลือก —</option>
                  <option value="18-24">18-24 ปี</option>
                  <option value="25-32">25-32 ปี ⭐</option>
                  <option value="33-39">33-39 ปี</option>
                  <option value="40-44">40-44 ปี</option>
                  <option value="45+">45+ ปี</option>
                </select>
              </div>
              <div>
                <label className="form-label">🗣️ IELTS/PTE</label>
                <select className="form-select" value={profile.english} onChange={e => up('english', e.target.value)}>
                  <option value="">— เลือก —</option>
                  <option value="superior">8.0+ Superior</option>
                  <option value="proficient">7.0 Proficient</option>
                  <option value="competent">6.0 Competent</option>
                  <option value="low">ต่ำกว่า 6</option>
                </select>
              </div>
              <div>
                <label className="form-label">💪 ประสบการณ์</label>
                <select className="form-select" value={profile.experience} onChange={e => up('experience', e.target.value)}>
                  <option value="">— เลือก —</option>
                  <option value="0-2">0-2 ปี</option>
                  <option value="3-4">3-4 ปี</option>
                  <option value="5-7">5-7 ปี</option>
                  <option value="8+">8+ ปี</option>
                </select>
              </div>
              <div>
                <label className="form-label">🎓 การศึกษา</label>
                <select className="form-select" value={profile.education} onChange={e => up('education', e.target.value)}>
                  <option value="">— เลือก —</option>
                  <option value="phd">ปริญญาเอก</option>
                  <option value="masters">ปริญญาโท</option>
                  <option value="bachelor">ปริญญาตรี</option>
                  <option value="diploma">ปวส./Diploma</option>
                  <option value="highschool">ม.6 หรือต่ำกว่า</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">💵 เงินเดือนไทยตอนนี้ (บาท/เดือน)</label>
              <input type="number" className="form-input" placeholder="เช่น 45000" value={profile.thaiSalary} onChange={e => up('thaiSalary', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">👥 ไปกับใคร</label>
                <select className="form-select" value={profile.family} onChange={e => up('family', e.target.value)}>
                  <option value="single">🧑 คนเดียว</option>
                  <option value="couple">👫 กับคนรัก</option>
                  <option value="family">👨‍👩‍👧 ครอบครัว</option>
                </select>
              </div>
              <div>
                <label className="form-label">🏙️ เมือง</label>
                <select className="form-select" value={profile.city} onChange={e => up('city', e.target.value)}>
                  <option value="sydney">🏙️ Sydney</option>
                  <option value="melbourne">🎭 Melbourne</option>
                  <option value="brisbane">☀️ Brisbane</option>
                </select>
              </div>
            </div>

            {allFilled && (
              <button onClick={() => { setPhase('sim'); setSimStage(0) }} className="btn-primary w-full mt-2 justify-center rounded-xl py-4 text-lg animate-fade-in">
                🎮 เริ่มจำลองชีวิตกันเลย!
              </button>
            )}
          </div>
          <div ref={bottomRef} />
        </div>
      </div>
    )
  }

  // ==================================
  // ===== RENDER: SIMULATION =====
  // ==================================
  const allDone = simStage >= TOTAL_STAGES

  return (
    <div className="sim-container">
      {/* Balance bar */}
      <div className={`balance-bar ${isMotherLord ? 'motherlord' : balanceAUD < 0 ? 'negative' : ''}`}>
        {isMotherLord ? (
          <span>🏦 <strong>MOTHERLORD MODE</strong> 💰 ∞</span>
        ) : (
          <span>🏦 เงินคงเหลือ: <strong>{fmtAud(balanceAUD)}</strong> <span className="bal-thb">({fmtThb(Math.round(balanceAUD * AUD_TO_THB))})</span></span>
        )}
      </div>

      <div className="sim-scroll sim-scroll-with-bar">
        {/* Progress */}
        <div className="stage-progress">
          {STAGE_META.map((_, i) => (
            <div key={i} className={`stage-dot ${i < simStage ? 'done' : i === simStage ? 'current' : ''}`} />
          ))}
        </div>

        {/* ===== COMPLETED STAGES ===== */}
        {simStage >= 1 && (
          <Completed emoji="💰" title="เตรียมกระสุน"
            detail={isMotherLord ? 'MOTHERLORD ∞' : `${fmtThb(parseInt(savingsInput) || 0)} = ${fmtAud(initialAUD)}`}
          />
        )}
        {simStage >= 2 && (
          <Completed emoji="📋" title="ค่าก่อนบิน" detail={`-${fmtAud(preDepartureTotal)}`} negative />
        )}
        {simStage > 2 && choices['job'] && (
          <Completed emoji="💼" title="ได้งาน"
            detail={`${fmtAud(grossAnnual)}/ปี (${choices['job'] === 'top' ? '👑 Top' : choices['job'] === 'min' ? 'ขั้นต่ำ' : 'Average'})`}
          />
        )}
        {simStage > 3 && choices['flight'] && (
          <Completed emoji="✈️" title="ตั๋วเครื่องบิน"
            detail={choices['flight'] === 'company' ? 'ฟรี! บ.ออกให้' : `-${fmtAud(flightCost)}`}
            negative={choices['flight'] !== 'company'}
          />
        )}
        {simStage > 4 && choices['temp'] && (
          <Completed emoji="🏨" title="พักชั่วคราว"
            detail={choices['temp'] === 'friend' ? 'ฟรี!' : `-${fmtAud(tempCost)}`}
            negative={choices['temp'] !== 'friend'}
          />
        )}
        {simStage > 5 && choices['housing'] && (
          <Completed emoji="🏠" title="บ้าน"
            detail={`มัดจำ -${fmtAud(bond)} + ${fmtAud(monthlyRent)}/เดือน`}
            negative
          />
        )}
        {simStage > 6 && choices['furnish'] && (
          <Completed emoji="🛋️" title="ของเข้าบ้าน"
            detail={furnishCost === 0 ? 'Furnished! $0' : `-${fmtAud(furnishCost)}`}
            negative={furnishCost > 0}
          />
        )}
        {simStage > 7 && choices['commute'] && (
          <Completed emoji="🚗" title="เดินทาง" detail={`${fmtAud(monthlyTransport)}/เดือน`} />
        )}
        {simStage > 8 && choices['food'] && (
          <Completed emoji="🍳" title="อาหาร" detail={`${fmtAud(monthlyFood)}/เดือน`} />
        )}
        {simStage > 9 && choices['insurance'] && (
          <Completed emoji="🏥" title="ประกัน"
            detail={monthlyInsurance > 0 ? `$150/เดือน` : 'ฟรี!'}
          />
        )}

        {/* ===== CURRENT STAGE ===== */}
        {!allDone && phase === 'sim' && (
          <div className="stage-card animate-fade-in">
            <div className="stage-header">
              <div className="text-lg font-bold text-gray-800">{STAGE_META[simStage].title}</div>
              <div className="text-sm text-gray-500">{STAGE_META[simStage].sub}</div>
            </div>
            <div className="stage-body">

              {/* Stage 0: Savings input */}
              {simStage === 0 && (
                <div className="space-y-3">
                  <div>
                    <label className="form-label">กรอกเงินเก็บ (บาท)</label>
                    <input type="number" className="form-input" placeholder="เช่น 500000"
                      value={savingsInput} onChange={e => setSavingsInput(e.target.value)} />
                    {savingsInput && (
                      <div className="text-xs text-gray-500 mt-1">= {fmtAud(Math.round((parseInt(savingsInput) || 0) / AUD_TO_THB))} AUD</div>
                    )}
                  </div>
                  {savingsInput && (
                    <button onClick={() => commitSavings(false)} className="stage-option-btn">
                      ✅ มีเงินเก็บ {fmtThb(parseInt(savingsInput))} — ไปเลย!
                    </button>
                  )}
                  <button onClick={() => commitSavings(true)} className="stage-option-btn motherlord-btn">
                    🤑 9,999,999 MOTHERLORD — เงินไม่จำกัด!
                  </button>
                </div>
              )}

              {/* Stage 1: Pre-departure */}
              {simStage === 1 && (
                <div>
                  <div className="text-sm text-gray-600 mb-3">ก่อนไปต้องจ่ายทั้งหมดนี้:</div>
                  {preDepartureCosts.map((c, i) => (
                    <div key={i} className="flex justify-between py-1.5 text-sm border-b border-gray-100">
                      <span>{c.label}</span>
                      <span className="font-mono text-red-500">-{fmtAud(c.aud)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 font-bold border-t-2 border-gray-200 mt-2">
                    <span>รวม</span>
                    <span className="text-red-600">-{fmtAud(preDepartureTotal)}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 mb-3">≈ {fmtThb(Math.round(preDepartureTotal * AUD_TO_THB))}</div>
                  <button onClick={advanceStage} className="stage-option-btn">
                    💳 จ่ายเลย! ไม่มีทางถอยแล้ว 🔥
                  </button>
                </div>
              )}

              {/* Stage 2: Job */}
              {simStage === 2 && (
                <div className="space-y-2">
                  <Opt onClick={() => pick('job', 'avg')}>
                    <div className="font-semibold">💼 ได้งาน {salaryData.label} — Average</div>
                    <div className="text-sm text-gray-500">{fmtAud(salaryData.mid)}/ปี ≈ {fmtThb(Math.round(salaryData.mid / 12 * AUD_TO_THB))}/เดือน</div>
                  </Opt>
                  <Opt onClick={() => pick('job', 'top')}>
                    <div className="font-semibold">👑 ฉันเทพ! Top Salary</div>
                    <div className="text-sm text-gray-500">{fmtAud(salaryData.senior)}/ปี ≈ {fmtThb(Math.round(salaryData.senior / 12 * AUD_TO_THB))}/เดือน</div>
                  </Opt>
                  <Opt onClick={() => pick('job', 'min')}>
                    <div className="font-semibold">😅 หางาน professional ไม่ได้ ทำอะไรก็ได้</div>
                    <div className="text-sm text-gray-500">{fmtAud(AU_UNSKILLED_SALARY)}/ปี (Minimum wage)</div>
                  </Opt>
                </div>
              )}

              {/* Stage 3: Flight */}
              {simStage === 3 && (
                <div className="space-y-2">
                  <Opt onClick={() => pick('flight', 'business')}>
                    <div className="font-semibold">✈️ Business Class เศรษฐี</div>
                    <div className="text-sm text-red-500">-{fmtAud(profile.family === 'single' ? 4500 : profile.family === 'couple' ? 9000 : 13500)}</div>
                  </Opt>
                  <Opt onClick={() => pick('flight', 'economy')}>
                    <div className="font-semibold">🪑 Economy ธรรมดาดีกว่า</div>
                    <div className="text-sm text-red-500">-{fmtAud(profile.family === 'single' ? 1100 : profile.family === 'couple' ? 2200 : 3500)}</div>
                  </Opt>
                  <Opt onClick={() => pick('flight', 'company')}>
                    <div className="font-semibold">🏢 บริษัทออกให้ สุดคุ้ม!</div>
                    <div className="text-sm text-green-600">ฟรี! $0</div>
                  </Opt>
                </div>
              )}

              {/* Stage 4: Temp Housing */}
              {simStage === 4 && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 mb-1">ถึง {city.name} แล้ว! พัก 2 สัปดาห์แรกไหนดี?</div>
                  <Opt onClick={() => pick('temp', 'airbnb')}>
                    <div className="font-semibold">🏨 Airbnb (สะดวก มีห้องครัว)</div>
                    <div className="text-sm text-red-500">-$2,100 (14 คืน × $150)</div>
                  </Opt>
                  <Opt onClick={() => pick('temp', 'hostel')}>
                    <div className="font-semibold">🛏️ Hostel/Backpacker ประหยัด</div>
                    <div className="text-sm text-red-500">-$700 (14 คืน × $50)</div>
                  </Opt>
                  <Opt onClick={() => pick('temp', 'friend')}>
                    <div className="font-semibold">🏠 อาศัยเพื่อน/ญาติ ฟรี!</div>
                    <div className="text-sm text-green-600">$0 โชคดีมาก!</div>
                  </Opt>
                </div>
              )}

              {/* Stage 5: Real Housing */}
              {simStage === 5 && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 mb-1">ค่าเช่า {city.name} + มัดจำ 4 สัปดาห์:</div>
                  <Opt onClick={() => pick('housing', 'share')}>
                    <div className="font-semibold">🏠 แชร์บ้าน/ห้อง ประหยัดสุด!</div>
                    <div className="text-sm text-gray-500">มัดจำ -{fmtAud(city.rentShare)} + เช่า {fmtAud(city.rentShare)}/เดือน</div>
                  </Opt>
                  <Opt onClick={() => pick('housing', '1bed')}>
                    <div className="font-semibold">🏢 คอนโด 1 ห้องนอน</div>
                    <div className="text-sm text-gray-500">มัดจำ -{fmtAud(city.rent1br)} + เช่า {fmtAud(city.rent1br)}/เดือน</div>
                  </Opt>
                  <Opt onClick={() => pick('housing', '2bed')}>
                    <div className="font-semibold">🏢 อพาร์ทเมนต์ 2 ห้องนอน {profile.family !== 'single' ? '(สำหรับครอบครัว)' : ''}</div>
                    <div className="text-sm text-gray-500">มัดจำ -{fmtAud(profile.family === 'family' ? city.rentFamily : city.rent2br)} + เช่า {fmtAud(profile.family === 'family' ? city.rentFamily : city.rent2br)}/เดือน</div>
                  </Opt>
                </div>
              )}

              {/* Stage 6: Furnishing */}
              {simStage === 6 && (
                <div className="space-y-2">
                  <Opt onClick={() => pick('furnish', 'ikea')}>
                    <div className="font-semibold">🪑 IKEA ชุดเริ่มต้น</div>
                    <div className="text-sm text-red-500">-$2,000</div>
                  </Opt>
                  <Opt onClick={() => pick('furnish', 'nice')}>
                    <div className="font-semibold">✨ ของดีหน่อย จัดเต็ม</div>
                    <div className="text-sm text-red-500">-$4,000</div>
                  </Opt>
                  <Opt onClick={() => pick('furnish', 'second')}>
                    <div className="font-semibold">♻️ มือสอง Facebook Marketplace</div>
                    <div className="text-sm text-red-500">-$800</div>
                  </Opt>
                  <Opt onClick={() => pick('furnish', 'furnished')}>
                    <div className="font-semibold">🏢 เลือกบ้าน furnished ไม่ต้องซื้อ!</div>
                    <div className="text-sm text-green-600">$0</div>
                  </Opt>
                </div>
              )}

              {/* Stage 7: Commute */}
              {simStage === 7 && (
                <div className="space-y-2">
                  <Opt onClick={() => pick('commute', 'car')}>
                    <div className="font-semibold">🚗 ขับรถเอง (สะดวก แต่แพง)</div>
                    <div className="text-sm text-gray-500">$720/เดือน (ผ่อน+ประกัน+น้ำมัน+rego)</div>
                  </Opt>
                  <Opt onClick={() => pick('commute', 'mixed')}>
                    <div className="font-semibold">🚗🚇 ผสม รถไฟ+Uber</div>
                    <div className="text-sm text-gray-500">$380/เดือน</div>
                  </Opt>
                  <Opt onClick={() => pick('commute', 'public')}>
                    <div className="font-semibold">🚇 รถไฟ/รถเมล์ ประหยัดสุด</div>
                    <div className="text-sm text-gray-500">$200/เดือน</div>
                  </Opt>
                </div>
              )}

              {/* Stage 8: Food */}
              {simStage === 8 && (
                <div className="space-y-2">
                  <Opt onClick={() => pick('food', 'always')}>
                    <div className="font-semibold">👨‍🍳 ทำเองทุกมื้อ เก็บเงินสุดๆ</div>
                    <div className="text-sm text-gray-500">$400/เดือน</div>
                  </Opt>
                  <Opt onClick={() => pick('food', 'often')}>
                    <div className="font-semibold">🍳 ทำเองบ้าง ซื้อบ้าง</div>
                    <div className="text-sm text-gray-500">$550/เดือน</div>
                  </Opt>
                  <Opt onClick={() => pick('food', 'sometimes')}>
                    <div className="font-semibold">🥡 ซื้อกินบ่อย ขี้เกียจทำ</div>
                    <div className="text-sm text-gray-500">$700/เดือน</div>
                  </Opt>
                  <Opt onClick={() => pick('food', 'rarely')}>
                    <div className="font-semibold">🛵 สั่ง Uber Eats ทุกมื้อ</div>
                    <div className="text-sm text-gray-500">$900/เดือน (แพงอ่ะ!)</div>
                  </Opt>
                </div>
              )}

              {/* Stage 9: Insurance */}
              {simStage === 9 && (
                <div className="space-y-2">
                  <Opt onClick={() => pick('insurance', 'medicare')}>
                    <div className="font-semibold">🏥 Medicare เฉยๆ (ฟรี!)</div>
                    <div className="text-sm text-green-600">$0/เดือน — ครอบคลุม GP + รพ.รัฐ</div>
                  </Opt>
                  <Opt onClick={() => pick('insurance', 'private')}>
                    <div className="font-semibold">🏥+ Medicare + ประกันเอกชนเพิ่ม</div>
                    <div className="text-sm text-gray-500">$150/เดือน — เลือกหมอ/รพ.เอกชนได้</div>
                  </Opt>
                  <Opt onClick={() => pick('insurance', 'company')}>
                    <div className="font-semibold">💼 บริษัททำให้!</div>
                    <div className="text-sm text-green-600">$0/เดือน</div>
                  </Opt>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== ALL STAGES DONE: INITIAL COST SUMMARY ===== */}
        {allDone && phase === 'sim' && (
          <div className="animate-fade-in space-y-4">
            <div className="stage-card">
              <div className="stage-header">
                <div className="text-lg font-bold text-gray-800">📊 สรุปค่าตั้งต้นทั้งหมด</div>
              </div>
              <div className="stage-body">
                <SumRow label="📋 วีซ่า+เอกสาร+สอบ+ตรวจ" aud={preDepartureTotal} />
                <SumRow label="✈️ ตั๋วเครื่องบิน" aud={flightCost} />
                <SumRow label="🏨 ที่พักชั่วคราว" aud={tempCost} />
                <SumRow label="🏠 มัดจำบ้าน (4 สัปดาห์)" aud={bond} />
                <SumRow label="🛋️ ของเข้าบ้าน" aud={furnishCost} />
                <div className="flex justify-between py-2 font-bold border-t-2 border-gray-300 mt-2">
                  <span>รวมค่าตั้งต้น</span>
                  <span className="text-red-600">-{fmtAud(finalOneTime)}</span>
                </div>
                <div className="text-xs text-gray-500 mb-3">≈ {fmtThb(Math.round(finalOneTime * AUD_TO_THB))}</div>

                <div className={`p-4 rounded-xl text-center ${isMotherLord ? 'bg-yellow-50 border-2 border-yellow-300' : (initialAUD - finalOneTime) >= 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                  <div className="text-sm text-gray-600">{isMotherLord ? '🤑 MOTHERLORD MODE' : '💰 เงินเหลือหลังจ่ายค่าตั้งต้น'}</div>
                  <div className={`text-2xl font-bold ${isMotherLord ? 'text-yellow-600' : (initialAUD - finalOneTime) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {isMotherLord ? '∞' : fmtAud(initialAUD - finalOneTime)}
                  </div>
                  {!isMotherLord && (initialAUD - finalOneTime) < 0 && (
                    <div className="text-sm text-red-600 mt-1">⚠️ เงินไม่พอ! ต้องหาเพิ่มอีก {fmtAud(Math.abs(initialAUD - finalOneTime))}</div>
                  )}
                </div>
              </div>
            </div>

            <button onClick={() => setPhase('result')} className="btn-primary w-full justify-center rounded-xl py-4 text-lg">
              🎊 ดูชีวิตรายเดือน!
            </button>
          </div>
        )}

        {/* ===== RESULT PHASE ===== */}
        {phase === 'result' && (
          <div className="animate-fade-in space-y-4">
            <div className="text-center py-2">
              <div className="text-3xl font-bold text-gray-800 mb-1">🎊 ยินดีด้วย!</div>
              <div className="text-lg text-blue-600 font-semibold">คุณย้ายไป {city.name}, Australia สำเร็จ!</div>
            </div>

            {/* Monthly Breakdown */}
            <div className="result-section">
              <h4 className="text-base font-bold text-gray-800 mb-2">💵 ชีวิตรายเดือนของคุณ</h4>

              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">รายรับ</div>
              <Row label={`เงินเดือน (Gross) — ${choices['job'] === 'top' ? '👑 Top' : choices['job'] === 'min' ? 'ขั้นต่ำ' : 'Average'}`} val={fmtAud(Math.round(grossAnnual / 12))} />
              <Row label={`ภาษี (${auTax.effectiveRate}%)`} val={`-${fmtAud(Math.round(auTax.tax / 12))}`} red />
              <Row label="Medicare 2%" val={`-${fmtAud(Math.round(auTax.medicare / 12))}`} red />
              <div className="flex justify-between py-2 font-bold text-green-700 border-t border-gray-200">
                <span>💰 เงินสุทธิ Net</span>
                <span>{fmtAud(monthlyNet)}/เดือน</span>
              </div>
              <div className="text-xs text-gray-400 mb-3">
                + Super {fmtAud(Math.round(grossAnnual * 0.115 / 12))}/เดือน (นายจ้างจ่ายเงินเกษียณ 11.5%)
              </div>

              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">รายจ่าย</div>
              <Row label={`🏠 ค่าเช่า (${choices['housing'] === 'share' ? 'แชร์' : choices['housing'] === '1bed' ? '1 bed' : '2 bed'})`} val={`-${fmtAud(monthlyRent)}`} red />
              <Row label="💡 น้ำ/ไฟ+Internet" val={`-${fmtAud(monthlyUtils)}`} red />
              <Row label={`🍳 อาหาร`} val={`-${fmtAud(monthlyFood)}`} red />
              <Row label={`🚇 เดินทาง`} val={`-${fmtAud(monthlyTransport)}`} red />
              <Row label="📱 มือถือ" val={`-${fmtAud(monthlyPhone)}`} red />
              {monthlyInsurance > 0 && <Row label="🏥 ประกันเพิ่ม" val={`-${fmtAud(monthlyInsurance)}`} red />}
              <Row label="🎬 เที่ยว/สังสรรค์" val={`-${fmtAud(monthlyMisc)}`} red />
              <Row label="🏥 Medicare" val="ฟรี!" green />

              <div className="flex justify-between py-2 font-bold border-t-2 border-gray-300 mt-1">
                <span>รวมจ่าย</span>
                <span className="text-red-600">-{fmtAud(totalMonthlyExp)}/เดือน</span>
              </div>
            </div>

            {/* Net Savings */}
            <div className={`p-5 rounded-xl text-center ${monthlySavings >= 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
              <div className="text-sm text-gray-600 mb-1">💰 เหลือเก็บต่อเดือน</div>
              <div className={`text-3xl font-bold ${monthlySavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {fmtAud(monthlySavings)} AUD
              </div>
              <div className={`text-lg font-semibold ${monthlySavings >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ≈ {fmtThb(monthlySavingsTHB)}/เดือน
              </div>
              {monthlySavings > 0 && (
                <div className="text-xs text-gray-500 mt-1">1 ปีเก็บได้ ~{fmtThb(monthlySavingsTHB * 12)}</div>
              )}
            </div>

            {/* Fun spend */}
            {monthlySavings > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm">
                <div className="font-bold text-purple-800 mb-2">🎉 เงิน {fmtAud(monthlySavings)}/เดือน ทำอะไรได้?</div>
                <div className="space-y-1 text-purple-700">
                  <div>🍣 กินซูชิ $30 ได้ {Math.round(monthlySavings / 30)} มื้อ</div>
                  <div>✈️ ตั๋วกลับไทย (~$600) ได้ทุก {(600 / monthlySavings).toFixed(1)} เดือน</div>
                  <div>📱 ซื้อ iPhone ได้ทุก {(1899 / monthlySavings).toFixed(1)} เดือน</div>
                  <div>🏦 1 ปีเก็บได้ ~{fmtThb(monthlySavingsTHB * 12)}</div>
                </div>
              </div>
            )}

            {/* TH vs AU */}
            <div className="result-section" style={{ background: 'linear-gradient(135deg, #FFF7ED, #FEF9C3)', borderColor: '#FDBA74' }}>
              <h4 className="text-base font-bold text-gray-800 mb-3">🔥 เทียบกัน: อยู่ไทย vs ย้ายไป AU</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-white/70 rounded-lg">
                  <div className="text-2xl">🇹🇭</div>
                  <div className="font-bold text-gray-800 text-sm">อยู่ไทย</div>
                  <div className="text-xs text-gray-500">เงินเดือน {fmtThb(thaiSalary)}</div>
                  <div className="text-xs text-gray-500">หลังหักค่าใช้จ่าย</div>
                  <div className="text-xl font-bold text-orange-600 mt-1">{fmtThb(thaiMonthlySavings)}</div>
                </div>
                <div className="text-center p-3 bg-white/70 rounded-lg">
                  <div className="text-2xl">🇦🇺</div>
                  <div className="font-bold text-gray-800 text-sm">ย้ายไป AU</div>
                  <div className="text-xs text-gray-500">เงินเดือน {fmtAud(Math.round(grossAnnual / 12))}</div>
                  <div className="text-xs text-gray-500">หลังหักค่าใช้จ่าย</div>
                  <div className="text-xl font-bold text-green-600 mt-1">{fmtThb(monthlySavingsTHB)}</div>
                </div>
              </div>
              {monthlySavingsTHB > thaiMonthlySavings && (
                <div className="text-center mt-3 p-2 bg-green-100 rounded-lg">
                  <span className="text-green-700 font-bold text-sm">📈 เก็บเงินได้มากกว่า +{fmtThb(monthlySavingsTHB - thaiMonthlySavings)}/เดือน!</span>
                </div>
              )}
              <div className="mt-3 text-xs text-orange-700 space-y-1">
                <div>🏥 + Medicare ฟรี (คนไทยจ่ายประกันเอง ~฿1,500/เดือน)</div>
                <div>🏖️ + Annual Leave 20 วัน (ไทยเริ่ม 6 วัน 🥲)</div>
                <div>🤒 + Sick Leave 10 วัน (ไม่หักเงิน)</div>
                <div>🏦 + Super 11.5% นายจ้างจ่ายเงินเกษียณให้</div>
                <div>👶 + Parental Leave 18 สัปดาห์</div>
              </div>
            </div>

            {/* Snarky tax section */}
            <div className="result-section" style={{ background: 'linear-gradient(135deg, #FEF2F2, #FCE7F3)', borderColor: '#FCA5A5' }}>
              <h4 className="text-base font-bold text-gray-800 mb-2">😏 สำหรับคนบอก &ldquo;ภาษีเยอะ ไม่เหลืออะไร&rdquo;</h4>
              <div className="text-sm text-gray-700 space-y-2">
                <div>ภาษี+Medicare ที่ AU: {auTax.effectiveRate}% ≈ {fmtAud(Math.round((auTax.tax + auTax.medicare) / 12))}/เดือน</div>
                <div className="font-semibold text-red-700">
                  {monthlySavingsTHB > thaiMonthlySavings
                    ? `💡 จ่ายภาษี "เยอะ" แต่เหลือเก็บมากกว่าอยู่ไทย +${fmtThb(monthlySavingsTHB - thaiMonthlySavings)}/เดือน`
                    : '💡 ตัวเลขไม่โกหก ลองดูแล้วตัดสินใจเอง'}
                </div>
                <div className="text-xs text-gray-500 italic">
                  ยังไม่รวม: เงินเกษียณ Super + สวัสดิการ + ระบบที่เวิร์ค + อากาศดี
                </div>
              </div>
            </div>

            {/* Visa Score */}
            <div className="result-section">
              <h4 className="text-base font-bold text-gray-800 mb-2">📋 คะแนนวีซ่า (เบื้องต้น)</h4>
              <div className={`p-3 rounded-lg ${visa.score >= 65 ? 'bg-green-50 border border-green-200' : visa.score >= 50 ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">คะแนนรวม</span>
                  <span className={`text-xl font-bold ${visa.score >= 65 ? 'text-green-600' : 'text-yellow-600'}`}>{visa.score} คะแนน</span>
                </div>
                <div className="text-xs text-gray-600 mt-2 space-y-0.5">
                  {visa.details.map((d, i) => <div key={i}>• {d}</div>)}
                </div>
                <div className="text-xs text-gray-400 mt-2">* ยังไม่รวม Partner/เรียนใน AU/NAATI (อาจ +5 ถึง +35)</div>
                {visa.score >= 65 ? (
                  <div className="text-sm text-green-700 font-semibold mt-2">✅ ผ่าน 65! สมัคร 189/190 ได้</div>
                ) : visa.score >= 50 ? (
                  <div className="text-sm text-yellow-700 font-semibold mt-2">⚠️ ลอง 491 Regional (+15) = {visa.score + 15} หรือ employer sponsor 482</div>
                ) : (
                  <div className="text-sm text-red-700 font-semibold mt-2">❌ คะแนนต่ำ ลองเพิ่ม English/ประสบการณ์ หรือไปเรียน Master&apos;s ที่ AU</div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="result-section" style={{ background: '#EFF6FF', borderColor: '#93C5FD' }}>
              <h4 className="text-base font-bold text-gray-800 mb-2">💡 อยากคุณภาพดีกว่านี้?</h4>
              <div className="text-sm text-gray-700 space-y-2">
                {choices['job'] === 'min' && (
                  <div>📈 <strong>หางาน Professional:</strong> ถ้าได้ Skilled Visa เงินเดือนสูงกว่า min wage 2-3 เท่า ลงทุนสอบ IELTS 7.0+ แล้วทำ Skills Assessment</div>
                )}
                {choices['flight'] !== 'company' && (
                  <div>✈️ <strong>หาบ.ที่ sponsor relocation:</strong> Big 4, Tech Companies มักจ่ายค่าย้าย ค่าตั๋ว ค่าที่พักให้</div>
                )}
                {choices['housing'] !== 'share' && (
                  <div>🏠 <strong>แชร์บ้านช่วง 6 เดือนแรก:</strong> ประหยัดค่าเช่าได้ {fmtAud(monthlyRent - city.rentShare)}/เดือน</div>
                )}
                {choices['commute'] === 'car' && (
                  <div>🚇 <strong>ใช้รถไฟช่วงแรก:</strong> ประหยัด {fmtAud(720 - 200)}/เดือน รอจนมั่นคงค่อยซื้อรถ</div>
                )}
                {choices['food'] === 'rarely' && (
                  <div>👨‍🍳 <strong>ทำกินเองบ้าง:</strong> ทำอาหารไทยถูกกว่า 2-3 เท่า Coles/Woolworths มีวัตถุดิบไทยครบ</div>
                )}
                <div>📋 <strong>ขั้นตอน:</strong> สอบ IELTS → Skills Assessment → ยื่น EOI → รอ invitation → ยื่นวีซ่า → Medical → ได้วีซ่า → บินไป! (12-24 เดือน)</div>
              </div>
            </div>

            <div className="text-center text-xs text-gray-400 mt-4 space-y-1">
              <div>⚠️ ตัวเลขเป็นการประมาณ ผลจริงอาจแตกต่าง</div>
              <div>📊 อ้างอิง: Home Affairs, ATO FY25-26, Numbeo, PayScale Feb 2026</div>
            </div>

            <button onClick={restart} className="btn-primary w-full mt-3 justify-center rounded-xl py-3 mb-4">
              🔄 ลองใหม่ เปลี่ยนเงื่อนไข
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}

// ===== SUB-COMPONENTS =====

function Completed({ emoji, title, detail, negative }: { emoji: string; title: string; detail: string; negative?: boolean }) {
  return (
    <div className="completed-stage">
      <span className="text-base">{emoji}</span>
      <div className="min-w-0 flex-1">
        <span className="font-semibold text-gray-700 text-sm">{title}</span>
        <span className={`text-xs ml-2 ${negative ? 'text-red-500' : 'text-gray-500'}`}>{detail}</span>
      </div>
      <span className="text-green-500 text-xs">✓</span>
    </div>
  )
}

function Opt({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="stage-option-btn">{children}</button>
  )
}

function SumRow({ label, aud }: { label: string; aud: number }) {
  return (
    <div className="flex justify-between py-1.5 text-sm border-b border-gray-100">
      <span>{label}</span>
      <span className="font-mono text-red-500">{aud > 0 ? `-${fmtAud(aud)}` : '$0'}</span>
    </div>
  )
}

function Row({ label, val, red, green }: { label: string; val: string; red?: boolean; green?: boolean }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={`font-mono ${red ? 'text-red-500' : green ? 'text-green-600' : 'text-gray-800'}`}>{val}</span>
    </div>
  )
}
