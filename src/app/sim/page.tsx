import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AuLifeSim } from '@/components/AuLifeSim'

export default function SimPage() {
  return (
    <main className="min-h-screen py-4 px-4">
      <div className="max-w-2xl mx-auto">
        <Header />
        <AuLifeSim />
        <Footer />
      </div>
    </main>
  )
}
