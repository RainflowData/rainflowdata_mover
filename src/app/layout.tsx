import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '� Life After Migration - จำลองชีวิตหลังย้ายประเทศ',
  description:
    'จำลองชีวิตจริงหลังย้ายไปต่างประเทศ ภาษี ค่าเช่า ค่ากิน ค่ารถ เหลือเก็บเท่าไหร่ เทียบกับอยู่ไทย ข้อมูลอัพเดท Feb 2026',
  keywords: ['migration', 'australia', 'visa', 'skilled worker', 'immigration'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
