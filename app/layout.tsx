import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// Rebuild trigger 5
import './globals.css'
import { Providers } from './providers'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Estin Blog - Share Your Thoughts',
  description: 'A platform for Estin students and teachers to share their blogs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-primary-50 dark:bg-primary-950 text-primary-900 dark:text-primary-100 min-h-screen flex flex-col`}>
        <Providers>
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
