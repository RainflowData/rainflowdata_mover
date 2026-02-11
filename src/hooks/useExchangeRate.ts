'use client'
import { useState, useEffect } from 'react'

export function useExchangeRate(fallback = 23) {
  const [rate, setRate] = useState(fallback)
  const [lastUpdate, setLastUpdate] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/AUD')
        const data = await res.json()
        if (data?.rates?.THB) {
          setRate(data.rates.THB)
          setLastUpdate(new Date().toLocaleDateString('th-TH'))
        }
      } catch {
        console.warn('⚠️ Could not fetch exchange rate, using default')
      } finally {
        setLoading(false)
      }
    }
    fetchRate()
  }, [])

  return { rate, lastUpdate, loading }
}
