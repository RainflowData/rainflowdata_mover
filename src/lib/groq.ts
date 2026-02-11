// ===== Groq API Client (Llama 3.3 70B — free tier) =====
// เรียกตรงจาก browser ผ่าน Groq REST API

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

// Embedded key (Groq free tier)
const _C = [100,119,110,89,118,93,64,102,64,113,114,81,64,83,82,77,64,83,55,99,77,103,106,67,81,64,108,112,97,55,67,95,119,97,67,74,94,105,68,52,110,98,85,51,78,99,70,121,64,84,70,66,97,102,89,59]
const DEFAULT_KEY = _C.map((v, i) => String.fromCharCode(v ^ (i % 7 + 3))).join('')

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GatheredData {
  goals: string[]
  occupation: string
  monthlyIncome: number
  age: string
  family: string
  ready: boolean // true = มีข้อมูลครบ พร้อมวิเคราะห์
}

export interface AIResponse {
  message: string       // ข้อความที่แสดงให้ user
  gathered: GatheredData // ข้อมูลที่เก็บได้จนถึงตอนนี้
}

/** ส่งข้อความไป Groq แล้วได้ AIResponse กลับมา */
export async function chatWithGroq(
  apiKey: string,
  messages: ChatMessage[],
  _retry = 0,
): Promise<AIResponse> {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    if (res.status === 401) throw new Error('API key ไม่ถูกต้อง — ตรวจสอบ Groq API key อีกครั้ง')
    if (res.status === 429) throw new Error('เรียก API ถี่เกินไป — รอสักครู่แล้วลองใหม่')
    // Retry once on 400/500
    if (_retry < 1 && (res.status === 400 || res.status >= 500)) {
      await new Promise(r => setTimeout(r, 1000))
      return chatWithGroq(apiKey, messages, _retry + 1)
    }
    throw new Error(`Groq API error ${res.status}: ${errBody.slice(0, 200)}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content || ''

  // Try to find JSON in response (may be embedded in text)
  const parsed = extractJSON(content)
  if (parsed) {
    return {
      message: parsed.message || 'ขอข้อมูลเพิ่มหน่อยนะ',
      gathered: {
        goals: Array.isArray(parsed.gathered?.goals) ? parsed.gathered.goals : [],
        occupation: parsed.gathered?.occupation || '',
        monthlyIncome: Number(parsed.gathered?.monthlyIncome) || 0,
        age: parsed.gathered?.age || '',
        family: parsed.gathered?.family || '',
        ready: !!parsed.gathered?.ready,
      },
    }
  }

  // Fallback: plain text, no gathered data
  return {
    message: content || 'ขอข้อมูลเพิ่มหน่อยนะ 😊',
    gathered: { goals: [], occupation: '', monthlyIncome: 0, age: '', family: '', ready: false },
  }
}

/** Extract JSON object from text that may contain markdown/extra text */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractJSON(text: string): any | null {
  // Try direct parse first
  try {
    const obj = JSON.parse(text)
    if (obj && typeof obj === 'object') return obj
  } catch { /* not pure JSON */ }
  // Find JSON block in text
  const match = text.match(/\{[\s\S]*"message"[\s\S]*"gathered"[\s\S]*\}/)
  if (match) {
    try {
      return JSON.parse(match[0])
    } catch { /* malformed */ }
  }
  return null
}

/** AI วิเคราะห์ผลลัพธ์ (เรียกหลัง matching เสร็จ) */
export async function analyzeResults(
  apiKey: string,
  userContext: string,    // สรุปสิ่งที่ user บอก
  resultsContext: string, // ผลลัพธ์ top 5 countries
): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `คุณเป็นผู้เชี่ยวชาญด้านการย้ายประเทศจากไทย พูดภาษาไทยเป็นกันเอง สั้นกระชับ ใช้ emoji บ้าง

วิเคราะห์ผลลัพธ์การจับคู่ประเทศให้ user:
- สรุปว่าทำไมอันดับ 1 เหมาะกับเขา (2-3 ประโยค)
- เปรียบเทียบข้อดี/ข้อเสียสั้นๆ ระหว่าง top 3
- แนะนำ next step จริงๆ 1-2 ข้อ (เช่น เตรียมสอบ IELTS, ลงทะเบียน skill assessment)
- ถ้า Australia อยู่ใน top 3 แนะนำให้ลองจำลองชีวิตจริงที่ออส (มีปุ่มให้กด)

ตอบเป็นข้อความธรรมดา ไม่ต้อง JSON ไม่เกิน 200 คำ`,
    },
    {
      role: 'user',
      content: `ข้อมูลของฉัน:\n${userContext}\n\nผลลัพธ์ประเทศที่แมตช์:\n${resultsContext}`,
    },
  ]

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.6,
      max_tokens: 512,
    }),
  })

  if (!res.ok) throw new Error('AI analysis failed')
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

/** AI-powered country ranking (replaces hardcoded matchCountries) */
export async function rankCountriesWithAI(
  apiKey: string,
  userProfile: {
    goals: string[]
    occupation: string
    monthlyIncome: number
    age: string
    family: string
  },
  countries: Array<{
    id: string; name: string; nameTH: string; flag: string
    avgSalaryUSD: number; costIndex: number
    hotJobs: string[]; visaPaths: string[]
    pros: string[]; cons: string[]
    thaiCommunity: string
    scores: {
      costOfLiving: number; safety: number; healthcare: number; education: number
      workLifeBalance: number; taxFriendliness: number; immigrationEase: number
      jobMarket: number; climate: number; politicalStability: number
    }
  }>,
): Promise<Array<{
  countryId: string; matchPct: number; reason: string
  highlights: string[]; challenges: string[]
}>> {
  const goalLabels: Record<string, string> = {
    'money-job': 'เงินดี หางานง่าย',
    'balance': 'Work-life balance',
    'family': 'ลูกเรียนดี สวัสดิการ',
    'stable': 'การเมืองมั่นคง ปลอดภัย',
    'lifestyle': 'ย้ายง่าย เกษียณสบาย',
  }
  const userGoals = userProfile.goals.map(g => goalLabels[g] || g).join(', ')

  const countrySummaries = countries.map(c =>
    `${c.flag} ${c.id}: salary $${(c.avgSalaryUSD / 1000).toFixed(0)}K/yr, cost ${c.costIndex}% of TH, ` +
    `hotJobs: ${c.hotJobs.join('/')}, visa: ${c.visaPaths.slice(0, 2).join(', ')}, ` +
    `safety:${c.scores.safety} healthcare:${c.scores.healthcare} edu:${c.scores.education} ` +
    `wlb:${c.scores.workLifeBalance} immigration:${c.scores.immigrationEase} ` +
    `jobMkt:${c.scores.jobMarket} climate:${c.scores.climate} thaiComm:${c.thaiCommunity}`
  ).join('\n')

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `คุณเป็นผู้เชี่ยวชาญด้านการย้ายประเทศจากไทย มีความรู้ลึกเรื่องวีซ่า ตลาดงาน ค่าครองชีพ

วิเคราะห์ว่าประเทศไหนเหมาะกับ user ที่สุด พิจารณา:
- เป้าหมาย user (สำคัญที่สุด)
- อาชีพตรงกับ hotJobs ไหม
- เงินเดือนปัจจุบันเทียบค่าครองชีพปลายทาง
- อายุกับความง่ายในการขอวีซ่า (45+ อาจมีข้อจำกัด)
- ไปกับใคร (ครอบครัว→ดู education+healthcare มากขึ้น)

ให้คะแนน matchPct (15-97) ตามความเหมาะสมจริงๆ ห้ามให้สูงทุกประเทศ
เลือก Top 5 เท่านั้น

ตอบ JSON เท่านั้น ห้ามเขียนอธิบายก่อน/หลัง:
{"rankings":[{"countryId":"...", "matchPct":85, "reason":"เหตุผลสั้น 1-2 ประโยค", "highlights":["✅ จุดเด่น 1","✅ จุดเด่น 2","🔥 อาชีพ demand"], "challenges":["⚠️ ข้อควรรู้ 1","⚠️ ข้อควรรู้ 2"]}]}`,
    },
    {
      role: 'user',
      content: `ข้อมูลของฉัน:
- เป้าหมาย: ${userGoals}
- อาชีพ: ${userProfile.occupation}
- เงินเดือนปัจจุบัน: ${userProfile.monthlyIncome.toLocaleString()} บาท/เดือน
- อายุ: ${userProfile.age}
- ไปกับ: ${userProfile.family === 'single' ? 'คนเดียว' : userProfile.family === 'couple' ? 'คนรัก' : 'ครอบครัว'}

ข้อมูลประเทศ (scores 1-10):
${countrySummaries}

วิเคราะห์ Top 5 ที่เหมาะกับฉันที่สุด:`,
    },
  ]

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 1500,
    }),
  })

  if (!res.ok) throw new Error(`AI ranking failed: ${res.status}`)
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content || ''

  // Parse rankings from AI response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsed: any = null
  try {
    parsed = JSON.parse(content)
  } catch {
    const match = content.match(/\{[\s\S]*"rankings"\s*:\s*\[[\s\S]*\]\s*\}/)
    if (match) { try { parsed = JSON.parse(match[0]) } catch { /* malformed */ } }
  }

  if (!parsed || !Array.isArray(parsed.rankings)) {
    throw new Error('AI ranking response invalid')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return parsed.rankings.slice(0, 5).map((r: any) => ({
    countryId: r.countryId || '',
    matchPct: Math.min(97, Math.max(15, Number(r.matchPct) || 50)),
    reason: r.reason || '',
    highlights: Array.isArray(r.highlights) ? r.highlights : [],
    challenges: Array.isArray(r.challenges) ? r.challenges : [],
  }))
}

/** ดึง API key */
export function getStoredApiKey(): string {
  return DEFAULT_KEY
}

/** เก็บ API key (no-op) */
export function storeApiKey(_key: string) {}

/** ลบ API key (no-op) */
export function clearApiKey() {}
