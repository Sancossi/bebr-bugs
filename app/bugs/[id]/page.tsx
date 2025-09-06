'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Button } from '../../../components/ui/button'
import { BugWithRelations, CommentWithAuthor } from '../../../src/types'

export default function BugDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [bug, setBug] = useState<BugWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [addingComment, setAddingComment] = useState(false)

  useEffect(() => {
    if (id) {
      fetchBug()
    }
  }, [id])

  const fetchBug = async () => {
    try {
      const response = await fetch(`/api/bugs/${id}`)
      if (!response.ok) {
        throw new Error('Баг не найден')
      }
      const result = await response.json()
      if (result.success && result.data) {
        setBug(result.data as BugWithRelations)
      } else {
        throw new Error(result.error ||  'Ошибка загрузки')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!bug) return

    try {
      const response = await fetch(`/api/bugs/${bug.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error('Ошибка обновления статуса')
      }

      setBug({ ...bug, status: newStatus as any })
    } catch (err) {
      console.error('Ошибка обновления статуса:', err)
    }
  }

  const handlePriorityChange = async (newPriority: string) => {
    if (!bug) return

    try {
      const response = await fetch(`/api/bugs/${bug.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priority: newPriority,
        }),
      })

      if (!response.ok) {
        throw new Error('Ошибка обновления приоритета')
      }

      setBug({ ...bug, priority: newPriority as any })
    } catch (err) {
      console.error('Ошибка обновления приоритета:', err)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !session?.user?.id) return

    setAddingComment(true)
    try {
      const response = await fetch(`/api/bugs/${bug?.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          authorId: session.user.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Ошибка добавления комментария')
      }

      const comment = await response.json()
      setBug(prev => prev ? {
        ...prev,
        comments: [comment, ...(prev.comments || [])]
      } : null)
      setNewComment('')
    } catch (err) {
      console.error('Ошибка добавления комментария:', err)
    } finally {
      setAddingComment(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-red-100 text-red-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'TESTING': return 'bg-blue-100 text-blue-800'
      case 'READY_TO_RELEASE': return 'bg-green-100 text-green-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      case 'REQUIRES_DISCUSSION': return 'bg-orange-100 text-orange-800'
      case 'OUTDATED': return 'bg-slate-100 text-slate-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500 text-white'
      case 'HIGH': return 'bg-orange-500 text-white'
      case 'MEDIUM': return 'bg-yellow-500 text-white'
      case 'LOW': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Загрузка...</div>
        </div>
      </div>
    )
  }

  if (error || !bug) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-600 text-lg mb-4">{error || 'Баг не найден'}</div>
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
          ← Назад
        </Button>
        <h1 className="text-3xl font-bold mb-2">{bug.title}</h1>
        <div className="flex gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bug.status)}`}>
            {getStatusLabel(bug.status)}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(bug.priority)}`}>
            {getPriorityLabel(bug.priority)}
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            {bug.type}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Описание */}
          {bug.description && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-3">Описание</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{bug.description}</p>
            </div>
          )}

          {/* Скриншот */}
          {bug.screenshotUrl && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-3">Скриншот</h2>
              <div className="relative">
                <Image
                  src={bug.screenshotUrl}
                  alt="Скриншот бага"
                  width={800}
                  height={450}
                  className="rounded-lg border"
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
            </div>
          )}

          {/* Техническая информация */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-3">Техническая информация</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {bug.level && (
                <div>
                  <span className="font-medium text-gray-600">Уровень:</span>
                  <span className="ml-2">{bug.level}</span>
                </div>
              )}
              {bug.playerPosition && (
                <div>
                  <span className="font-medium text-gray-600">Позиция игрока:</span>
                  <span className="ml-2 font-mono text-xs">{bug.playerPosition}</span>
                </div>
              )}
              {bug.cameraPosition && (
                <div>
                  <span className="font-medium text-gray-600">Позиция камеры:</span>
                  <span className="ml-2 font-mono text-xs">{bug.cameraPosition}</span>
                </div>
              )}
              {bug.cameraRotation && (
                <div>
                  <span className="font-medium text-gray-600">Поворот камеры:</span>
                  <span className="ml-2 font-mono text-xs">{bug.cameraRotation}</span>
                </div>
              )}
              {bug.fps && (
                <div>
                  <span className="font-medium text-gray-600">FPS:</span>
                  <span className="ml-2">{bug.fps}</span>
                </div>
              )}
              {bug.gpu && (
                <div>
                  <span className="font-medium text-gray-600">GPU:</span>
                  <span className="ml-2">{bug.gpu}</span>
                </div>
              )}
              {bug.cpu && (
                <div>
                  <span className="font-medium text-gray-600">CPU:</span>
                  <span className="ml-2">{bug.cpu}</span>
                </div>
              )}
              {bug.os && (
                <div>
                  <span className="font-medium text-gray-600">ОС:</span>
                  <span className="ml-2">{bug.os}</span>
                </div>
              )}
              {bug.ramTotal && (
                <div>
                  <span className="font-medium text-gray-600">RAM:</span>
                  <span className="ml-2">{bug.currentRam || 'N/A'} / {bug.ramTotal}</span>
                </div>
              )}
              {bug.vram && (
                <div>
                  <span className="font-medium text-gray-600">VRAM:</span>
                  <span className="ml-2">{bug.currentVram || 'N/A'} / {bug.vram}</span>
                </div>
              )}
            </div>
          </div>

          {/* Дополнительные данные */}
          {bug.customData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-3">Дополнительные данные</h2>
              <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                {typeof bug.customData === 'string' ? bug.customData : JSON.stringify(bug.customData, null, 2)}
              </pre>
            </div>
          )}

          {/* Комментарии */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Комментарии</h2>
            
            {/* Форма добавления комментария */}
            {session && (
              <div className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Добавить комментарий..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                  rows={3}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || addingComment}
                  className="mt-2"
                >
                  {addingComment ? 'Добавление...' : 'Добавить комментарий'}
                </Button>
              </div>
            )}

            {/* Список комментариев */}
            <div className="space-y-4">
              {!bug.comments || bug.comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Комментариев пока нет</p>
              ) : (
                bug.comments.map((comment: CommentWithAuthor) => (
                  <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {comment.author?.name || 'Аноним'}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {new Date(comment.createdAt).toLocaleString('ru-RU')}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                    {comment.attachmentUrl && (
                      <div className="mt-2">
                        <Image
                          src={comment.attachmentUrl}
                          alt="Вложение"
                          width={200}
                          height={200}
                          className="rounded border"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Управление статусом */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Статус</h3>
            <select
              value={bug.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="NEW">Новый</option>
              <option value="IN_PROGRESS">В работе</option>
              <option value="TESTING">Тестирование</option>
              <option value="READY_TO_RELEASE">Готов к релизу</option>
              <option value="CLOSED">Закрыт</option>
              <option value="REQUIRES_DISCUSSION">Требует обсуждения</option>
              <option value="OUTDATED">Устарел</option>
            </select>
          </div>

          {/* Управление приоритетом */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Приоритет</h3>
            <select
              value={bug.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="LOW">Низкий</option>
              <option value="MEDIUM">Средний</option>
              <option value="HIGH">Высокий</option>
              <option value="CRITICAL">Критический</option>
            </select>
          </div>

          {/* Информация о баге */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Информация</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">Создан:</span>
                <div className="text-gray-700">
                  {new Date(bug.createdAt).toLocaleString('ru-RU')}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Обновлён:</span>
                <div className="text-gray-700">
                  {new Date(bug.updatedAt).toLocaleString('ru-RU')}
                </div>
              </div>
              {bug.discordMessageId && (
                <div>
                  <span className="font-medium text-gray-600">Discord ID:</span>
                  <div className="text-gray-700 font-mono text-xs">
                    {bug.discordMessageId}
                  </div>
                </div>
              )}
              {bug.reportedBy && (
                <div>
                  <span className="font-medium text-gray-600">Автор:</span>
                  <div className="text-gray-700">
                    {bug.reportedBy.name}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 