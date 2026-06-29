import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: { default: 'IT Новости', template: '%s | IT Новости' },
  description: 'Последние новости IT и технологий',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t mt-16 py-8 text-center text-sm text-gray-500">
          © 2026 IT Новости — SwiftStream
        </footer>
      </body>
    </html>
  )
}
