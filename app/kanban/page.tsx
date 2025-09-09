'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'
import { Bug, TestTube, Play, CheckCircle, XCircle, Clock, MessageCircle, Archive, ChevronDown, ChevronUp } from 'lucide-react'
import { ClickableImage } from '../../components/ui/ClickableImage'

type BugData = {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  screenshotUrl: string | null
  reportedBy: {
    id: string
    name: string | null
    image: string | null
  }
  assignedTo?: {
    id: string
    name: string | null
    image: string | null
  } | null
}

const statusConfig = {
  NEW: {
    title: 'Новые',
    color: 'bg-red-50',
    headerColor: 'bg-red-100',
    iconColor: 'text-red-600',
    icon: Clock
  },
  IN_PROGRESS: {
    title: 'В работе',
    color: 'bg-blue-50',
    headerColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    icon: Play
  },
  TESTING: {
    title: 'На тестировании',
    color: 'bg-yellow-50',
    headerColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    icon: TestTube
  },
  READY_TO_RELEASE: {
    title: 'Готов к релизу',
    color: 'bg-green-50',
    headerColor: 'bg-green-100',
    iconColor: 'text-green-600',
    icon: CheckCircle
  },
  CLOSED: {
    title: 'Закрыт',
    color: 'bg-gray-50',
    headerColor: 'bg-gray-100',
    iconColor: 'text-gray-600',
    icon: XCircle
  },
  REQUIRES_DISCUSSION: {
    title: 'Требует обсуждения',
    color: 'bg-orange-50',
    headerColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
    icon: MessageCircle
  },
  OUTDATED: {
    title: 'Неактуальный',
    color: 'bg-slate-50',
    headerColor: 'bg-slate-100',
    iconColor: 'text-slate-600',
    icon: Archive
  }
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
  Improvement: 'bg-purple-100 text-purple-800',
  Task: 'bg-green-100 text-green-800',
  Network: 'bg-gray-100 text-gray-800',
  Other: 'bg-gray-100 text-gray-800'
}

function BugCard({ bug, onClick, onDragStart, onDragEnd, isDragging }: {
  bug: BugData;
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  const router = useRouter()
  
  return (
    <div
      className={`bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''
        }`}
      onClick={onClick}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', bug.id)
        onDragStart()
      }}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm line-clamp-2">{bug.title}</h4>
        <div className="flex space-x-1 ml-2">
          <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[bug.priority as keyof typeof priorityColors]}`}>
            {bug.priority}
          </span>
        </div>
      </div>

      {bug.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{bug.description}</p>
      )}

      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-1 text-xs rounded-full ${typeColors[bug.type as keyof typeof typeColors]}`}>
          {bug.type}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(bug.createdAt).toLocaleDateString('ru-RU')}
        </span>
      </div>

      {bug.screenshotUrl && (
        <div className="mb-2">
          <ClickableImage
            src={bug.screenshotUrl}
            alt="Screenshot"
            className="w-full h-20 object-cover rounded"
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        {bug.reportedBy && (
          <div className="flex items-center space-x-2">
            {bug.reportedBy.image && (
              <ClickableImage
                src={bug.reportedBy.image}
                alt={bug.reportedBy.name || 'User'}
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="text-xs text-gray-600">{bug.reportedBy.name}</span>
          </div>
        )}

        {bug.assignedTo && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">→</span>
            {bug.assignedTo.image && (
              <ClickableImage
                src={bug.assignedTo.image}
                alt={bug.assignedTo.name || 'User'}
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="text-xs text-gray-600">{bug.assignedTo.name}</span>
          </div>
        )}
      </div>

      {(bug as any).steamId && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">Steam ID:</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/steam/${(bug as any).steamId}`)
              }}
              className="text-blue-600 hover:text-blue-800 font-mono text-xs transition-colors underline decoration-dotted"
              title="Посмотреть все баги этого пользователя"
            >
              {(bug as any).steamId}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function KanbanColumn({ status, bugs, onBugClick, onDrop, draggedBugId, onDragStart, onDragEnd, isCollapsed, onToggleCollapse }: {
  status: string;
  bugs: BugData[];
  onBugClick: (bugId: string) => void;
  onDrop: (bugId: string, newStatus: string) => void;
  draggedBugId: string | null;
  onDragStart: (bugId: string) => void;
  onDragEnd: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const config = statusConfig[status as keyof typeof statusConfig]
  const Icon = config.icon
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const bugId = e.dataTransfer.getData('text/plain')
    if (bugId) {
      onDrop(bugId, status)
    }
  }

  return (
    <div
      className={`${config.color} border rounded-lg p-4 transition-all ${
        isCollapsed ? 'min-h-[100px] w-64' : 'min-h-[600px] w-80'
      } ${
        isDragOver ? 'border-dashed border-2 border-blue-400 bg-blue-50' : ''
      } ${draggedBugId ? 'border-dashed border-2' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`${config.headerColor} -m-4 mb-4 p-4 rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
            <h3 className="font-semibold text-gray-800">{config.title}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
              {bugs.length}
            </span>
            <button
              onClick={onToggleCollapse}
              className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
              title={isCollapsed ? 'Развернуть колонку' : 'Свернуть колонку'}
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronUp className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-3">
          {bugs.map((bug) => (
            <BugCard
              key={bug.id}
              bug={bug}
              onClick={() => onBugClick(bug.id)}
              onDragStart={() => onDragStart(bug.id)}
              onDragEnd={onDragEnd}
              isDragging={draggedBugId === bug.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function KanbanPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bugs, setBugs] = useState<Record<string, BugData[]>>({})
  const [loading, setLoading] = useState(true)
  const [draggedBugId, setDraggedBugId] = useState<string | null>(null)
  
  // Фильтры
  const [filterType, setFilterType] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [steamIdSearch, setSteamIdSearch] = useState('')
  
  // Сортировка
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Состояние сворачивания колонок
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/')
    }
  }, [status])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchKanbanData()
    }
  }, [status])

  const fetchKanbanData = async () => {
    try {
      const response = await fetch("/api/bugs/kanban")
      if (response.ok) {
        const result = await response.json()

        if (result.success && result.data) {
          setBugs(result.data)
        } else {
          console.error("Ошибка загрузки данных Kanban:", result.error)
        }
      }
    } catch (error) {
      console.error("Error fetching kanban data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBugClick = (bugId: string) => {
    router.push(`/bugs/${bugId}`)
  }

  const handleDrop = async (bugId: string, newStatus: string) => {
    try {
      // Находим текущий статус бага
      const currentBug = Object.values(bugs)
        .flat()
        .find(bug => bug.id === bugId)
      
      if (!currentBug || currentBug.status === newStatus) {
        return // Не нужно обновлять, если статус тот же
      }

      const response = await fetch(`/api/bugs/${bugId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (response.ok) {
        // Обновляем локальное состояние
        setBugs(prevBugs => {
          const newBugs = { ...prevBugs }

          // Находим баг в старой колонке и удаляем его
          Object.keys(newBugs).forEach(status => {
            newBugs[status] = newBugs[status].filter(bug => bug.id !== bugId)
          })

          // Добавляем баг в новую колонку
          const bugToMove = Object.values(prevBugs)
            .flat()
            .find(bug => bug.id === bugId)

          if (bugToMove) {
            if (!newBugs[newStatus]) {
              newBugs[newStatus] = []
            }
            newBugs[newStatus].push({ ...bugToMove, status: newStatus })
          }

          return newBugs
        })
        
        console.log(`✅ Баг ${bugId} перемещен в статус ${newStatus}`)
      } else {
        console.error('Ошибка обновления статуса бага')
      }
    } catch (error) {
      console.error('Error updating bug status:', error)
    }
  }

  const handleDragStart = (bugId: string) => {
    setDraggedBugId(bugId)
  }

  const handleDragEnd = () => {
    setDraggedBugId(null)
  }

  // Фильтрация багов
  const filterBugs = (bugsArray: BugData[]) => {
    return bugsArray.filter(bug => {
      const matchesType = !filterType || bug.type === filterType
      const matchesPriority = !filterPriority || bug.priority === filterPriority
      const matchesSteamId = !steamIdSearch || (bug as any).steamId?.includes(steamIdSearch)
      return matchesType && matchesPriority && matchesSteamId
    })
  }

  // Сортировка багов
  const sortBugs = (bugsArray: BugData[]) => {
    return [...bugsArray].sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        case 'updatedAt':
          aValue = new Date(a.updatedAt)
          bValue = new Date(b.updatedAt)
          break
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'priority':
          const priorityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }

  // Применение фильтрации и сортировки
  const processedBugs = (bugsArray: BugData[]) => {
    const filtered = filterBugs(bugsArray)
    return sortBugs(filtered)
  }

  // Управление сворачиванием колонок
  const toggleColumn = (status: string) => {
    setCollapsedColumns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(status)) {
        newSet.delete(status)
      } else {
        newSet.add(status)
      }
      return newSet
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kanban доска</h1>
        <p className="text-gray-600">Управляйте багами с помощью перетаскивания между колонками</p>
      </div>

      {/* Фильтры */}
      <div className="mb-6 flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Тип</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все типы</option>
            <option value="Bug">Bug</option>
            <option value="Feature">Feature</option>
            <option value="Improvement">Improvement</option>
            <option value="Task">Task</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Приоритет</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все приоритеты</option>
            <option value="LOW">Низкий</option>
            <option value="MEDIUM">Средний</option>
            <option value="HIGH">Высокий</option>
            <option value="CRITICAL">Критический</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Steam ID</label>
          <input
            type="text"
            value={steamIdSearch}
            onChange={(e) => setSteamIdSearch(e.target.value)}
            placeholder="Поиск по Steam ID..."
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Сортировка</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">По дате создания</option>
            <option value="updatedAt">По дате обновления</option>
            <option value="title">По названию</option>
            <option value="priority">По приоритету</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Порядок</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Убывание</option>
            <option value="asc">Возрастание</option>
          </select>
        </div>

        {(filterType || filterPriority || steamIdSearch) && (
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterType('')
                setFilterPriority('')
                setSteamIdSearch('')
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Очистить фильтры
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4">
        {Object.keys(statusConfig).map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            bugs={processedBugs(bugs[status] || [])}
            onBugClick={handleBugClick}
            onDrop={handleDrop}
            draggedBugId={draggedBugId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            isCollapsed={collapsedColumns.has(status)}
            onToggleCollapse={() => toggleColumn(status)}
          />
        ))}
      </div>
    </div>
  )
} 