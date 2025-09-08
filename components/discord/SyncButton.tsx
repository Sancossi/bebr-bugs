'use client'

import React, { useState } from 'react'
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { Button } from '../ui/button'

interface SyncResult {
  success: boolean
  summary?: {
    total: number
    newBugs: number
    existingBugs: number
    updatedWithSteamId: number
    updatedImages: number
    errors: number
    timestamp: string
  }
  results?: Array<{
    messageId: string
    title: string
    status: 'created' | 'existing' | 'updated_with_steam_id' | 'updated_image' | 'updated_with_steam_id_and_image' | 'existing_no_steam_id' | 'error'
    bugId?: string
    steamId?: string
    imageUrl?: string
    error?: string
  }>
  error?: string
}

export function SyncButton({ onSyncComplete }: { onSyncComplete?: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<SyncResult | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleSync = async () => {
    setIsLoading(true)
    setLastSync(null)

    try {
      const response = await fetch('/api/discord/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result: SyncResult = await response.json()
      setLastSync(result)

      if (result.success && onSyncComplete) {
        onSyncComplete()
      }
    } catch (error) {
      console.error('Sync error:', error)
      setLastSync({
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'existing':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'updated_with_steam_id':
        return <CheckCircle className="h-4 w-4 text-purple-600" />
      case 'updated_image':
        return <CheckCircle className="h-4 w-4 text-cyan-600" />
      case 'updated_with_steam_id_and_image':
        return <CheckCircle className="h-4 w-4 text-indigo-600" />
      case 'existing_no_steam_id':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'created':
        return 'Создан'
      case 'existing':
        return 'Существует'
      case 'updated_with_steam_id':
        return 'Обновлен Steam ID'
      case 'updated_image':
        return 'Обновлено изображение'
      case 'updated_with_steam_id_and_image':
        return 'Обновлен Steam ID + изображение'
      case 'existing_no_steam_id':
        return 'Без Steam ID'
      case 'error':
        return 'Ошибка'
      default:
        return status
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Button
          onClick={handleSync}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>
            {isLoading ? 'Синхронизация...' : 'Синхронизировать из Discord'}
          </span>
        </Button>

        {lastSync && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Скрыть детали' : 'Показать детали'}
          </Button>
        )}
      </div>

      {lastSync && (
        <div className="bg-card border rounded-lg p-4">
          {lastSync.success ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Синхронизация успешно завершена
                </span>
              </div>

              {lastSync.summary && (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-semibold text-blue-800">
                      {lastSync.summary.total}
                    </div>
                    <div className="text-blue-600">Всего сообщений</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-semibold text-green-800">
                      {lastSync.summary.newBugs}
                    </div>
                    <div className="text-green-600">Новых багов</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="font-semibold text-yellow-800">
                      {lastSync.summary.existingBugs}
                    </div>
                    <div className="text-yellow-600">Существующих</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <div className="font-semibold text-purple-800">
                      {lastSync.summary.updatedWithSteamId}
                    </div>
                    <div className="text-purple-600">Обновлено Steam ID</div>
                  </div>
                  <div className="text-center p-2 bg-cyan-50 rounded">
                    <div className="font-semibold text-cyan-800">
                      {lastSync.summary.updatedImages}
                    </div>
                    <div className="text-cyan-600">Обновлено изображений</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="font-semibold text-red-800">
                      {lastSync.summary.errors}
                    </div>
                    <div className="text-red-600">Ошибок</div>
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Последняя синхронизация: {' '}
                {lastSync.summary?.timestamp && 
                  new Date(lastSync.summary.timestamp).toLocaleString('ru-RU')
                }
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">
                Ошибка синхронизации: {lastSync.error}
              </span>
            </div>
          )}

          {showDetails && lastSync.results && (
            <div className="mt-4 border-t pt-4">
              <h4 className="font-medium mb-3">Детали синхронизации:</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {lastSync.results.map((result, index) => (
                  <div
                    key={result.messageId}
                    className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      {getStatusIcon(result.status)}
                      <span className="font-medium truncate">
                        {result.title}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        result.status === 'created' ? 'bg-green-100 text-green-800' :
                        result.status === 'existing' ? 'bg-blue-100 text-blue-800' :
                        result.status === 'updated_with_steam_id' ? 'bg-purple-100 text-purple-800' :
                        result.status === 'updated_image' ? 'bg-cyan-100 text-cyan-800' :
                        result.status === 'updated_with_steam_id_and_image' ? 'bg-indigo-100 text-indigo-800' :
                        result.status === 'existing_no_steam_id' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {getStatusText(result.status)}
                      </span>
                      {result.steamId && (
                        <span className="text-xs text-muted-foreground font-mono">
                          Steam: {result.steamId}
                        </span>
                      )}
                      {result.imageUrl && (
                        <span className="text-xs text-muted-foreground">
                          🖼️ Изображение обновлено
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 