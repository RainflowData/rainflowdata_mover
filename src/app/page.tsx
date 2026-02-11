import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ChatSimulator } from '@/components/ChatSimulator'

export default function Home() {
  return (
    <main className="min-h-screen py-4 px-4">
      <div className="max-w-2xl mx-auto">
        <Header />
        <ChatSimulator />
        <Footer />
      </div>
    </main>
  )
}
