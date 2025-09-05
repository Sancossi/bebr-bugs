'use client'

import React from 'react'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Bug, BarChart3, Settings, LogOut, LogIn } from 'lucide-react'
import { Button } from '../ui/button'

export function Navigation() {
  const { data: session, status } = useSession()

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 font-bold text-lg">
              <Bug className="h-6 w-6 text-primary" />
              <span>BEBR Bugs</span>
            </Link>
            
            {session && (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard" 
                  className="flex items-center space-x-1 text-sm hover:text-primary transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Дашборд</span>
                </Link>
                <Link 
                  href="/kanban" 
                  className="flex items-center space-x-1 text-sm hover:text-primary transition-colors"
                >
                  <Bug className="h-4 w-4" />
                  <span>Kanban</span>
                </Link>
                <Link 
                  href="/bugs" 
                  className="flex items-center space-x-1 text-sm hover:text-primary transition-colors"
                >
                  <Bug className="h-4 w-4" />
                  <span>Все баги</span>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            ) : session ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium">{session.user.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Выйти</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => signIn('discord')}
                className="flex items-center space-x-1"
              >
                <LogIn className="h-4 w-4" />
                <span>Войти через Discord</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 