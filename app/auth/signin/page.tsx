'use client'

import React from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Bug, LogIn } from 'lucide-react'
import { Button } from '../../../components/ui/button'

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Проверяем, не авторизован ли уже пользователь
    getSession().then((session) => {
      if (session) {
        router.push('/dashboard')
      }
    })
  }, [router])

  const handleSignIn = async () => {
    setLoading(true)
    try {
      await signIn('discord', { callbackUrl: '/dashboard' })
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
      <div className="text-center space-y-4">
        <Bug className="h-16 w-16 text-primary mx-auto" />
        <h1 className="text-4xl font-bold">BEBR Bugs</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          Войдите в систему управления багами через Discord
        </p>
      </div>

      <div className="bg-card border rounded-lg p-8 w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Вход в систему</h2>
            <p className="text-muted-foreground">
              Используйте ваш Discord аккаунт для входа
            </p>
          </div>

          <Button 
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3"
            size="lg"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span>Войти через Discord</span>
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Нажимая "Войти через Discord", вы соглашаетесь с использованием
              вашего Discord профиля для авторизации
            </p>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground max-w-2xl">
        <p>
          Система управления багами с автоматической интеграцией Discord каналов
          и удобной Kanban доской для отслеживания прогресса
        </p>
      </div>
    </div>
  )
} 