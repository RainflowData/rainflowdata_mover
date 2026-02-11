import type {
  FeasibilityResult,
  VisaOption,
  BudgetResult,
  ParityResult,
  CityKey,
  FamilyStatus,
  CityData,
  PointsBreakdown,
} from './types'

// ===== City Cost Data (Numbeo Feb 2026) =====
export const CITY_DATA: Record<CityKey, CityData> = {
  sydney: {
    rent1br: 3440, rent2br: 4800, rentFamily: 6800,
    groceries: 680, transport: 217, utilities: 294, misc: 450,
  },
  melbourne: {
    rent1br: 2460, rent2br: 3440, rentFamily: 4750,
    groceries: 620, transport: 200, utilities: 291, misc: 400,
  },
  brisbane: {
    rent1br: 2200, rent2br: 3000, rentFamily: 4000,
    groceries: 550, transport: 180, utilities: 250, misc: 350,
  },
}

// ===== Helper: parse age string to score (ตาม Home Affairs) =====
function ageScore(age: string): number {
  switch (age) {
    case '18-24': return 25
    case '25-32': return 30
    case '33-39': return 25
    case '40-44': return 15
    default: return 0 // 45+
  }
}

// ===== Helper: parse english to score (ตาม Home Affairs) =====
function englishScore(level: string): number {
  switch (level) {
    case 'superior': return 20  // IELTS 8.0+
    case 'proficient': return 10 // IELTS 7.0-7.9
    case 'competent': return 0   // IELTS 6.0-6.9
    default: return 0
  }
}

// ===== Helper: Overseas work experience (ตาม Home Affairs) =====
function overseasExperienceScore(exp: string): number {
  switch (exp) {
    case '8+': return 15
    case '5-7': return 10
    case '3-4': return 5
    default: return 0 // 0-2 years
  }
}

// ===== Helper: Australian work experience (ตาม Home Affairs) =====
function australianExperienceScore(exp: string): number {
  const years = parseFloat(exp)
  if (years >= 8) return 20
  if (years >= 5) return 15
  if (years >= 3) return 10
  if (years >= 1) return 5
  return 0
}

// ===== Helper: parse education to score (ตาม Home Affairs) =====
function educationScore(edu: string): number {
  switch (edu) {
    case 'phd': return 20
    case 'masters':
    case 'bachelor': return 15
    case 'trade': return 10
    default: return 0
  }
}

// ===== Helper: Partner points (ตาม Home Affairs) =====
function partnerScore(status: string): number {
  switch (status) {
    case 'has-skills': return 10  // Partner <45, competent English, skills assessment
    case 'has-english': return 5  // Partner with competent English only
    case 'au-citizen-pr': return 10 // Single or partner is AU citizen/PR
    default: return 0
  }
}

// ===== Feasibility Calculation =====
export function calculateFeasibility(
  age: string,
  englishLevel: string,
  experience: string,
  australianExperience: string,
  education: string,
  partnerStatus: string,
  australianStudy: boolean,
  stemQualification: boolean,
  professionalYear: boolean,
  naatiCertified: boolean,
  regionalStudy: boolean
): FeasibilityResult {
  
  // คำนวณคะแนนแต่ละหมวด
  const agePoints = ageScore(age)
  const englishPoints = englishScore(englishLevel)
  const overseasExpPoints = overseasExperienceScore(experience)
  const australianExpPoints = australianExperienceScore(australianExperience)
  const educationPoints = educationScore(education)
  const partnerPoints = partnerScore(partnerStatus)
  const australianStudyPoints = australianStudy ? 5 : 0
  const stemPoints = stemQualification ? 10 : 0
  const professionalYearPoints = professionalYear ? 5 : 0
  const naatiPoints = naatiCertified ? 5 : 0
  const regionalStudyPoints = regionalStudy ? 5 : 0
  
  // Work experience มี cap ที่ 20 คะแนน (ตาม Home Affairs)
  const workExpPoints = Math.min(overseasExpPoints + australianExpPoints, 20)
  const overseasUsed = Math.min(overseasExpPoints, workExpPoints)
  const australianUsed = Math.min(australianExpPoints, workExpPoints - overseasUsed)
  
  const totalScore = 
    agePoints + 
    englishPoints + 
    workExpPoints +
    educationPoints + 
    partnerPoints + 
    australianStudyPoints + 
    stemPoints + 
    professionalYearPoints + 
    naatiPoints + 
    regionalStudyPoints

  const pointsBreakdown: PointsBreakdown = {
    age: agePoints,
    english: englishPoints,
    overseasExperience: overseasUsed,
    australianExperience: australianUsed,
    education: educationPoints,
    partner: partnerPoints,
    australianStudy: australianStudyPoints,
    stemQualification: stemPoints,
    professionalYear: professionalYearPoints,
    naati: naatiPoints,
    regionalStudy: regionalStudyPoints,
    total: totalScore,
  }

  const warnings: string[] = []
  let feasible = true

  if (age === '45+') {
    warnings.push('อายุ 45+ จะได้ 0 คะแนนอายุ ยากมากใน skilled visa')
  }
  if (englishLevel === 'functional' || !englishLevel) {
    warnings.push('ต้องมี IELTS/PTE ขั้นต่ำ Competent (6.0) ถึงจะสมัคร skilled visa ได้')
    if (englishLevel === 'functional') feasible = false
  }
  if (experience === '0-2' || !experience) {
    warnings.push('ประสบการณ์น้อยกว่า 3 ปี จะได้ 0 คะแนนในส่วนนี้')
  }
  if (!education || education === 'trade') {
    warnings.push('วุฒิ Trade/Diploma ได้ 10 คะแนน — พิจารณาวีซ่า Trades ที่มี cut-off ต่ำกว่า')
  }

  // Visa options
  const visaOptions: VisaOption[] = []

  if (totalScore >= 65) {
    visaOptions.push({
      type: 'Subclass 189',
      name: 'Skilled Independent Visa',
      difficulty: totalScore >= 85 ? 'medium' : 'very-hard',
      description: 'ไม่ต้อง sponsor สมัครเองได้ แต่แข่งสูงมาก (cut-off 85-95+ คะแนน ในปี 2025-26)',
      pathToPR: 'ได้ PR ทันที',
      timeline: '12-18 เดือน',
    })
  }

  if (totalScore >= 60) {
    visaOptions.push({
      type: 'Subclass 190',
      name: 'Skilled Nominated Visa',
      difficulty: 'medium',
      description: 'ต้องได้ nomination จาก state (NSW/VIC/QLD) +5 คะแนน → รวมแล้ว ' + (totalScore + 5) + ' คะแนน',
      pathToPR: 'ได้ PR ทันที แต่ต้องอยู่ state นั้น 2 ปี',
      timeline: '12-18 เดือน',
    })
  }

  if (totalScore >= 50) {
    visaOptions.push({
      type: 'Subclass 491',
      name: 'Skilled Work Regional Visa',
      difficulty: 'easy',
      description: 'Regional nomination +15 คะแนน → รวมแล้ว ' + (totalScore + 15) + ' คะแนน (ต้องอยู่ regional 3 ปี)',
      pathToPR: 'หลัง 3 ปีสมัคร 191 เป็น PR',
      timeline: '8-12 เดือน',
    })
  }

  visaOptions.push({
    type: 'Subclass 482',
    name: 'Temporary Skill Shortage (TSS)',
    difficulty: 'easy',
    description: 'ต้องมี employer sponsor ก่อน (หางานจากไทย หรือไปหาที่นั่น)',
    pathToPR: 'ทำ 3 ปี → สมัคร 186 (Employer Nomination) ได้',
    timeline: '3-6 เดือน (ถ้ามี job offer)',
  })

  visaOptions.push({
    type: 'Subclass 485',
    name: 'Post-Study Work Visa',
    difficulty: 'easy',
    description: 'เรียน Master/PhD ใน Australia ก่อน → จบได้ work visa 2-4 ปี',
    pathToPR: 'ใช้เวลาหางาน → apply 482/189/190 ภายหลัง',
    timeline: '2-3 ปี (รวมเรียน)',
  })

  return { feasible, score: totalScore, pointsBreakdown, visaOptions, warnings }
}

// ===== Budget Calculation =====
export function calculateBudget(
  city: CityKey,
  familyStatus: FamilyStatus
): BudgetResult {
  const data = CITY_DATA[city]

  const monthlyRent =
    familyStatus === 'single'
      ? data.rent1br
      : familyStatus === 'couple'
      ? data.rent2br
      : data.rentFamily

  const monthlyLiving = data.groceries + data.transport + data.utilities + data.misc
  const monthlyTotal = monthlyRent + monthlyLiving

  // All in AUD
  const initialCosts = {
    visa: familyStatus === 'family' ? 8200 : 4640,
    flight: familyStatus === 'single' ? 1000 : familyStatus === 'couple' ? 2000 : 3000,
    bond: Math.round(monthlyRent),   // 4 weeks bond ≈ 1 month rent
    furniture: familyStatus === 'single' ? 2000 : 4000,
    documents: 1500,                  // skills assessment + translations
  }

  const totalInitial = Object.values(initialCosts).reduce((a, b) => a + b, 0)

  return {
    monthlyRent,
    monthlyLiving,
    monthlyTotal,
    initialCosts,
    totalInitial,
    minimum: totalInitial + monthlyTotal * 2,
    comfortable: totalInitial + monthlyTotal * 4 + 5000,
    city,
  }
}

// ===== Parity Calculation =====
export function calculateParity(
  thaiMonthlySalary: number,
  exchangeRate: number
): ParityResult {
  const annualSalary = thaiMonthlySalary * 12
  const thaiTax = annualSalary > 750000 ? 0.2 : annualSalary > 500000 ? 0.15 : 0.1
  const ausTax = 0.25
  const thaiNetMonthly = thaiMonthlySalary * (1 - thaiTax)
  const colMultiplier = 2.2

  const requiredAusNet = (thaiNetMonthly * colMultiplier) / exchangeRate
  const requiredAusGross = requiredAusNet / (1 - ausTax)
  const requiredAusAnnual = Math.round(requiredAusGross * 12)

  return {
    thaiSalaryAnnual: annualSalary,
    thaiNetMonthly,
    requiredAusAnnual,
    zones: {
      tight: Math.round(requiredAusAnnual * 0.85),
      okay: requiredAusAnnual,
      comfortable: Math.round(requiredAusAnnual * 1.2),
      spacious: Math.round(requiredAusAnnual * 1.5),
    },
  }
}

// ===== Score Calculation (Quiet - for summary) =====
export function calculateScoreQuiet(
  age: string,
  englishLevel: string,
  experience: string,
  australianExperience: string,
  education: string,
  partnerStatus: string,
  australianStudy: boolean,
  stemQualification: boolean,
  professionalYear: boolean,
  naatiCertified: boolean,
  regionalStudy: boolean
): number {
  const agePoints = ageScore(age)
  const englishPoints = englishScore(englishLevel)
  const overseasExpPoints = overseasExperienceScore(experience)
  const australianExpPoints = australianExperienceScore(australianExperience)
  const workExpPoints = Math.min(overseasExpPoints + australianExpPoints, 20)
  const educationPoints = educationScore(education)
  const partnerPoints = partnerScore(partnerStatus)
  const australianStudyPoints = australianStudy ? 5 : 0
  const stemPoints = stemQualification ? 10 : 0
  const professionalYearPoints = professionalYear ? 5 : 0
  const naatiPoints = naatiCertified ? 5 : 0
  const regionalStudyPoints = regionalStudy ? 5 : 0
  
  return agePoints + englishPoints + workExpPoints + educationPoints + partnerPoints + 
         australianStudyPoints + stemPoints + professionalYearPoints + naatiPoints + regionalStudyPoints
}
