import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '../src/lib/auth'
import { redirect } from 'next/navigation'
import { Bug, BarChart3, Users, Clock } from 'lucide-react'
import { Button } from '../components/ui/button'
import Link from 'next/link'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="space-y-4">
          <Bug className="h-16 w-16 text-primary mx-auto" />
          <h1 className="text-4xl font-bold">BEBR Bugs</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Система управления багами с интеграцией Discord и Kanban доской
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mt-12">
          <div className="p-6 border rounded-lg bg-card">
            <BarChart3 className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Аналитика</h3>
            <p className="text-muted-foreground">
              Отслеживайте статистику багов и прогресс их исправления
            </p>
          </div>
          
          <div className="p-6 border rounded-lg bg-card">
            <Users className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Командная работа</h3>
            <p className="text-muted-foreground">
              Назначайте баги участникам команды и отслеживайте прогресс
            </p>
          </div>
          
          <div className="p-6 border rounded-lg bg-card">
            <Clock className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Discord интеграция</h3>
            <p className="text-muted-foreground">
              Автоматическое создание багов из Discord каналов
            </p>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-muted-foreground mb-4">
            Войдите через Discord, чтобы начать работу с системой
          </p>
        </div>
      </div>
    )
  }

  // Если пользователь авторизован, перенаправляем на дашборд
  redirect('/dashboard')
} 