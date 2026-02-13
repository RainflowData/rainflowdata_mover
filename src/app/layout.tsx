import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-H2FX3V1CK6'

export const metadata: Metadata = {
  title: '🐱 Catto Migration Planner - วิเคราะห์ย้ายประเทศด้วยข้อมูลจริง',
  description:
    'วิเคราะห์ย้ายประเทศด้วยข้อมูลจริง เปรียบเทียบ 14 ประเทศ เงินเดือน ภาษี ค่าเช่า ค่าครองชีพ วีซ่า คะแนน ข้อมูลอัพเดท Feb 2026',
  keywords: ['migration', 'australia', 'visa', 'skilled worker', 'immigration'],
  manifest: `${basePath}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Migration',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#6FA8DD',
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        <link rel="apple-touch-icon" href={`${basePath}/rainflow.png`} />
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
      <body className="antialiased">
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="gtag-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
            </Script>
          </>
        )}
        {children}
      </body>
    </html>
  )
}
