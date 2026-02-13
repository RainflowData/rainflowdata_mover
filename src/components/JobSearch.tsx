'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { occupations } from '@/data/occupations'
import type { Occupation } from '@/lib/types'

interface JobSearchProps {
  value: string
  specialization: string
  onSelect: (key: string, specialization: string) => void
}

export function JobSearch({ value, specialization, onSelect }: JobSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter occupations based on search query
  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return Object.entries(occupations)
      .filter(([, occ]) => {
        return (
          occ.title.toLowerCase().includes(q) ||
          occ.category.toLowerCase().includes(q) ||
          occ.skills.some((s) => s.toLowerCase().includes(q))
        )
      })
      .slice(0, 10)
  }, [query])

  // Get selected occupation info
  const selectedOcc = value ? occupations[value] : null

  // Popular occupations for quick select — IT/tech first (target audience)
  const popularKeys = [
    { key: 'dataEngineer', emoji: '💻', label: 'Data Engineer' },
    { key: 'softwareEngineer', emoji: '💻', label: 'Software Eng' },
    { key: 'mlEngineer', emoji: '🤖', label: 'ML/AI Eng' },
    { key: 'devopsEngineer', emoji: '☁️', label: 'DevOps' },
    { key: 'cybersecurityAnalyst', emoji: '🔒', label: 'Cybersecurity' },
    { key: 'registeredNurse', emoji: '🏥', label: 'Nurse' },
    { key: 'electrician', emoji: '🔧', label: 'Electrician' },
    { key: 'generalPractitioner', emoji: '👨‍⚕️', label: 'GP' },
    { key: 'civilEngineer', emoji: '⚙️', label: 'Civil Eng' },
    { key: 'secondaryTeacher', emoji: '📚', label: 'Teacher' },
  ]

  const handleSelect = (key: string) => {
    const occ = occupations[key]
    if (occ) {
      onSelect(key, occ.title)
      setQuery('')
      setIsOpen(false)
    }
  }

  const getDemandColor = (demand: string) => {
    if (demand === 'สูงมาก') return 'text-green-600'
    if (demand === 'สูง') return 'text-blue-600'
    if (demand === 'ปานกลาง') return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Search Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-gray-400 text-lg">🔍</span>
        </div>
        <input
          type="text"
          className="form-input pl-12 pr-4"
          placeholder="ค้นหาอาชีพ เช่น Engineer, Nurse, Developer..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => query && setIsOpen(true)}
        />

        {/* Search Results Dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-y-auto">
            {results.map(([key, occ]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSelect(key)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">
                      {occ.title}
                    </div>
                    <div className="text-xs text-gray-500">{occ.category}</div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold ${getDemandColor(occ.demand)}`}>
                      {occ.demand}
                    </span>
                    <div className="text-xs text-gray-400">
                      {occ.minPoints} pts
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {isOpen && query && results.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border p-4 text-center text-gray-500 text-sm">
            ไม่พบอาชีพที่ตรงกัน ลองค้นหาเป็นภาษาอังกฤษ
          </div>
        )}
      </div>

      {/* Popular Occupations */}
      <div>
        <p className="text-xs text-gray-500 mb-2">🔥 อาชีพยอดนิยม:</p>
        <div className="flex flex-wrap gap-2">
          {popularKeys.map(({ key, emoji, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSelect(key)}
              className={`pill transition-all ${
                value === key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Occupation Display */}
      {selectedOcc && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 animate-fade-in">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-bold text-blue-900 text-lg">{selectedOcc.title}</h4>
              <span className="text-xs text-blue-600">ANZSCO {selectedOcc.anzsco} · {selectedOcc.category}</span>
            </div>
            <span className={`text-sm font-bold ${getDemandColor(selectedOcc.demand)}`}>
              ⚡ ดีมานด์: {selectedOcc.demand}
            </span>
          </div>

          {/* Salary breakdown bar chart */}
          <div className="mb-3 bg-white/60 rounded-lg p-3 border border-blue-100">
            <div className="text-xs font-semibold text-gray-500 mb-2">💰 เงินเดือน (AUD/ปี)</div>
            {(() => {
              const { p10, median, p90 } = selectedOcc.salaryRange
              const max = p90 * 1.05
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-[65px] shrink-0">เริ่มต้น (p10)</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div className="bg-blue-300 h-full rounded-full" style={{ width: `${(p10 / max) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-600 w-[65px] text-right">${p10.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 w-[65px] shrink-0 font-semibold">ค่ากลาง</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(median / max) * 100}%` }} />
                    </div>
                    <span className="text-sm font-extrabold text-blue-700 w-[65px] text-right">${median.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-[65px] shrink-0">สูง (p90)</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div className="bg-blue-700 h-full rounded-full" style={{ width: `${(p90 / max) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-600 w-[65px] text-right">${p90.toLocaleString()}</span>
                  </div>
                </div>
              )
            })()}
            <div className="text-[9px] text-gray-400 mt-2">
              📊 ที่มา:{' '}
              <a href={selectedOcc.salarySourceUrl} target="_blank" rel="noopener noreferrer"
                className="text-blue-500 underline hover:text-blue-700">{selectedOcc.salarySource}</a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">🎯 คะแนนขั้นต่ำ (SkillSelect)</span>
              <p className="font-semibold text-gray-800">
                {selectedOcc.minPoints} คะแนน
                {selectedOcc.minPoints491 ? ` (491: ${selectedOcc.minPoints491})` : ''}
              </p>
            </div>
            <div>
              <span className="text-gray-500">📌 Shortage List</span>
              <p className="font-semibold text-gray-800">{selectedOcc.shortageList}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">🏠 เส้นทาง PR</span>
              <p className="font-semibold text-gray-800">{selectedOcc.pathToPR}</p>
            </div>
          </div>

          <div className="mt-3">
            <span className="text-xs text-gray-500">🛠️ ทักษะที่ต้องการ:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedOcc.skills.map((skill) => (
                <span key={skill} className="pill-blue text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-400">
            � {selectedOcc.pointsNote} ·{' '}
            <a href="https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect" target="_blank" rel="noopener noreferrer"
              className="text-blue-400 underline hover:text-blue-600">SkillSelect</a>
            {' '}· Demand: {selectedOcc.demandSource}
          </div>
        </div>
      )}
    </div>
  )
}
