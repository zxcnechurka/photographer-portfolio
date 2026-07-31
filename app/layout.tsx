import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
})

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body',
})

const jbMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Ольга — Фотограф',
  description: 'Портфолио фотографа Ольги: свадьбы, портреты, семейные съёмки.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={`${cormorant.variable} ${inter.variable} ${jbMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}