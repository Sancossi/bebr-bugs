'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import { Bug, Filter, Search, Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { SyncButton } from '../../components/discord/SyncButton'

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
  Gameplay: 'bg-blue-100 text-blue-800',
  GameIdeas: 'bg-purple-100 text-purple-800',
  UI: 'bg-indigo-100 text-indigo-800',
  Performance: 'bg-red-100 text-red-800',
  Audio: 'bg-green-100 text-green-800',
  Graphics: 'bg-yellow-100 text-yellow-800',
  Network: 'bg-gray-100 text-gray-800',
  Other: 'bg-gray-100 text-gray-800'
}

function BugRow({ bug, onClick }: { bug: BugData; onClick: () => void }) {
  return (
    <tr className="border-b hover:bg-muted/50 cursor-pointer" onClick={onClick}>
      <td className="p-4">
        <div className="flex items-start space-x-3">
          {bug.screenshotUrl && (
            <img 
              src={bug.screenshotUrl} 
              alt="Screenshot" 
              className="w-12 h-12 object-cover rounded"
            />
          )}
          <div>
            <h4 className="font-medium text-sm">{bug.title}</h4>
            {bug.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {bug.description}
              </p>
            )}
          </div>
        </div>
      </td>
      
      <td className="p-4">
        <span className={`px-2 py-1 text-xs rounded-full ${typeColors[bug.type as keyof typeof typeColors]}`}>
          {bug.type}
        </span>
      </td>
      
      <td className="p-4">
        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[bug.status as keyof typeof statusColors]}`}>
          {bug.status.replace('_', ' ')}
        </span>
      </td>
      
      <td className="p-4">
        <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[bug.priority as keyof typeof priorityColors]}`}>
          {bug.priority}
        </span>
      </td>
      
      <td className="p-4 text-sm">
        {bug.level || '-'}
      </td>
      
      <td className="p-4">
        {bug.reportedBy && (
          <div className="flex items-center space-x-2">
            {bug.reportedBy.image && (
              <img 
                src={bug.reportedBy.image} 
                alt={bug.reportedBy.name || 'User'} 
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="text-xs">{bug.reportedBy.name}</span>
          </div>
        )}
      </td>
      
      <td className="p-4">
        {bug.assignedTo && (
          <div className="flex items-center space-x-2">
            {bug.assignedTo.image && (
              <img 
                src={bug.assignedTo.image} 
                alt={bug.assignedTo.name || 'User'} 
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="text-xs">{bug.assignedTo.name}</span>
          </div>
        )}
      </td>
      
      <td className="p-4 text-xs text-muted-foreground">
        {new Date(bug.createdAt).toLocaleDateString('ru-RU')}
      </td>
      
      <td className="p-4">
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

export default function BugsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bugs, setBugs] = useState<BugData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalBugs, setTotalBugs] = useState(0)
  const bugsPerPage = 20

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/')
    }
  }, [status])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBugs(1) // Сброс на первую страницу при изменении фильтров
    }
  }, [status, filterStatus, filterType, searchTerm])

  const fetchBugs = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: bugsPerPage.toString(),
      })
      
      if (filterStatus) params.append('status', filterStatus)
      if (filterType) params.append('type', filterType)
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`/api/bugs?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setBugs(data.data?.bugs || [])
        setTotalPages(data.data?.totalPages || 1)
        setTotalBugs(data.data?.total || 0)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Error fetching bugs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBugs = bugs // Убираем клиентскую фильтрацию, так как теперь фильтруем на сервере

  const handlePageChange = (page: number) => {
    fetchBugs(page)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Все баги</h1>
          <p className="text-muted-foreground">
            Управление и просмотр всех багов в системе
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Создать баг</span>
          </Button>
        </div>
      </div>

      {/* Discord Sync */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Синхронизация с Discord</h3>
        <SyncButton onSyncComplete={fetchBugs} />
      </div>

      {/* Фильтры и поиск */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Поиск багов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Все статусы</option>
            <option value="NEW">Новые</option>
            <option value="IN_PROGRESS">В работе</option>
            <option value="TESTING">Тестирование</option>
            <option value="READY_TO_RELEASE">Готов к релизу</option>
            <option value="CLOSED">Закрыты</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Все типы</option>
            <option value="Gameplay">Gameplay</option>
            <option value="GameIdeas">Game Ideas</option>
            <option value="UI">UI</option>
            <option value="Performance">Performance</option>
            <option value="Audio">Audio</option>
            <option value="Graphics">Graphics</option>
            <option value="Network">Network</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Таблица багов */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-medium">Баг</th>
                <th className="text-left p-4 font-medium">Тип</th>
                <th className="text-left p-4 font-medium">Статус</th>
                <th className="text-left p-4 font-medium">Приоритет</th>
                <th className="text-left p-4 font-medium">Уровень</th>
                <th className="text-left p-4 font-medium">Автор</th>
                <th className="text-left p-4 font-medium">Назначен</th>
                <th className="text-left p-4 font-medium">Создан</th>
                <th className="text-left p-4 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredBugs.length > 0 ? (
                filteredBugs.map((bug) => (
                  <BugRow 
                    key={bug.id} 
                    bug={bug} 
                    onClick={() => router.push(`/bugs/${bug.id}`)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-muted-foreground">
                    {searchTerm || filterStatus || filterType ? 
                      'Нет багов, соответствующих фильтрам' : 
                      'Багов пока нет. Синхронизируйте с Discord или создайте вручную.'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mb-6">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Предыдущая
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
              if (page > totalPages) return null
              
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              )
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Следующая
          </Button>
          
          <div className="text-sm text-muted-foreground ml-4">
            Страница {currentPage} из {totalPages} • Всего багов: {totalBugs}
          </div>
        </div>
      )}

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {bugs.filter(b => b.status === 'NEW').length}
          </div>
          <div className="text-sm text-muted-foreground">Новых багов</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {bugs.filter(b => b.status === 'IN_PROGRESS').length}
          </div>
          <div className="text-sm text-muted-foreground">В работе</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {bugs.filter(b => b.status === 'TESTING').length}
          </div>
          <div className="text-sm text-muted-foreground">На тестировании</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {bugs.filter(b => b.status === 'CLOSED').length}
          </div>
          <div className="text-sm text-muted-foreground">Закрыто</div>
        </div>
      </div>
    </div>
  )
} 