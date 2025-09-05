import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '../components/providers/SessionProvider'
import { Navigation } from '../components/layout/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BEBR Bugs - Система управления багами',
  description: 'Система управления багами с интеграцией Discord и Kanban доской',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <SessionProvider>
          <div className="min-h-screen bg-background">
            <Navigation />
            <main className="container mx-auto py-6 px-4">
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  )
} 