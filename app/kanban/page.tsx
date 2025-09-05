'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import { BugStatus, BugType } from '../../src/types'
import { Bug, BarChart3, Clock, CheckCircle, AlertTriangle, Zap } from 'lucide-react'

interface BugData {
  id: string
  title: string
  description?: string
  type: string
  status: string
  priority: string
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
}

const statusConfig = {
  NEW: {
    title: 'Новые',
    color: 'bg-blue-50 border-blue-200',
    headerColor: 'bg-blue-100',
    icon: AlertTriangle,
    iconColor: 'text-blue-600'
  },
  IN_PROGRESS: {
    title: 'В работе',
    color: 'bg-yellow-50 border-yellow-200',
    headerColor: 'bg-yellow-100',
    icon: Clock,
    iconColor: 'text-yellow-600'
  },
  TESTING: {
    title: 'Тестирование',
    color: 'bg-purple-50 border-purple-200',
    headerColor: 'bg-purple-100',
    icon: BarChart3,
    iconColor: 'text-purple-600'
  },
  READY_TO_RELEASE: {
    title: 'Готов к релизу',
    color: 'bg-green-50 border-green-200',
    headerColor: 'bg-green-100',
    icon: Zap,
    iconColor: 'text-green-600'
  },
  CLOSED: {
    title: 'Закрыты',
    color: 'bg-gray-50 border-gray-200',
    headerColor: 'bg-gray-100',
    icon: CheckCircle,
    iconColor: 'text-gray-600'
  }
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

function BugCard({ bug, onClick, onDragStart, onDragEnd, isDragging }: { 
  bug: BugData; 
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  return (
    <div 
      className={`bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer ${
        isDragging ? 'opacity-50 rotate-3 scale-105' : ''
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
          <img 
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
              <img 
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
              <img 
                src={bug.assignedTo.image} 
                alt={bug.assignedTo.name || 'User'} 
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="text-xs text-gray-600">{bug.assignedTo.name}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function KanbanColumn({ status, bugs, onBugClick, onDrop, draggedBugId, onDragStart, onDragEnd }: { 
  status: string; 
  bugs: BugData[];
  onBugClick: (bugId: string) => void;
  onDrop: (bugId: string, newStatus: string) => void;
  draggedBugId: string | null;
  onDragStart: (bugId: string) => void;
  onDragEnd: () => void;
}) {
  const config = statusConfig[status as keyof typeof statusConfig]
  const Icon = config.icon

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const bugId = e.dataTransfer.getData('text/plain')
    if (bugId && bugId !== draggedBugId) {
      onDrop(bugId, status)
    }
  }

  return (
    <div 
      className={`${config.color} border rounded-lg p-4 min-h-[600px] w-80 transition-colors ${
        draggedBugId ? 'border-dashed border-2' : ''
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className={`${config.headerColor} -m-4 mb-4 p-4 rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
            <h3 className="font-semibold text-gray-800">{config.title}</h3>
          </div>
          <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
            {bugs.length}
          </span>
        </div>
      </div>
      
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
    </div>
  )
}

export default function KanbanPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bugs, setBugs] = useState<Record<string, BugData[]>>({})
  const [loading, setLoading] = useState(true)
  const [draggedBugId, setDraggedBugId] = useState<string | null>(null)

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
      const response = await fetch('/api/bugs/kanban')
      if (response.ok) {
        const result = await response.json()

        if (result.success && result.data) {
          setBugs(result.data)
        } else {
          console.error(result.error || 'Ошибка загрузки')
        }
      }
    } catch (error) {
      console.error('Error fetching kanban data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBugClick = (bugId: string) => {
    router.push(`/bugs/${bugId}`)
  }

  const handleDrop = async (bugId: string, newStatus: string) => {
    try {
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
          <h1 className="text-3xl font-bold">Kanban доска</h1>
          <p className="text-muted-foreground">
            Управление багами по статусам
          </p>
        </div>
      </div>

      <div className="flex space-x-6 overflow-x-auto pb-6">
        {Object.keys(statusConfig).map((status) => (
          <KanbanColumn 
            key={status} 
            status={status} 
            bugs={bugs[status] || []} 
            onBugClick={handleBugClick}
            onDrop={handleDrop}
            draggedBugId={draggedBugId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>
    </div>
  )
} 