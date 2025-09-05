import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../src/lib/auth'
import { redirect } from 'next/navigation'
import { BugService } from '../../src/services/BugService'
import { Bug, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react'
import { SyncButton } from '../../components/discord/SyncButton'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  const bugService = new BugService()
  const stats = await bugService.getStatistics()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Дашборд</h1>
          <p className="text-muted-foreground">
            Добро пожаловать, {session.user.name}
          </p>
        </div>
        <Link 
          href="/bugs/new"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Создать баг
        </Link>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Всего багов</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Bug className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Новые</p>
              <p className="text-2xl font-bold text-blue-600">{stats.byStatus.NEW}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">В работе</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.byStatus.IN_PROGRESS}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Закрыты</p>
              <p className="text-2xl font-bold text-green-600">{stats.byStatus.CLOSED}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Быстрые ссылки */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          href="/kanban"
          className="p-6 border rounded-lg bg-card hover:bg-accent transition-colors group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Bug className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Kanban доска</h3>
              <p className="text-sm text-muted-foreground">
                Управляйте багами на Kanban доске
              </p>
            </div>
          </div>
        </Link>

        <Link 
          href="/bugs"
          className="p-6 border rounded-lg bg-card hover:bg-accent transition-colors group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Все баги</h3>
              <p className="text-sm text-muted-foreground">
                Просмотр и управление всеми багами
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Discord Sync */}
      <div className="border rounded-lg bg-card">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Синхронизация с Discord</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Импортируйте новые баги из Discord каналов
          </p>
        </div>
        <div className="p-6">
          <SyncButton />
        </div>
      </div>

      {/* Последние баги */}
      <div className="border rounded-lg bg-card">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Последние баги</h2>
        </div>
        <div className="p-6">
          <p className="text-muted-foreground text-center">
            Здесь будет список последних багов...
          </p>
        </div>
      </div>
    </div>
  )
} 