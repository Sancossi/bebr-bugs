'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, User, Bug as BugIcon, Calendar, ExternalLink } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { ClickableImage } from '../../../components/ui/ClickableImage'

interface BugData {
  id: string
  title: string
  description?: string
  type: string
  status: string
  priority: string
  level?: string
  fps?: number
  screenshotUrl?: string
  discordMessageId?: string
  discordChannelId?: string
  reportedBy?: {
    name?: string
    image?: string
  }
  assignedTo?: {
    name?: string
    image?: string
  }
  createdAt: string
  updatedAt: string
}

const statusColors = {
  NEW: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  TESTING: 'bg-purple-100 text-purple-800',
  READY_TO_RELEASE: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  REQUIRES_DISCUSSION: 'bg-orange-100 text-orange-800',
  OUTDATED: 'bg-slate-100 text-slate-800'
}

const priorityColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800'
}

const typeColors = {
  Bug: 'bg-red-100 text-red-800',
  Feature: 'bg-blue-100 text-blue-800',
  Improvement: 'bg-green-100 text-green-800',
  Task: 'bg-purple-100 text-purple-800',
  Other: 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'NEW': return 'Новый'
    case 'IN_PROGRESS': return 'В работе'
    case 'TESTING': return 'Тестирование'
    case 'READY_TO_RELEASE': return 'Готов к релизу'
    case 'CLOSED': return 'Закрыт'
    case 'REQUIRES_DISCUSSION': return 'Требует обсуждения'
    case 'OUTDATED': return 'Устарел'
    default: return status
  }
}

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'CRITICAL': return 'Критический'
    case 'HIGH': return 'Высокий'
    case 'MEDIUM': return 'Средний'
    case 'LOW': return 'Низкий'
    default: return priority
  }
}

const getDiscordMessageUrl = (messageId: string, channelId?: string) => {
  const guildId = process.env.NEXT_PUBLIC_DISCORD_GUILD_ID || '1044024277634134116'
  const targetChannelId = channelId || process.env.NEXT_PUBLIC_DISCORD_DEFAULT_CHANNEL_ID || '1411777081804849325'
  return `https://discord.com/channels/${guildId}/${targetChannelId}/${messageId}`
}

export default function SteamIdSearchPage() {
  const { steamId } = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [bugs, setBugs] = useState<BugData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (steamId) {
      fetchBugsBySteamId(steamId as string)
    }
  }, [steamId])

  const fetchBugsBySteamId = async (steamIdParam: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/bugs/search/steam?steamId=${encodeURIComponent(steamIdParam)}`)
      
      if (!response.ok) {
        throw new Error('Ошибка поиска багов')
      }

      const data = await response.json()
      if (data.success) {
        setBugs(data.bugs || [])
      } else {
        throw new Error(data.error || 'Ошибка загрузки данных')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Загрузка...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <Button onClick={() => router.back()}>Назад</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок и навигация */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        
        <div className="flex items-center gap-3 mb-4">
          <User className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Баги пользователя</h1>
            <p className="text-gray-600 font-mono">Steam ID: {steamId}</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <BugIcon className="h-5 w-5" />
            <span className="font-semibold">
              Найдено багов: {bugs.length}
            </span>
          </div>
        </div>
      </div>

      {/* Список багов */}
      {bugs.length > 0 ? (
        <div className="space-y-4">
          {bugs.map((bug) => (
            <div
              key={bug.id}
              className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/bugs/${bug.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{bug.title}</h3>
                  {bug.description && (
                    <p className="text-gray-600 line-clamp-2 mb-3">{bug.description}</p>
                  )}
                </div>
                
                {bug.screenshotUrl && (
                  <div className="ml-4">
                    <ClickableImage
                      src={bug.screenshotUrl}
                      alt="Скриншот бага"
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[bug.status as keyof typeof statusColors]}`}>
                  {getStatusLabel(bug.status)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[bug.priority as keyof typeof priorityColors]}`}>
                  {getPriorityLabel(bug.priority)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeColors[bug.type as keyof typeof typeColors]}`}>
                  {bug.type}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(bug.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                  
                  {bug.level && (
                    <div>
                      Уровень: {bug.level}
                    </div>
                  )}
                </div>

                {bug.discordMessageId && (
                  <a
                    href={getDiscordMessageUrl(bug.discordMessageId, bug.discordChannelId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Discord
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BugIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Баги не найдены
          </h3>
          <p className="text-gray-500">
            Для данного Steam ID не найдено ни одного бага
          </p>
        </div>
      )}
    </div>
  )
} 