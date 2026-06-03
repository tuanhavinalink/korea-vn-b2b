import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Korea-Vietnam B2B Trade Platform',
  description: 'Connect with leading Korean enterprises — browse catalogs, products, and schedule ZOOM meetings.',
  keywords: 'Korea B2B, Vietnam trade, Korean companies, business partnership',
  openGraph: {
    title: 'Korea-Vietnam B2B Trade Platform',
    description: 'Connect with leading Korean enterprises',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
